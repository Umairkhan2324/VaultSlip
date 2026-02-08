"""OCR engine that tries primary first, then fallback on any failure."""
from __future__ import annotations

import logging
from typing import Optional

from app.ocr.base_engine import OcrEngine, RawOcrResult

logger = logging.getLogger(__name__)


class FallbackOcrEngine:
    """Try primary OCR; on exception use fallback (e.g. Groq when Tesseract missing)."""

    def __init__(self, primary: OcrEngine, fallback: OcrEngine) -> None:
        self._primary = primary
        self._fallback = fallback

    async def extract_text(
        self, image_bytes: bytes, filename: Optional[str] = None
    ) -> RawOcrResult:
        try:
            return await self._primary.extract_text(image_bytes, filename=filename)
        except Exception as e:
            logger.warning(
                "Primary OCR failed, using fallback: %s",
                str(e),
                extra={"error_type": type(e).__name__},
            )
            return await self._fallback.extract_text(image_bytes, filename=filename)
