"""Thin Groq SDK wrapper for chat-style interactions."""
from __future__ import annotations

from typing import List, Dict

from groq import Groq  # type: ignore[import-untyped]

from app.config import get_settings


def _client() -> Groq:
    settings = get_settings()
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")
    return Groq(api_key=settings.groq_api_key)


def chat_completion(model: str, messages: List[Dict], tools: List[Dict] | None = None) -> dict:
    """Synchronous chat completion wrapper (tools are optional)."""
    client = _client()
    resp = client.chat.completions.create(
        model=model,
        messages=messages,
        tools=tools,
        tool_choice="auto" if tools else "none",
    )
    return resp.model_dump()


__all__ = ["chat_completion"]

