"""Groq vision API client for OCR: image bytes → raw text via chat.completions."""
from __future__ import annotations

import asyncio
import base64
import logging
from typing import Optional

from groq import Groq  # type: ignore[import-untyped]

from app.config import get_settings
from app.ocr.groq_vision_engine import GroqVisionClientProtocol

logger = logging.getLogger(__name__)

VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
# Base64 request limit 4MB; leave headroom for JSON/prompt.
MAX_IMAGE_BYTES = 3 * 1024 * 1024


def _client() -> Groq:
    settings = get_settings()
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")
    return Groq(api_key=settings.groq_api_key)


def _call_groq_vision(url: str) -> str:
    """Sync Groq vision call (run in thread)."""
    client = _client()
    resp = client.chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Extract all text from this receipt image exactly as it appears. "
                            "Return only the raw text, no commentary or JSON."
                        ),
                    },
                    {"type": "image_url", "image_url": {"url": url}},
                ],
            }
        ],
        max_tokens=4096,
        temperature=0,
    )
    content = resp.choices[0].message.content
    return (content or "").strip()


class GroqVisionClient(GroqVisionClientProtocol):
    """Extract raw text from receipt images using Groq vision model."""

    async def extract_text_from_image(
        self, image_bytes: bytes, filename: Optional[str] = None
    ) -> str:
        if len(image_bytes) > MAX_IMAGE_BYTES:
            raise ValueError(
                f"Image too large for vision API (max {MAX_IMAGE_BYTES // (1024*1024)} MB)"
            )
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        mime = "image/jpeg"
        if filename and filename.lower().endswith(".png"):
            mime = "image/png"
        url = f"data:{mime};base64,{b64}"
        return await asyncio.to_thread(_call_groq_vision, url)
