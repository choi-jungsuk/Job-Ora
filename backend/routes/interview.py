from fastapi import APIRouter, HTTPException, Request
from services.llm_proxy import get_interview_questions, get_followup_question
from pydantic import BaseModel
from typing import List
from datetime import datetime
import traceback

router = APIRouter(prefix="/interview", tags=["Interview"])

class StartInterviewRequest(BaseModel):
    jd_text: str
    resume_text: str
    company_name: str = ""
    ideal_candidate_profile: str = ""

@router.post("/start")
async def start_interview(payload: StartInterviewRequest, request: Request):
    try:
        result = await get_interview_questions(payload.jd_text, payload.resume_text, payload.company_name, payload.ideal_candidate_profile)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        # Log to MongoDB (non-blocking for interview workflow)
        try:
            db = request.app.mongodb
            session_data = {
                "company_name": payload.company_name,
                "created_at": datetime.utcnow(),
                "questions_generated": result.get("questions", []),
                "resume_text": payload.resume_text[:100] + "..." # only store snippet for brevity in prototype
            }
            await db["sessions"].insert_one(session_data)
        except Exception as db_err:
            print(f"[Database Error] Failed to log session: {str(db_err)}")
        
        return result
    except Exception as e:
        print("Error during start_interview: ", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")

class ChatMessage(BaseModel):
    role: str
    content: str

class FollowupInterviewRequest(BaseModel):
    jd_text: str
    resume_text: str
    company_name: str = ""
    ideal_candidate_profile: str = ""
    history: List[ChatMessage]

@router.post("/chat")
async def chat_interview(payload: FollowupInterviewRequest, request: Request):
    try:
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in payload.history]
        result = await get_followup_question(payload.jd_text, payload.resume_text, history_dicts, payload.company_name, payload.ideal_candidate_profile)
        
        if "error" in result:
             print(f"[Interview Route] Error from LLM proxy: {result['error']}")
             raise HTTPException(status_code=500, detail=result["error"])
        
        # Log Interaction to DB (non-blocking for interview workflow)
        try:
            db = request.app.mongodb
            interaction_log = {
                "company_name": payload.company_name,
                "created_at": datetime.utcnow(),
                "candidate_last_message": history_dicts[-1]["content"] if history_dicts else "",
                "ai_evaluation": result.get("evaluation", ""),
                "ai_next_question": result.get("next_question", ""),
                "is_finished": result.get("is_finished", False)
            }
            await db["chat_interactions"].insert_one(interaction_log)
        except Exception as db_err:
            print(f"[Database Error] Failed to log interaction: {str(db_err)}")
        
        print(f"[Interview Route] Chat interaction logged. is_finished={result.get('is_finished')}")

        return result
    except Exception as e:
        print("Error during chat_interview: ", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")
