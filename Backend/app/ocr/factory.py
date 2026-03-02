"""Factory helpers for selecting an OCR engine based on settings."""
from __future__ import annotations

from typing import Optional

from app.config import get_settings
from app.ocr.base_engine import OcrEngine
from app.ocr.fallback_engine import FallbackOcrEngine
from app.ocr.mistral_vision_client import MistralVisionClient
from app.ocr.mistral_vision_engine import create_mistral_vision_engine
from app.ocr.tesseract_engine import create_tesseract_engine


def _pixtral_engine(language: Optional[str] = None) -> OcrEngine:
    return create_mistral_vision_engine(
        client=MistralVisionClient(), language=language or "eng"
    )


def get_ocr_engine(language: Optional[str] = None) -> OcrEngine:
    """Return the configured OCR engine.

    - tesseract: local OCR; if MISTRAL_API_KEY is set, Pixtral is used on failure.
    - pixtral: Mistral Pixtral vision model only (no Tesseract).
    """
    settings = get_settings()
    engine_name = getattr(settings, "ocr_engine", "tesseract").lower()
    lang = language or "eng"

    if engine_name == "pixtral":
        return _pixtral_engine(lang)

    tesseract = create_tesseract_engine(language=lang)
    if settings.mistral_api_key:
        return FallbackOcrEngine(primary=tesseract, fallback=_pixtral_engine(lang))
    return tesseract


__all__ = ["get_ocr_engine"]

