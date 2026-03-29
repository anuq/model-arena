import json
import os
from pathlib import Path
from typing import Dict, List
from models import LeaderboardEntry
from openrouter_client import AVAILABLE_MODELS

DATA_DIR = Path(os.getenv("DATA_DIR", "/data"))
LEADERBOARD_FILE = DATA_DIR / "leaderboard.json"


def _ensure_data_dir():
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def _load() -> Dict:
    if LEADERBOARD_FILE.exists():
        with open(LEADERBOARD_FILE, "r") as f:
            return json.load(f)
    return {}


def _save(data: Dict):
    _ensure_data_dir()
    with open(LEADERBOARD_FILE, "w") as f:
        json.dump(data, f, indent=2)


def _get_model_info(model_id: str) -> dict:
    for m in AVAILABLE_MODELS:
        if m["id"] == model_id:
            return m
    return {"id": model_id, "name": model_id, "provider": "Unknown", "color": "#888"}


def add_rating(model_id: str, rating: int):
    data = _load()
    if model_id not in data:
        data[model_id] = {"rating_sum": 0, "total_ratings": 0}
    data[model_id]["rating_sum"] += rating
    data[model_id]["total_ratings"] += 1
    _save(data)


def get_leaderboard() -> List[LeaderboardEntry]:
    data = _load()
    entries = []
    for model_id, stats in data.items():
        info = _get_model_info(model_id)
        total = stats["total_ratings"]
        avg = round(stats["rating_sum"] / total, 2) if total > 0 else None
        entries.append(
            LeaderboardEntry(
                model_id=model_id,
                model_name=info["name"],
                provider=info["provider"],
                color=info["color"],
                rating_sum=stats["rating_sum"],
                total_ratings=total,
                avg_rating=avg,
            )
        )
    entries.sort(key=lambda e: e.avg_rating or 0, reverse=True)
    return entries


def reset_leaderboard():
    _ensure_data_dir()
    if LEADERBOARD_FILE.exists():
        os.remove(LEADERBOARD_FILE)
