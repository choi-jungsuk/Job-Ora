# Job-Ora Colab Worker Template
# This notebook is designed to run in Google Colab to provide AI inference capabilities.

# In Google Colab, install dependencies first:
#   !pip install fastapi uvicorn pyngrok nest-asyncio openai

import nest_asyncio
from pyngrok import ngrok
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import os
import json
from openai import AsyncOpenAI

# --- Configuration ---
# Never hard-code API keys in this template. In Colab, set them first:
#   import os
#   os.environ["OPENAI_API_KEY"] = "your-openai-api-key"
#   os.environ["NGROK_AUTHTOKEN"] = "your-ngrok-authtoken"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is required. Set it in the Colab environment before running this worker.")

app = FastAPI()

class InterviewRequest(BaseModel):
    jd_text: str
    resume_text: str
    company_name: str = ""
    ideal_candidate_profile: str = ""

# Initialize OpenAI Async Client
aclient = AsyncOpenAI(api_key=OPENAI_API_KEY)

@app.post("/generate-questions")
async def generate_questions(request: InterviewRequest):
    system_prompt = (
        f"You are the senior HR Manager and Technical Interviewer at {request.company_name}. "
        f"We strictly evaluate candidates based on our company's core values and ideal candidate profile: '{request.ideal_candidate_profile}'. "
        "Your goal is to generate 3 to 5 highly relevant interview questions based on the candidate's Resume and the Job Description, focusing heavily on whether they fit our company's specific culture and technical requirements. "
        "Return the output ONLY as a valid JSON object with the key 'questions' containing a list of strings."
    )
    
    user_prompt = f"Job Description:\n{request.jd_text}\n\nResume:\n{request.resume_text}"
    
    try:
        response = await aclient.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        result = json.loads(content)
        
        # Ensure it returns the list of questions
        if "questions" in result:
            return {"questions": result["questions"]}
        else:
            return {"questions": []}
            
    except Exception as e:
        return {"error": str(e), "questions": []}

class Message(BaseModel):
    role: str
    content: str

class FollowupRequest(BaseModel):
    jd_text: str
    resume_text: str
    company_name: str = ""
    ideal_candidate_profile: str = ""
    history: List[Message]

@app.post("/chat-followup")
async def chat_followup(request: FollowupRequest):
    system_prompt = (
        f"You are the senior HR Manager and Technical Interviewer at {request.company_name}. "
        f"You strictly evaluate candidates against your company's core values and ideal candidate profile: '{request.ideal_candidate_profile}'. "
        "Review the candidate's Resume, the Job Description, and the current conversation history. "
        "Your goal is to actively evaluate the candidate's last answer and generate a NEW relevant follow-up question that pressures them on culture fit or technical depth. "
        "If you believe the interview has naturally concluded or no more questions are needed, set 'is_finished': true. Otherwise, set it to false. "
        "Return the output ONLY as a valid JSON object with the exact keys: 'next_question' (string), 'evaluation' (string feedback on their last answer), and 'is_finished' (boolean)."
    )
    
    user_context = f"Job Description:\n{request.jd_text}\n\nResume:\n{request.resume_text}"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "system", "content": f"Context:\n{user_context}"}
    ]
    
    for msg in request.history:
        # Map roles to OpenAI supported roles
        api_role = "assistant" if msg.role == "interviewer" else ("user" if msg.role == "candidate" else msg.role)
        messages.append({"role": api_role, "content": msg.content})
        
    try:
        response = await aclient.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.7
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        return {"error": str(e)}

import threading

# --- Tunnel & Startup ---
ngrok_token = os.getenv("NGROK_AUTHTOKEN")
if ngrok_token:
    ngrok.set_auth_token(ngrok_token)
public_url = ngrok.connect(8000).public_url
print(f"Colab Worker is live at: {public_url}")

def run_server():
    import uvicorn
    # Use nest_asyncio just in case, though threading is the real fix here
    nest_asyncio.apply()
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Start the server in a separate thread to avoid blocking the Colab event loop
threading.Thread(target=run_server, daemon=True).start()

# Keep the cell alive for a while (optional, or just use another cell for tests)
import time
while True:
    time.sleep(1)
