"""Mistral-backed structuring of OCR text into ReceiptExtraction."""
from __future__ import annotations

import json

from mistralai import Mistral

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


def _client() -> Mistral:
    settings = get_settings()
    if not settings.mistral_api_key:
        raise RuntimeError("MISTRAL_API_KEY is not configured")
    return Mistral(api_key=settings.mistral_api_key)


async def structure_with_mistral(
    ocr: RawOcrResult, max_retries: int = 3
) -> ReceiptExtraction:
    """Call Mistral to turn OCR text into a validated ReceiptExtraction."""
    client = _client()
    for attempt in range(max_retries):
        try:
            resp = client.chat.complete(
                model="mistral-large-latest",
                messages=_build_messages(ocr),
                response_format=_response_format_schema(),
            )
            content = resp.choices[0].message.content
            data = json.loads(content) if isinstance(content, str) else content
            return ReceiptExtraction.model_validate(data)
        except Exception:
            if attempt == max_retries - 1:
                raise


__all__ = ["structure_with_mistral"]
