"""Thin Mistral SDK wrapper for chat-style interactions."""
from __future__ import annotations

from typing import List, Dict

from mistralai import Mistral

from app.config import get_settings


def _client() -> Mistral:
    settings = get_settings()
    if not settings.mistral_api_key:
        raise RuntimeError("MISTRAL_API_KEY is not configured")
    return Mistral(api_key=settings.mistral_api_key)


def chat_completion(model: str, messages: List[Dict], tools: List[Dict] | None = None) -> dict:
    """Synchronous chat completion wrapper (tools are optional)."""
    client = _client()
    kwargs = {
        "model": model,
        "messages": messages,
        "tool_choice": "auto" if tools else "none",
    }
    if tools:
        kwargs["tools"] = tools
    resp = client.chat.complete(**kwargs)
    return resp.model_dump() if hasattr(resp, "model_dump") else resp


__all__ = ["chat_completion"]
