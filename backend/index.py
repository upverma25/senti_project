from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import os
import sys
sys.path.append('.')

from app.model import SentimentModel

sentiment_model = SentimentModel()

@asynccontextmanager
async def lifespan(app: FastAPI):
    sentiment_model.load_or_train()
    yield

app = FastAPI(
    title="Sentiment Intelligence API",
    description="Real-time sentiment analysis using LinearSVC + NLP pipeline",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    text: str

class PredictResponse(BaseModel):
    sentiment: str
    confidence: float
    scores: dict
    key_phrases: list[str]
    phrase_sentiments: list[str]
    processing_time_ms: float

@app.get("/")
def root():
    return {"status": "ok", "message": "Sentiment Intelligence API is running"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": sentiment_model.is_loaded(),
        "model_type": "LinearSVC",
    }

@app.post("/api/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=422, detail="Text cannot be empty")
    if len(req.text) > 5000:
        raise HTTPException(status_code=422, detail="Text exceeds 5000 character limit")

    result = sentiment_model.predict(req.text)
    return result

@app.get("/api/model-info")
def model_info():
    return sentiment_model.get_info()

# Vercel serverless handler
handler = app
