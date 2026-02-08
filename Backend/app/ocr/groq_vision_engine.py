"""Groq vision-based OCR engine (optional).

This engine is designed for scenarios where you want a cloud vision model
to handle both OCR and some light normalization, but still feed the result
into the same RawOcrResult shape as other engines.

NOTE: This module assumes a Groq client wrapper will be added separately
for the main structuring pipeline. For now it focuses purely on text
extraction from images.
"""
from __future__ import annotations

from typing import Optional

from app.ocr.base_engine import RawOcrResult, OcrEngine

# The concrete Groq HTTP client lives in a separate adapter so that this file
# stays focused on turning a vision response into RawOcrResult. To avoid
# hard-coding any API details here, we accept a minimal callable interface.


class GroqVisionClientProtocol:
    """Tiny protocol abstraction over the Groq vision endpoint."""

    async def extract_text_from_image(self, image_bytes: bytes, filename: Optional[str] = None) -> str:
        """Return raw textual content extracted from an image."""
        raise NotImplementedError


class GroqVisionOcrEngine:
    """OCR engine that delegates to a Groq vision-capable model."""

    def __init__(self, client: GroqVisionClientProtocol, language: Optional[str] = None) -> None:
        self._client = client
        self._language = language

    async def extract_text(self, image_bytes: bytes, filename: Optional[str] = None) -> RawOcrResult:
        text = await self._client.extract_text_from_image(image_bytes, filename=filename)
        normalised = (text or "").replace("\r\n", "\n").replace("\r", "\n")
        lines = [line.strip() for line in normalised.split("\n") if line.strip()]
        return RawOcrResult(
            full_text=normalised.strip(),
            lines=lines,
            engine="groq_vision",
            language=self._language,
        )


def create_groq_vision_engine(client: GroqVisionClientProtocol, language: Optional[str] = None) -> OcrEngine:
    """Factory helper so callers can construct an OCR engine from a Groq client."""
    return GroqVisionOcrEngine(client=client, language=language)


__all__ = ["GroqVisionClientProtocol", "GroqVisionOcrEngine", "create_groq_vision_engine"]

