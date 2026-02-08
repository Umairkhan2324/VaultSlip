"""Tesseract-based OCR engine.

This uses pytesseract + Pillow to turn receipt images into plain text that can
be fed into downstream LLMs for structuring.
"""
from __future__ import annotations

from io import BytesIO
from typing import Optional

from PIL import Image  # type: ignore[import-untyped]
import pytesseract  # type: ignore[import-untyped]

from app.ocr.base_engine import RawOcrResult, OcrEngine


class TesseractOcrEngine:
    """Simple OCR engine backed by Tesseract."""

    def __init__(self, language: str = "eng") -> None:
        # language is configurable so non-English receipts can be supported later.
        self._language = language

    async def extract_text(self, image_bytes: bytes, filename: Optional[str] = None) -> RawOcrResult:
        """Run OCR using Tesseract and return a RawOcrResult."""
        # Decode the image in-memory; do not write to disk.
        img = Image.open(BytesIO(image_bytes))
        text = pytesseract.image_to_string(img, lang=self._language) or ""
        # Normalise newlines and split into non-empty lines.
        normalised = text.replace("\r\n", "\n").replace("\r", "\n")
        lines = [line.strip() for line in normalised.split("\n") if line.strip()]
        return RawOcrResult(
            full_text=normalised.strip(),
            lines=lines,
            engine="tesseract",
            language=self._language,
        )


def create_tesseract_engine(language: str = "eng") -> OcrEngine:
    """Factory helper so callers do not depend on the concrete class."""
    return TesseractOcrEngine(language=language)


__all__ = ["TesseractOcrEngine", "create_tesseract_engine"]

