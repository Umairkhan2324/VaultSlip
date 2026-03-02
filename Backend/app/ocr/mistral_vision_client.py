"""Mistral Pixtral vision API client for OCR: image bytes to raw text."""
from __future__ import annotations

import asyncio
import base64
from typing import Optional

from mistralai import Mistral

from app.config import get_settings
from app.ocr.vision_protocol import VisionClientProtocol

VISION_MODEL = "pixtral-large-latest"
MAX_IMAGE_BYTES = 3 * 1024 * 1024


def _client() -> Mistral:
    settings = get_settings()
    if not settings.mistral_api_key:
        raise RuntimeError("MISTRAL_API_KEY is not configured")
    return Mistral(api_key=settings.mistral_api_key)


def _call_mistral_vision(url: str) -> str:
    """Sync Mistral vision call (run in thread)."""
    client = _client()
    resp = client.chat.complete(
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


class MistralVisionClient(VisionClientProtocol):
    """Extract raw text from receipt images using Mistral Pixtral."""

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
        return await asyncio.to_thread(_call_mistral_vision, url)
