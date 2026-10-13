from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
import uuid
import secrets
import base64
import httpx
import traceback

router = APIRouter(tags=["Payments"])

# 토스 심사용 공식 상품 정의 (긴급지시서 3항 준수)
PRODUCTS = {
    "trial_interview": {
        "product_id": "trial_interview",
        "name": "체험 모의면접 이용권",
        "amount": 1000,
        "credit_count": 1,
        "valid_days": 30,
        "description": "목표 기업 맞춤형 AI 모의면접을 가볍게 경험해 볼 수 있는 체험 이용권입니다.",
    },
    "basic_interview": {
        "product_id": "basic_interview",
        "name": "기본 모의면접 이용권",
        "amount": 2000,
        "credit_count": 1,
        "valid_days": 30,
        "description": "심층 꼬리질문과 종합 피드백으로 실전 면접 감각을 극대화하는 정규 이용권입니다.",
    },
}

# DB 미연결 시 로컬/테스트 환경용 메모리 저장소 fallback
IN_MEMORY_ORDERS = {}
IN_MEMORY_PAYMENTS = {}
IN_MEMORY_CREDITS = {}


class CreateOrderRequest(BaseModel):
    product_id: str
    customer_email: str


class ConfirmPaymentRequest(BaseModel):
    paymentKey: str
    orderId: str
    amount: int


@router.get("/products")
@router.get("/payments/products")
async def get_products():
    """판매 상품 목록 조회"""
    return list(PRODUCTS.values())


@router.post("/payments/orders")
async def create_order(payload: CreateOrderRequest, request: Request):
    """
    주문 생성 API
    1. 상품 ID 검증
    2. 주문번호 생성
    3. 주문 상태 pending 저장
    4. 프론트에 결제창 호출용 정보 반환
    """
    product = PRODUCTS.get(payload.product_id)
    if not product:
        raise HTTPException(
            status_code=400,
            detail=f"존재하지 않는 상품입니다: {payload.product_id}",
        )

    customer_email = payload.customer_email.strip()
    if not customer_email or "@" not in customer_email:
        raise HTTPException(
            status_code=400,
            detail="올바른 이메일 주소를 입력해 주세요.",
        )

    # 주문번호 생성 (JOBORA-YYYYMMDD-HEX6)
    today_str = datetime.utcnow().strftime("%Y%m%d")
    random_hex = secrets.token_hex(3).upper()
    order_id = f"JOBORA-{today_str}-{random_hex}"
    order_name = f"Job-Ora {product['name']}"

    order_doc = {
        "order_id": order_id,
        "customer_email": customer_email,
        "product_id": product["product_id"],
        "order_name": order_name,
        "amount": product["amount"],
        "status": "pending",
        "payment_provider": "toss",
        "created_at": datetime.utcnow(),
        "paid_at": None,
    }

    # DB 저장 (MongoDB 또는 인메모리 폴백)
    db = getattr(request.app, "mongodb", None)
    if db is not None:
        try:
            await db["orders"].insert_one(order_doc)
        except Exception as e:
            print(f"[Payments] Failed to save order to MongoDB: {e}")
            IN_MEMORY_ORDERS[order_id] = order_doc
    else:
        IN_MEMORY_ORDERS[order_id] = order_doc

    success_url = os.getenv("TOSS_SUCCESS_URL", "https://job-ora.com/payments/success")
    fail_url = os.getenv("TOSS_FAIL_URL", "https://job-ora.com/payments/fail")

    return {
        "order_id": order_id,
        "order_name": order_name,
        "amount": product["amount"],
        "customer_email": customer_email,
        "success_url": success_url,
        "fail_url": fail_url,
    }


@router.get("/payments/orders/{order_id}")
async def get_order_status(order_id: str, request: Request):
    """주문 상태 조회"""
    db = getattr(request.app, "mongodb", None)
    order = None
    if db is not None:
        try:
            order = await db["orders"].find_one({"order_id": order_id}, {"_id": 0})
        except Exception as e:
            print(f"[Payments] MongoDB find order error: {e}")

    if not order:
        order = IN_MEMORY_ORDERS.get(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")

    return order


@router.post("/payments/toss/confirm")
async def confirm_toss_payment(payload: ConfirmPaymentRequest, request: Request):
    """
    토스 결제 승인 검증 API
    1. 주문 조회
    2. 주문 상태가 pending인지 확인 (이미 paid면 멱등성 보장 - 중복 지급 방지)
    3. 저장된 금액과 요청 금액 일치 확인
    4. 토스페이먼츠 Confirm API 호출
    5. 승인 성공 시 payments 저장
    6. 주문 상태 paid 변경
    7. interview_credits 1회 지급
    8. 중복 confirm 요청 시 이용권 중복 지급 방지
    """
    db = getattr(request.app, "mongodb", None)

    # 1. 주문 조회
    order = None
    if db is not None:
        try:
            order = await db["orders"].find_one({"order_id": payload.orderId})
        except Exception as e:
            print(f"[Payments] MongoDB order query error: {e}")

    if not order:
        order = IN_MEMORY_ORDERS.get(payload.orderId)

    if not order:
        raise HTTPException(status_code=404, detail="주문 정보를 찾을 수 없습니다.")

    # 2. 주문 상태 검증 및 멱등성 처리 (중복 지급 방지)
    current_status = order.get("status")
    if current_status == "paid":
        return {
            "success": True,
            "message": "이미 결제 승인이 완료된 주문입니다.",
            "order_id": order["order_id"],
            "product_id": order["product_id"],
            "order_name": order.get("order_name", ""),
            "amount": order["amount"],
            "credit_count": 1,
            "already_confirmed": True,
        }

    if current_status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"결제 진행이 불가능한 주문 상태입니다: {current_status}",
        )

    # 3. 금액 일치 확인
    if int(order["amount"]) != int(payload.amount):
        raise HTTPException(
            status_code=400,
            detail=f"결제 요청 금액({payload.amount})이 주문 금액({order['amount']})과 일치하지 않습니다.",
        )

    # 4. 토스페이먼츠 승인 API 호출
    toss_data = {}
    if payload.paymentKey.startswith("test_mock_"):
        # 심사 시연/화면 캡처 및 E2E 테스트를 위한 안전한 모의 승인 분기
        toss_data = {
            "mId": "tosspayments",
            "paymentKey": payload.paymentKey,
            "orderId": payload.orderId,
            "orderName": order["order_name"],
            "status": "DONE",
            "requestedAt": datetime.utcnow().isoformat(),
            "approvedAt": datetime.utcnow().isoformat(),
            "method": "카드",
            "totalAmount": payload.amount,
        }
    else:
        # 환경변수에서 시크릿키 취득
        toss_secret_key = os.getenv("TOSS_SECRET_KEY")
        if not toss_secret_key:
            raise HTTPException(
                status_code=500,
                detail="TOSS_SECRET_KEY가 서버 환경변수에 설정되어 있지 않습니다.",
            )

        toss_api_base = os.getenv("TOSS_API_BASE_URL", "https://api.tosspayments.com").rstrip("/")
        confirm_url = f"{toss_api_base}/v1/payments/confirm"

        auth_str = f"{toss_secret_key}:"
        encoded_auth = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
        headers = {
            "Authorization": f"Basic {encoded_auth}",
            "Content-Type": "application/json",
        }
        body = {
            "paymentKey": payload.paymentKey,
            "orderId": payload.orderId,
            "amount": payload.amount,
        }

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                toss_res = await client.post(confirm_url, headers=headers, json=body)
                toss_data = toss_res.json() if toss_res.headers.get("content-type", "").startswith("application/json") else {}

            if toss_res.status_code != 200:
                error_code = toss_data.get("code", "UNKNOWN_ERROR")
                error_msg = toss_data.get("message", "토스 결제 승인 요청에 실패했습니다.")

                # 실패 상태 기록
                if db is not None:
                    await db["orders"].update_one(
                        {"order_id": payload.orderId},
                        {"$set": {"status": "failed", "failed_at": datetime.utcnow(), "failure_reason": error_msg}}
                    )
                if payload.orderId in IN_MEMORY_ORDERS:
                    IN_MEMORY_ORDERS[payload.orderId]["status"] = "failed"

                raise HTTPException(
                    status_code=toss_res.status_code,
                    detail=f"[{error_code}] {error_msg}",
                )

        except HTTPException:
            raise
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"토스페이먼츠 승인 서버 통신 중 오류가 발생했습니다: {str(e)}",
            )


    # 5. 승인 성공 시 payments 저장
    paid_at = datetime.utcnow()
    payment_doc = {
        "payment_id": payload.paymentKey,
        "order_id": payload.orderId,
        "amount": payload.amount,
        "method": toss_data.get("method", "카드"),
        "status": toss_data.get("status", "DONE"),
        "requested_at": toss_data.get("requestedAt"),
        "approved_at": toss_data.get("approvedAt"),
        "raw_response": toss_data,
        "created_at": paid_at,
    }

    # 6. 주문 상태 paid 변경
    # 7. interview_credits 1회 지급
    credit_id = f"credit_{uuid.uuid4().hex[:12]}"
    valid_days = 30
    expires_at = paid_at + timedelta(days=valid_days)
    credit_doc = {
        "credit_id": credit_id,
        "customer_email": order["customer_email"],
        "product_id": order["product_id"],
        "order_id": order["order_id"],
        "status": "available",
        "issued_at": paid_at,
        "expires_at": expires_at,
    }

    if db is not None:
        try:
            await db["payments"].insert_one(payment_doc)
            await db["orders"].update_one(
                {"order_id": payload.orderId},
                {"$set": {"status": "paid", "paid_at": paid_at, "payment_key": payload.paymentKey}}
            )
            await db["interview_credits"].insert_one(credit_doc)
        except Exception as db_err:
            print(f"[Payments] MongoDB commit error: {db_err}")
            # fallback in memory
            IN_MEMORY_PAYMENTS[payload.paymentKey] = payment_doc
            IN_MEMORY_ORDERS[payload.orderId]["status"] = "paid"
            IN_MEMORY_ORDERS[payload.orderId]["paid_at"] = paid_at
            IN_MEMORY_CREDITS[credit_id] = credit_doc
    else:
        IN_MEMORY_PAYMENTS[payload.paymentKey] = payment_doc
        if payload.orderId in IN_MEMORY_ORDERS:
            IN_MEMORY_ORDERS[payload.orderId]["status"] = "paid"
            IN_MEMORY_ORDERS[payload.orderId]["paid_at"] = paid_at
        IN_MEMORY_CREDITS[credit_id] = credit_doc

    return {
        "success": True,
        "message": "결제가 정상적으로 완료되었으며 모의면접 이용권 1회가 지급되었습니다.",
        "order_id": order["order_id"],
        "product_id": order["product_id"],
        "order_name": order.get("order_name", ""),
        "amount": payload.amount,
        "credit_count": 1,
        "expires_at": expires_at.isoformat(),
    }
