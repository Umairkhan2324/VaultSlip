"""Groq-backed structuring of OCR text into ReceiptExtraction.

Uses the official Groq Python SDK with an OpenAI-compatible chat.completions
interface, mirroring the Quickstart example:
https://console.groq.com/docs/quickstart
"""
from __future__ import annotations

import json

from groq import Groq  # type: ignore[import-untyped]

from app.config import get_settings
from app.models.receipt import ReceiptExtraction
from app.ocr.base_engine import RawOcrResult


def _response_format_schema() -> dict:
    schema = ReceiptExtraction.model_json_schema()
    return {"type": "json_schema", "json_schema": {"name": "ReceiptExtraction", "schema": schema}}


def _build_messages(ocr: RawOcrResult) -> list[dict]:
    instructions = (
        "You are a receipt data extraction system. Convert the following OCR text into a single "
        "JSON object matching the provided schema. Do not include any extra commentary."
    )
    user_text = ocr.full_text or "\n".join(ocr.lines)
    return [
        {"role": "system", "content": instructions},
        {"role": "user", "content": user_text},
    ]


def _client() -> Groq:
    settings = get_settings()
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")
    return Groq(api_key=settings.groq_api_key)


async def structure_with_groq(ocr: RawOcrResult, max_retries: int = 3) -> ReceiptExtraction:
    """Call Groq to turn OCR text into a validated ReceiptExtraction."""
    client = _client()
    for attempt in range(max_retries):
        try:
            resp = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=_build_messages(ocr),
                response_format=_response_format_schema(),
            )
            content = resp.choices[0].message.content
            data = json.loads(content) if isinstance(content, str) else content
            return ReceiptExtraction.model_validate(data)
        except Exception:
            if attempt == max_retries - 1:
                raise


__all__ = ["structure_with_groq"]

