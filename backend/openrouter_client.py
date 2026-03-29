import httpx
import time
import os
from models import CompeteResponse

OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions"

AVAILABLE_MODELS = [
    {"id": "anthropic/claude-sonnet-4", "name": "Claude Sonnet 4", "provider": "Anthropic", "color": "#d4a27a"},
    {"id": "anthropic/claude-haiku-4", "name": "Claude Haiku 4", "provider": "Anthropic", "color": "#c98a60"},
    {"id": "openai/gpt-4o", "name": "GPT-4o", "provider": "OpenAI", "color": "#74aa9c"},
    {"id": "openai/gpt-4o-mini", "name": "GPT-4o Mini", "provider": "OpenAI", "color": "#5c9080"},
    {"id": "google/gemini-2.5-flash", "name": "Gemini 2.5 Flash", "provider": "Google", "color": "#4285f4"},
    {"id": "google/gemini-2.5-pro", "name": "Gemini 2.5 Pro", "provider": "Google", "color": "#5e97f6"},
    {"id": "meta-llama/llama-4-maverick", "name": "Llama 4 Maverick", "provider": "Meta", "color": "#0668E1"},
    {"id": "deepseek/deepseek-chat-v3-0324", "name": "DeepSeek V3", "provider": "DeepSeek", "color": "#4a9eff"},
    {"id": "mistralai/mistral-large-2411", "name": "Mistral Large", "provider": "Mistral", "color": "#f76d2b"},
    {"id": "qwen/qwen-2.5-72b-instruct", "name": "Qwen 2.5 72B", "provider": "Qwen", "color": "#6f42c1"},
]


async def call_model(model_id: str, prompt: str, max_tokens: int = 1024) -> CompeteResponse:
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key:
        return CompeteResponse(model_id=model_id, error="OPENROUTER_API_KEY not configured on server")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://model-arena.local",
        "X-Title": "Model Arena",
    }

    payload = {
        "model": model_id,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
    }

    start = time.monotonic()
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(OPENROUTER_BASE, json=payload, headers=headers)
            latency_ms = int((time.monotonic() - start) * 1000)

            data = response.json()

            if "error" in data:
                return CompeteResponse(
                    model_id=model_id,
                    error=data["error"].get("message", "API error"),
                    latency_ms=latency_ms,
                )

            text = data.get("choices", [{}])[0].get("message", {}).get("content", "No response")
            usage = data.get("usage", {})
            tokens = usage.get("completion_tokens") or len(text.split())
            tps = round(tokens / (latency_ms / 1000), 1) if latency_ms > 0 else None

            return CompeteResponse(
                model_id=model_id,
                text=text,
                latency_ms=latency_ms,
                tokens=tokens,
                tokens_per_sec=tps,
            )

    except httpx.TimeoutException:
        latency_ms = int((time.monotonic() - start) * 1000)
        return CompeteResponse(model_id=model_id, error="Request timed out (60s)", latency_ms=latency_ms)
    except Exception as e:
        latency_ms = int((time.monotonic() - start) * 1000)
        return CompeteResponse(model_id=model_id, error=str(e), latency_ms=latency_ms)
