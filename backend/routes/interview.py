from fastapi import APIRouter, HTTPException, Request
from services.llm_proxy import get_interview_questions, get_followup_question
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
import secrets
import uuid
import hashlib
import traceback

router = APIRouter(prefix="/interview", tags=["Interview"])


class StartInterviewRequest(BaseModel):
    credit_token: str
    jd_text: str
    resume_text: str
    company_name: str = ""
    ideal_candidate_profile: str = ""


@router.post("/start")
async def start_interview(payload: StartInterviewRequest, request: Request):
    """
    모의면접 시작 API
    1. 비회원 이용권 토큰(credit_token) 유효성 검증
    2. 중복 방지를 위한 원자적 상태 전이: available -> reserved
    3. AI 최초 질문 생성 호출
    4. AI 실패 시 available로 즉시 롤백 (이용권 보존)
    5. AI 성공 시 used 확정 및 면접 세션(session_id, session_token) 발급
    """
    db = getattr(request.app, "mongodb", None)
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="데이터베이스 연결을 사용할 수 없어 면접을 시작할 수 없습니다.",
        )

    token = payload.credit_token.strip()
    if not token:
        raise HTTPException(
            status_code=400,
            detail="이용권 인증 토큰(credit_token)이 필요합니다.",
        )

    # 1. 이용권 조회
    try:
        credit = await db["interview_credits"].find_one({"credit_token": token})
    except Exception as db_err:
        print(f"[Interview] Credit lookup DB error: {db_err}")
        raise HTTPException(status_code=500, detail="이용권 조회 중 데이터베이스 오류가 발생했습니다.")

    if not credit:
        raise HTTPException(
            status_code=403,
            detail="유효하지 않은 이용권 인증 토큰입니다. 결제 내역을 확인해 주세요.",
        )

    now = datetime.utcnow()

    # 이미 사용된 이용권인 경우: 멱등 재연결 및 중단 복구 확인
    if credit.get("status") == "used":
        session_id = credit.get("session_id")
        if session_id:
            existing_session = await db["sessions"].find_one({"session_id": session_id})
            if not existing_session:
                # [복구] 이전 프로세스 중단으로 세션 저장이 누락된 경우: 이용권에 보존된 맥락으로 세션 복구 저장
                session_token = credit.get("session_token") or f"sesstok_{secrets.token_urlsafe(32)}"
                recovered_session = {
                    "session_id": session_id,
                    "session_token": session_token,
                    "credit_id": credit["credit_id"],
                    "customer_email": credit.get("customer_email"),
                    "company_name": credit.get("company_name", payload.company_name),
                    "jd_text": credit.get("jd_text", payload.jd_text),
                    "resume_text": credit.get("resume_text", payload.resume_text),
                    "ideal_candidate_profile": credit.get("ideal_candidate_profile", payload.ideal_candidate_profile),
                    "created_at": credit.get("used_at") or now,
                    "questions_generated": credit.get("questions_generated") or [],
                    "is_finished": False,
                }
                try:
                    await db["sessions"].insert_one(recovered_session)
                    existing_session = recovered_session
                except Exception as rec_err:
                    print(f"[Interview] Recover session DB error: {rec_err}")

            if existing_session and existing_session.get("questions_generated"):
                response_data = {
                    "session_id": session_id,
                    "session_token": credit.get("session_token", "") or existing_session.get("session_token", ""),
                    "questions": existing_session["questions_generated"],
                    "reconnected": True,
                    "is_finished": bool(existing_session.get("is_finished", False)),
                }
                if existing_session.get("is_finished"):
                    response_data.update({
                        "scores": existing_session.get("scores"),
                        "evaluation": existing_session.get("evaluation", ""),
                        "better_answer": existing_session.get("better_answer", ""),
                        "culture_fit_breakdown": existing_session.get("culture_fit_breakdown"),
                        "qa_report": existing_session.get("qa_report", []),
                        "history": existing_session.get("history", []),
                    })
                else:
                    first_q = existing_session["questions_generated"][0]
                    first_q_text = first_q if isinstance(first_q, str) else first_q.get("question", "")
                    response_data.update({
                        "history": existing_session.get("history", []),
                        "current_question": existing_session.get("current_question") or first_q_text,
                        "last_evaluation": existing_session.get("last_evaluation"),
                        "last_better_answer": existing_session.get("last_better_answer"),
                        "qa_report": existing_session.get("qa_report", []),
                    })
                return response_data
        raise HTTPException(status_code=400, detail="이미 사용이 완료된 이용권입니다.")

    if credit.get("expires_at") and credit["expires_at"] < now:
        raise HTTPException(status_code=400, detail="유효기간이 만료된 이용권입니다.")

    # 2. 원자적 예약 (available -> reserved)
    # 예약 만료 시간(5분) 초과 시 재시도 복구 허용
    timeout_threshold = now - timedelta(minutes=5)
    session_id = f"sess_{uuid.uuid4().hex[:16]}"

    try:
        update_res = await db["interview_credits"].update_one(
            {
                "credit_id": credit["credit_id"],
                "credit_token": token,
                "$or": [
                    {"status": "available"},
                    {"status": "reserved", "reserved_at": {"$lt": timeout_threshold}}
                ]
            },
            {
                "$set": {
                    "status": "reserved",
                    "reserved_at": now,
                    "reserved_session_id": session_id
                }
            }
        )
    except Exception as db_err:
        print(f"[Interview] Reserve credit DB error: {db_err}")
        raise HTTPException(status_code=500, detail="이용권 예약 처리 중 데이터베이스 오류가 발생했습니다.")

    if update_res.modified_count == 0:
        raise HTTPException(
            status_code=409,
            detail="이용권이 현재 사용 중이거나 다른 요청에서 처리 중입니다. 잠시 후 다시 시도해 주세요.",
        )

    # 3. AI 최초 질문 생성 호출
    try:
        result = await get_interview_questions(
            payload.jd_text,
            payload.resume_text,
            payload.company_name,
            payload.ideal_candidate_profile,
        )

        if "error" in result or not result.get("questions"):
            raise ValueError(result.get("error", "질문 생성 결과가 비어 있습니다."))

    except Exception as llm_err:
        # 4. AI 생성 실패 시 이용권 보호 롤백 (reserved -> available)
        try:
            await db["interview_credits"].update_one(
                {"credit_id": credit["credit_id"], "status": "reserved", "reserved_session_id": session_id},
                {"$set": {"status": "available", "reserved_at": None, "reserved_session_id": None}}
            )
        except Exception as rollback_err:
            print(f"[Interview] Rollback failed: {rollback_err}")

        print(f"[Interview] LLM failure, credit rolled back to available: {llm_err}")
        raise HTTPException(
            status_code=502,
            detail="AI 모의면접 질문 생성 중 일시적인 오류가 발생했습니다. 이용권은 차감되지 않았으니 다시 시도해 주세요.",
        )

    # 5. AI 생성 성공: 사용 확정(used) 및 면접 세션 발급
    session_token = f"sesstok_{secrets.token_urlsafe(32)}"
    used_at = datetime.utcnow()

    # 예약 소유권(reserved_session_id) 확인 및 used로 상태 전이
    try:
        commit_res = await db["interview_credits"].update_one(
            {"credit_id": credit["credit_id"], "status": "reserved", "reserved_session_id": session_id},
            {
                "$set": {
                    "status": "used",
                    "used_at": used_at,
                    "session_id": session_id,
                    "session_token": session_token,
                    "questions_generated": result.get("questions", []),
                    "company_name": payload.company_name,
                    "jd_text": payload.jd_text,
                    "resume_text": payload.resume_text,
                    "ideal_candidate_profile": payload.ideal_candidate_profile,
                }
            }
        )
    except Exception as db_err:
        print(f"[Interview] Commit credit DB error: {db_err}")
        raise HTTPException(status_code=500, detail="이용권 사용 처리 중 데이터베이스 오류가 발생했습니다.")

    if commit_res.modified_count != 1:
        # 예약 소유권을 상실한 경우 (5분 만료 또는 타 요청 선점)
        print(f"[Interview] Lost reservation ownership for credit {credit['credit_id']}, session_id={session_id}")
        raise HTTPException(
            status_code=409,
            detail="면접 예약 유효시간이 만료되었거나 다른 요청에 의해 변경되어 세션을 시작할 수 없습니다.",
        )

    # 면접 세션 문서 영속 저장
    first_q = result.get("questions", [""])[0]
    first_q_text = first_q if isinstance(first_q, str) else first_q.get("question", "")
    session_data = {
        "session_id": session_id,
        "session_token": session_token,
        "credit_id": credit["credit_id"],
        "customer_email": credit.get("customer_email"),
        "company_name": payload.company_name,
        "jd_text": payload.jd_text,
        "resume_text": payload.resume_text,
        "ideal_candidate_profile": payload.ideal_candidate_profile,
        "created_at": used_at,
        "questions_generated": result.get("questions", []),
        "is_finished": False,
        "history": [],
        "qa_report": [],
        "current_question": first_q_text,
    }
    try:
        await db["sessions"].insert_one(session_data)
    except Exception as db_err:
        print(f"[Interview] Commit session DB error: {db_err}")
        # 세션 저장 성공 여부가 불확실할 때 (ACK 유실/네트워크 오류 등):
        # 이용권(interview_credits)에 이미 원자적으로 세션 스냅샷(질문 목록, 토큰, 컨텍스트)이
        # 영속화되어 있으므로 available로 성급히 되돌려 중복 세션 발급/LLM 재호출 위험을 열지 않고,
        # used 상태를 유지하여 재시도시 동일 세션으로 자가 복구(reconstruct)되도록 보장합니다.
        raise HTTPException(
            status_code=500,
            detail="면접 세션 저장 중 일시적인 데이터베이스 지연이 발생했습니다. 동일 이용권으로 재시도하시면 준비된 질문으로 세션이 안전하게 복구됩니다.",
        )

    result["session_id"] = session_id
    result["session_token"] = session_token
    return result


class ChatMessage(BaseModel):
    role: str
    content: str


class FollowupInterviewRequest(BaseModel):
    session_id: str
    session_token: str
    jd_text: str
    resume_text: str
    company_name: str = ""
    ideal_candidate_profile: str = ""
    history: List[ChatMessage]


@router.post("/chat")
async def chat_interview(payload: FollowupInterviewRequest, request: Request):
    """
    모의면접 대화 및 꼬리질문 API
    - 유효한 session_id 및 session_token으로만 대화 가능
    - 추가 이용권 차감 없음
    """
    db = getattr(request.app, "mongodb", None)
    if db is None:
        raise HTTPException(status_code=503, detail="데이터베이스 연결을 사용할 수 없습니다.")

    if not payload.session_id or not payload.session_token:
        raise HTTPException(status_code=401, detail="면접 세션 인증 정보가 누락되었습니다.")

    # 세션 토큰 권한 검증
    try:
        session = await db["sessions"].find_one({
            "session_id": payload.session_id,
            "session_token": payload.session_token
        })
    except Exception as db_err:
        print(f"[Interview] Session verify error: {db_err}")
        raise HTTPException(status_code=500, detail="세션 확인 중 데이터베이스 오류가 발생했습니다.")

    if not session:
        raise HTTPException(status_code=403, detail="유효하지 않은 면접 세션 토큰입니다.")

    # 세션의 기업 및 맥락 일관성 엄격 검증
    session_company = (session.get("company_name") or "").strip()
    req_company = (payload.company_name or "").strip()
    if session_company and (not req_company or req_company != session_company):
        raise HTTPException(status_code=400, detail="세션의 지원 기업 정보와 일치하지 않거나 누락되었습니다.")

    session_jd = (session.get("jd_text") or "").strip()
    req_jd = (payload.jd_text or "").strip()
    if session_jd and req_jd and session_jd != req_jd:
        raise HTTPException(status_code=400, detail="세션의 채용공고(JD) 정보와 일치하지 않습니다.")

    session_resume = (session.get("resume_text") or "").strip()
    req_resume = (payload.resume_text or "").strip()
    if session_resume and req_resume and session_resume != req_resume:
        raise HTTPException(status_code=400, detail="세션의 이력서 정보와 일치하지 않습니다.")

    # 1. 턴 식별자 및 제출 내용 추출
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in payload.history]
    candidate_msg = ""
    interviewer_q = ""
    candidate_turn_count = 0
    for idx in range(len(history_dicts) - 1, -1, -1):
        if not candidate_msg and history_dicts[idx]["role"] == "candidate":
            candidate_msg = history_dicts[idx]["content"]
        elif candidate_msg and history_dicts[idx]["role"] == "interviewer":
            if not interviewer_q:
                interviewer_q = history_dicts[idx]["content"]
    for msg in history_dicts:
        if msg["role"] == "candidate":
            candidate_turn_count += 1

    if not interviewer_q:
        interviewer_q = session.get("current_question") or (
            session.get("questions_generated", [""])[0]
            if isinstance(session.get("questions_generated", [""])[0], str)
            else session.get("questions_generated", [{}])[0].get("question", "")
        )

    norm_c = candidate_msg.strip()
    norm_q = interviewer_q.strip()
    turn_fingerprint = hashlib.sha256(
        f"{payload.session_id}:{candidate_turn_count}:{norm_q}:{norm_c}".encode("utf-8")
    ).hexdigest()

    # 2. 완료된 세션인지 검증 및 마지막 완료 제출의 동일 재전송 복구 (7.C.3)
    if session.get("is_finished"):
        is_same_final_retry = False
        saved_fp = session.get("last_turn_fingerprint")
        if saved_fp and saved_fp == turn_fingerprint:
            is_same_final_retry = True
        else:
            session_qa = session.get("qa_report") or []
            if session_qa and len(session_qa) == candidate_turn_count:
                last_qa_ans = (session_qa[-1].get("answer") or "").strip()
                if last_qa_ans == norm_c:
                    is_same_final_retry = True

        if is_same_final_retry:
            cached_resp = session.get("last_turn_response")
            if isinstance(cached_resp, dict):
                clean_resp = dict(cached_resp)
                clean_resp.pop("_id", None)
                clean_resp["is_finished"] = True
                return clean_resp
            return {
                "is_finished": True,
                "evaluation": session.get("evaluation", ""),
                "scores": session.get("scores"),
                "better_answer": session.get("better_answer", ""),
                "betterAnswer": session.get("better_answer", ""),
                "culture_fit_breakdown": session.get("culture_fit_breakdown"),
                "qa_report": session.get("qa_report", []),
                "next_question": "",
            }

        raise HTTPException(status_code=400, detail="이미 완료된 면접 세션입니다.")

    # 3. 진행 중 세션에서 이전 제출과 동일한 답변 재전송 감지 (7.C.1, 7.C.2 - ACK 유실/네트워크 재시도 보호)
    is_same_interim_retry = False
    saved_fp = session.get("last_turn_fingerprint")
    if saved_fp and saved_fp == turn_fingerprint:
        is_same_interim_retry = True
    else:
        session_qa = session.get("qa_report") or []
        if session_qa and len(session_qa) == candidate_turn_count:
            last_qa_ans = (session_qa[-1].get("answer") or "").strip()
            if last_qa_ans == norm_c:
                is_same_interim_retry = True

    if is_same_interim_retry:
        cached_resp = session.get("last_turn_response")
        if isinstance(cached_resp, dict):
            clean_resp = dict(cached_resp)
            clean_resp.pop("_id", None)
            return clean_resp
        return {
            "is_finished": False,
            "next_question": session.get("current_question", ""),
            "evaluation": session.get("last_evaluation", ""),
            "better_answer": session.get("last_better_answer", ""),
            "betterAnswer": session.get("last_better_answer", ""),
            "qa_report": session.get("qa_report", []),
        }

    # LLM 프롬프트 주입 시 서버에 영속된 원래 맥락을 우선 바인딩
    effective_jd = session.get("jd_text") or payload.jd_text
    effective_resume = session.get("resume_text") or payload.resume_text
    effective_company = session.get("company_name") or payload.company_name
    effective_ideal = session.get("ideal_candidate_profile") or payload.ideal_candidate_profile

    try:
        result = await get_followup_question(
            effective_jd,
            effective_resume,
            history_dicts,
            effective_company,
            effective_ideal,
        )

        if "error" in result:
            print(f"[Interview Route] Error from LLM proxy: {result['error']}")
            raise HTTPException(status_code=502, detail=result["error"])

        new_qa_item = {
            "question": interviewer_q,
            "answer": candidate_msg,
            "evaluation": result.get("evaluation", ""),
            "better_answer": result.get("better_answer", ""),
            "betterAnswer": result.get("better_answer", ""),
        }

        # 기존 세션에 누적된 qa_report 목록 가져오기
        accumulated_qa = list(session.get("qa_report") or [])
        if candidate_msg or interviewer_q:
            accumulated_qa.append(new_qa_item)

        # 모델 응답에 이미 완성된 qa_report 리스트가 제공된 경우 우선 반영
        llm_qa = result.get("qa_report")
        effective_qa_report = llm_qa if isinstance(llm_qa, list) and len(llm_qa) > 0 else accumulated_qa
        for item in effective_qa_report:
            if isinstance(item, dict):
                better = item.get("better_answer") or item.get("betterAnswer") or ""
                item["better_answer"] = better
                item["betterAnswer"] = better
        result["qa_report"] = effective_qa_report

        # 완료 상태 및 최종 평가 결과 영속화 (재접속 시 LLM 재호출 없이 복원)
        if result.get("is_finished"):
            try:
                await db["sessions"].update_one(
                    {"session_id": payload.session_id},
                    {
                        "$set": {
                            "is_finished": True,
                            "finished_at": datetime.utcnow(),
                            "evaluation": result.get("evaluation", ""),
                            "scores": result.get("scores"),
                            "better_answer": result.get("better_answer", ""),
                            "culture_fit_breakdown": result.get("culture_fit_breakdown"),
                            "qa_report": effective_qa_report,
                            "history": history_dicts,
                            "last_turn_fingerprint": turn_fingerprint,
                            "last_turn_response": result,
                        }
                    }
                )
            except Exception as e:
                print(f"[Interview] Failed to mark session finished: {e}")
                raise HTTPException(
                    status_code=500,
                    detail="면접 완료 결과 저장 중 데이터베이스 오류가 발생했습니다. 재시도해 주세요.",
                )
        else:
            # 진행 중 대화 히스토리 및 현재 질문/피드백 업데이트
            try:
                await db["sessions"].update_one(
                    {"session_id": payload.session_id},
                    {
                        "$set": {
                            "history": history_dicts,
                            "current_question": result.get("next_question"),
                            "last_evaluation": result.get("evaluation"),
                            "last_better_answer": result.get("better_answer"),
                            "qa_report": effective_qa_report,
                            "last_turn_fingerprint": turn_fingerprint,
                            "last_turn_response": result,
                        }
                    }
                )
            except Exception as e:
                print(f"[Interview] Failed to update session history: {e}")
                raise HTTPException(
                    status_code=500,
                    detail="면접 대화 저장 중 데이터베이스 오류가 발생했습니다. 재시도해 주세요.",
                )

        # 대화 기록 로깅
        try:
            interaction_log = {
                "session_id": payload.session_id,
                "company_name": effective_company,
                "created_at": datetime.utcnow(),
                "candidate_last_message": history_dicts[-1]["content"] if history_dicts else "",
                "ai_evaluation": result.get("evaluation", ""),
                "ai_next_question": result.get("next_question", ""),
                "is_finished": result.get("is_finished", False),
            }
            await db["chat_interactions"].insert_one(interaction_log)
        except Exception as db_err:
            print(f"[Database Error] Failed to log interaction: {str(db_err)}")

        return result
    except HTTPException:
        raise
    except Exception as e:
        print("Error during chat_interview: ", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="면접 대화 처리 중 서버 오류가 발생했습니다.")

