from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
import uuid
import secrets
import base64
import httpx
import traceback
from pymongo.errors import DuplicateKeyError

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

# DB 미연결 시 로컬/테스트 환경용 메모리 저장소 fallback (단, 결제/승인/이용권은 DB 필수)
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
    orderToken: str = ""


class VerifyCreditRequest(BaseModel):
    credit_token: str


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
    3. 비회원 검증용 order_token 생성
    4. 주문 상태 pending 저장 (DB 필수)
    5. 프론트에 결제창 호출용 정보 및 order_token 반환
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
    order_token = f"ordtok_{secrets.token_urlsafe(32)}"
    order_name = f"Job-Ora {product['name']}"

    order_doc = {
        "order_id": order_id,
        "order_token": order_token,
        "customer_email": customer_email,
        "product_id": product["product_id"],
        "order_name": order_name,
        "amount": product["amount"],
        "status": "pending",
        "payment_provider": "toss",
        "created_at": datetime.utcnow(),
        "paid_at": None,
    }

    # DB 저장 (결제 무결성을 위해 DB 연결 필수)
    db = getattr(request.app, "mongodb", None)
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="데이터베이스 연결을 사용할 수 없어 주문을 생성할 수 없습니다.",
        )

    try:
        await db["orders"].insert_one(order_doc)
    except Exception as e:
        print(f"[Payments] Failed to save order to MongoDB: {e}")
        raise HTTPException(
            status_code=500,
            detail="주문 저장 중 데이터베이스 오류가 발생했습니다.",
        )

    success_url = os.getenv("TOSS_SUCCESS_URL", "https://job-ora.com/payments/success")
    fail_url = os.getenv("TOSS_FAIL_URL", "https://job-ora.com/payments/fail")

    return {
        "order_id": order_id,
        "order_token": order_token,
        "order_name": order_name,
        "amount": product["amount"],
        "customer_email": customer_email,
        "success_url": success_url,
        "fail_url": fail_url,
    }


@router.get("/payments/orders/{order_id}")
async def get_order_status(order_id: str, request: Request):
    """주문 상태 조회 - order_token 소유권 검증 필수 및 민감정보 마스킹"""
    db = getattr(request.app, "mongodb", None)
    if db is None:
        raise HTTPException(status_code=503, detail="데이터베이스 연결을 사용할 수 없습니다.")

    order_token = request.query_params.get("order_token") or request.headers.get("X-Order-Token")

    try:
        order = await db["orders"].find_one({"order_id": order_id})
    except Exception as e:
        print(f"[Payments] MongoDB find order error: {e}")
        raise HTTPException(status_code=500, detail="주문 조회 중 오류가 발생했습니다.")

    if not order:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")

    # 권한 검증: order_token이 누락되거나 일치하지 않으면 403 거부
    if not order_token or order_token != order.get("order_token"):
        raise HTTPException(
            status_code=403,
            detail="주문 소유권 인증 토큰이 누락되었거나 일치하지 않습니다.",
        )

    # 명시적으로 허용된 안전한 필드만 반환 (고객 이메일 마스킹)
    email = order.get("customer_email", "")
    masked_email = ""
    if "@" in email:
        parts = email.split("@", 1)
        masked_user = parts[0][:2] + "***" if len(parts[0]) >= 2 else "***"
        masked_email = f"{masked_user}@{parts[1]}"

    return {
        "order_id": order["order_id"],
        "product_id": order.get("product_id"),
        "order_name": order.get("order_name"),
        "amount": order.get("amount"),
        "status": order.get("status"),
        "customer_email_masked": masked_email,
        "created_at": order["created_at"].isoformat() if isinstance(order.get("created_at"), datetime) else str(order.get("created_at") or ""),
        "paid_at": order["paid_at"].isoformat() if isinstance(order.get("paid_at"), datetime) else str(order.get("paid_at") or "") if order.get("paid_at") else None,
    }


@router.post("/payments/credits/verify")
async def verify_credit(payload: VerifyCreditRequest, request: Request):
    """
    비회원 이용권 유효성 및 권한 검증 API
    추측 불가능한 credit_token으로만 조회 가능
    """
    db = getattr(request.app, "mongodb", None)
    if db is None:
        raise HTTPException(status_code=503, detail="데이터베이스 연결을 사용할 수 없습니다.")

    token = payload.credit_token.strip()
    if not token:
        raise HTTPException(status_code=400, detail="이용권 인증 토큰이 필요합니다.")

    try:
        credit = await db["interview_credits"].find_one({"credit_token": token})
    except Exception as e:
        print(f"[Payments] Credit verify DB error: {e}")
        raise HTTPException(status_code=500, detail="이용권 확인 중 데이터베이스 오류가 발생했습니다.")

    if not credit:
        raise HTTPException(status_code=403, detail="유효하지 않은 이용권 인증 토큰입니다.")

    now = datetime.utcnow()
    is_expired = credit["expires_at"] < now if credit.get("expires_at") else False

    email = credit.get("customer_email", "")
    masked_email = ""
    if "@" in email:
        parts = email.split("@", 1)
        masked_user = parts[0][:2] + "***" if len(parts[0]) >= 2 else "***"
        masked_email = f"{masked_user}@{parts[1]}"

    session_status = None
    is_resumable = False
    is_finished = False
    session_id = credit.get("session_id")
    if session_id:
        sess = await db["sessions"].find_one({"session_id": session_id})
        if sess:
            is_finished = bool(sess.get("is_finished", False))
            is_resumable = not is_finished
            session_status = "completed" if is_finished else "in_progress"

    # valid 판단:
    # 1. 미사용 이용권: status in ("available", "reserved") and not is_expired
    # 2. 진행 중 세션 또는 완료 결과 재접속 가능한 이용권: status == "used" and session_id 존재
    is_valid = not is_expired and (
        credit.get("status") in ("available", "reserved") or
        (credit.get("status") == "used" and bool(credit.get("session_id")))
    )

    return {
        "valid": is_valid,
        "credit_id": credit["credit_id"],
        "status": "expired" if is_expired else credit.get("status", "available"),
        "product_id": credit.get("product_id"),
        "customer_email_masked": masked_email,
        "expires_at": credit["expires_at"].isoformat() if credit.get("expires_at") else None,
        "session_id": session_id,
        "session_status": session_status,
        "can_resume": is_resumable,
        "is_finished": is_finished,
    }


async def issue_or_get_credit_for_paid_order(db, order: dict, paid_at: datetime) -> dict:
    """
    정상 결제된 주문에 대해 원자적으로 이용권을 발급하거나 기존 이용권을 반환하는 단일 경로.
    최초 지급과 동시 재시도/복구가 경쟁하더라도 단 1개의 이용권 및 동일 토큰만 발급되도록 보장.
    """
    existing_credit = await db["interview_credits"].find_one({"order_id": order["order_id"]})
    if existing_credit:
        return existing_credit

    credit_id = f"credit_{uuid.uuid4().hex[:12]}"
    credit_token = f"crdtok_{secrets.token_urlsafe(32)}"
    expires_at = paid_at + timedelta(days=30)
    credit_doc = {
        "credit_id": credit_id,
        "credit_token": credit_token,
        "customer_email": order["customer_email"],
        "product_id": order["product_id"],
        "order_id": order["order_id"],
        "status": "available",
        "issued_at": paid_at,
        "expires_at": expires_at,
        "reserved_at": None,
        "reserved_session_id": None,
        "used_at": None,
        "session_id": None,
    }

    try:
        await db["interview_credits"].update_one(
            {"order_id": order["order_id"]},
            {"$setOnInsert": credit_doc},
            upsert=True
        )
    except DuplicateKeyError:
        # 동시성 경합으로 타 요청이 먼저 고유 인덱스(order_id)에 문서를 삽입한 경우:
        # 안전하게 기존 문서를 조회하여 동일 이용권으로 수렴
        pass
    except Exception as db_err:
        print(f"[Payments] MongoDB upsert credit error: {db_err}")
        raise HTTPException(
            status_code=500,
            detail="이용권 영속 저장 처리 중 데이터베이스 오류가 발생했습니다. 동일 주문으로 재시도하시면 안전하게 복구 지급됩니다.",
        )

    credit = await db["interview_credits"].find_one({"order_id": order["order_id"]})
    if not credit:
        raise HTTPException(status_code=500, detail="승인 완료된 이용권 조회에 실패했습니다.")
    return credit


@router.post("/payments/toss/confirm")
async def confirm_toss_payment(payload: ConfirmPaymentRequest, request: Request):
    """
    토스 결제 승인 검증 API
    1. 주문 조회 및 DB 연결 검증
    2. 소유권(orderToken) 및 금액 일치 검증
    3. 이미 paid인 경우 소유권 및 결제키 검증 후 멱등/복구 반환
    4. pending 주문인 경우 토스페이먼츠 공식 Confirm API 호출
    5. 승인 성공 시 원자적 상태 변경 및 이용권(credit_token 포함) 1회 발급
    """
    db = getattr(request.app, "mongodb", None)
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="데이터베이스 연결을 사용할 수 없어 결제 검증 및 이용권 발급을 처리할 수 없습니다.",
        )

    # 1. 주문 조회
    try:
        order = await db["orders"].find_one({"order_id": payload.orderId})
    except Exception as e:
        print(f"[Payments] MongoDB order query error: {e}")
        raise HTTPException(status_code=500, detail="주문 정보 조회 중 오류가 발생했습니다.")

    if not order:
        raise HTTPException(status_code=404, detail="주문 정보를 찾을 수 없습니다.")

    # 2. 주문 소유권 검증 (최초 승인 및 재시도 모두 적용 - orderToken 필수)
    token = payload.orderToken.strip() if payload.orderToken else ""
    if not token or token != order.get("order_token"):
        raise HTTPException(
            status_code=403,
            detail="주문 소유권 인증 토큰이 누락되었거나 일치하지 않습니다.",
        )

    # 3. 금액 일치 확인
    if int(order["amount"]) != int(payload.amount):
        raise HTTPException(
            status_code=400,
            detail=f"결제 요청 금액({payload.amount})이 주문 금액({order['amount']})과 일치하지 않습니다.",
        )

    # 4. 주문 상태 검증 및 멱등성 / 복구 처리 (중복 지급 방지)
    current_status = order.get("status")
    if current_status == "paid":
        # 결제 식별자 일치 검증 (다른 결제키로 재호출 시 차단)
        if order.get("payment_key") and payload.paymentKey != order.get("payment_key"):
            raise HTTPException(
                status_code=403,
                detail="이미 승인된 주문의 결제 식별자(paymentKey)와 일치하지 않습니다.",
            )

        paid_at = order.get("paid_at") or datetime.utcnow()
        credit = await issue_or_get_credit_for_paid_order(db, order, paid_at)

        credit_id = credit["credit_id"]
        credit_token = credit["credit_token"]
        expires_at_val = credit["expires_at"]
        expires_at_str = expires_at_val.isoformat() if isinstance(expires_at_val, datetime) else str(expires_at_val or "")

        return {
            "success": True,
            "message": "이미 결제 승인이 완료된 주문입니다.",
            "order_id": order["order_id"],
            "credit_id": credit_id,
            "credit_token": credit_token,
            "product_id": order["product_id"],
            "order_name": order.get("order_name", ""),
            "amount": order["amount"],
            "credit_count": 1,
            "expires_at": expires_at_str,
            "already_confirmed": True,
        }

    if current_status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"결제 진행이 불가능한 주문 상태입니다: {current_status}",
        )

    # 5. 토스페이먼츠 승인 API 호출 (공식 PG 호출)
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

            # 실패 상태 기록: pending 상태일 때만 갱신하여 이미 승인 성공(paid)된 주문을 지연 도착 오류가 덮어쓰지 않음
            await db["orders"].update_one(
                {"order_id": payload.orderId, "status": "pending"},
                {"$set": {"status": "failed", "failed_at": datetime.utcnow(), "failure_reason": error_msg}}
            )

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

    # 6. 승인 성공 시 payments 저장 및 원자적 이용권 발급
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

    # 원자적 상태 변경으로 동시 중복 승인 방지
    update_res = await db["orders"].update_one(
        {"order_id": payload.orderId, "status": "pending"},
        {"$set": {"status": "paid", "paid_at": paid_at, "payment_key": payload.paymentKey}}
    )

    if update_res.modified_count == 1:
        # 최초 1회 정상 지급: 결제 이력 저장 후 단일 이용권 지급 경로 호출
        try:
            await db["payments"].insert_one(payment_doc)
        except Exception as p_err:
            print(f"[Payments] MongoDB payment insert error: {p_err}")

        credit = await issue_or_get_credit_for_paid_order(db, order, paid_at)
    else:
        # 동시 요청이 먼저 주문 상태를 갱신한 경우: 최신 주문 정보로 단일 이용권 지급 경로 호출
        order = await db["orders"].find_one({"order_id": payload.orderId}) or order
        paid_at = order.get("paid_at") or paid_at
        credit = await issue_or_get_credit_for_paid_order(db, order, paid_at)

    credit_id = credit["credit_id"]
    credit_token = credit["credit_token"]
    expires_at = credit["expires_at"]

    return {
        "success": True,
        "message": "결제가 정상적으로 완료되었으며 모의면접 이용권 1회가 지급되었습니다.",
        "order_id": order["order_id"],
        "credit_id": credit_id,
        "credit_token": credit_token,
        "product_id": order["product_id"],
        "order_name": order.get("order_name", ""),
        "amount": payload.amount,
        "credit_count": 1,
        "expires_at": expires_at.isoformat() if isinstance(expires_at, datetime) else str(expires_at),
    }

