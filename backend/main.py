from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import CompeteRequest, RateRequest, ModelInfo
from openrouter_client import call_model, AVAILABLE_MODELS
from leaderboard import add_rating, get_leaderboard, reset_leaderboard

load_dotenv()

app = FastAPI(title="Model Arena", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/models", response_model=list[ModelInfo])
async def list_models():
    return [ModelInfo(**m) for m in AVAILABLE_MODELS]


@app.post("/api/compete")
async def compete(req: CompeteRequest):
    result = await call_model(req.model_id, req.prompt, req.max_tokens)
    return result


@app.post("/api/rate")
async def rate(req: RateRequest):
    if req.rating < 0 or req.rating > 3:
        return {"error": "Rating must be 0-3"}
    add_rating(req.model_id, req.rating)
    return {"status": "ok"}


@app.get("/api/leaderboard")
async def leaderboard():
    return get_leaderboard()


@app.delete("/api/leaderboard")
async def reset():
    reset_leaderboard()
    return {"status": "reset"}
