"""Mistral Pixtral vision-based OCR engine."""
from __future__ import annotations

from typing import Optional

from app.ocr.base_engine import RawOcrResult, OcrEngine
from app.ocr.vision_protocol import VisionClientProtocol


class MistralVisionOcrEngine:
    """OCR engine that delegates to Mistral Pixtral vision model."""

    def __init__(self, client: VisionClientProtocol, language: Optional[str] = None) -> None:
        self._client = client
        self._language = language

    async def extract_text(
        self, image_bytes: bytes, filename: Optional[str] = None
    ) -> RawOcrResult:
        text = await self._client.extract_text_from_image(image_bytes, filename=filename)
        normalised = (text or "").replace("\r\n", "\n").replace("\r", "\n")
        lines = [line.strip() for line in normalised.split("\n") if line.strip()]
        return RawOcrResult(
            full_text=normalised.strip(),
            lines=lines,
            engine="mistral_vision",
            language=self._language,
        )


def create_mistral_vision_engine(
    client: VisionClientProtocol, language: Optional[str] = None
) -> OcrEngine:
    """Factory helper for Mistral vision OCR engine."""
    return MistralVisionOcrEngine(client=client, language=language)


__all__ = ["MistralVisionOcrEngine", "create_mistral_vision_engine"]
