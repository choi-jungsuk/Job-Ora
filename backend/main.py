from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from routes import interview
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Job-Ora API")

# Add CORS middleware
# 배포 시에는 Railway/도메인 환경변수 CORS_ORIGINS에 프론트엔드 주소를 쉼표로 넣습니다.
# 예: https://job-ora.com,https://www.job-ora.com,https://web-production-xxxx.up.railway.app
cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview.router)

# MongoDB connection variables
MONGODB_URL = os.getenv("MONGODB_URL")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "jobora_db")

@app.on_event("startup")
async def startup_db_client():
    if not MONGODB_URL:
        app.mongodb_client = None
        app.mongodb = None
        print("[Job-Ora API] MONGODB_URL is not set. Running without MongoDB logging.")
        return

    app.mongodb_client = AsyncIOMotorClient(MONGODB_URL)
    app.mongodb = app.mongodb_client[MONGODB_DB_NAME]
    print("Connected to the MongoDB database!")

@app.on_event("shutdown")
async def shutdown_db_client():
    if getattr(app, "mongodb_client", None):
        app.mongodb_client.close()
        print("Disconnected from the MongoDB database!")

@app.get("/")
async def root():
    return {"message": "Hello from Job-Ora Backend! Database connection is ready."}

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "job-ora-api",
        "mongodb_configured": bool(MONGODB_URL),
        "llm_provider": os.getenv("LLM_PROVIDER", "azure").lower(),
    }

