"""Base interfaces and types for OCR engines.

This layer is intentionally small and generic so different OCR backends
(open-source or cloud) can plug in without the rest of the system caring
about implementation details.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Protocol


@dataclass
class RawOcrResult:
    """Lightweight, engine-agnostic OCR output.

    - full_text: single concatenated text blob (for LLMs / search)
    - lines: individual non-empty lines in reading order
    - engine: identifier for which OCR engine produced this result
    - language: optional BCP-47 language code hint (e.g. \"en\", \"en-US\")
    """

    full_text: str
    lines: List[str]
    engine: str
    language: Optional[str] = None


class OcrEngine(Protocol):
    """Contract for OCR engines.

    Implementations MUST be pure-text only: no side effects, no logging of
    image contents. Callers are responsible for logging request IDs, not data.
    """

    async def extract_text(self, image_bytes: bytes, filename: Optional[str] = None) -> RawOcrResult:  # noqa: D401
        """Run OCR on image_bytes and return a RawOcrResult."""
        ...


__all__ = ["RawOcrResult", "OcrEngine"]

