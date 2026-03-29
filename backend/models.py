from pydantic import BaseModel
from typing import Optional

class ModelInfo(BaseModel):
    id: str
    name: str
    provider: str
    color: str

class CompeteRequest(BaseModel):
    model_id: str
    prompt: str
    max_tokens: int = 1024

class CompeteResponse(BaseModel):
    model_id: str
    text: Optional[str] = None
    error: Optional[str] = None
    latency_ms: Optional[int] = None
    tokens: Optional[int] = None
    tokens_per_sec: Optional[float] = None

class RateRequest(BaseModel):
    model_id: str
    rating: int  # 0=bad, 1=meh, 2=good, 3=fire

class LeaderboardEntry(BaseModel):
    model_id: str
    model_name: str
    provider: str
    color: str
    rating_sum: int
    total_ratings: int
    avg_rating: Optional[float] = None
