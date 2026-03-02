"""Protocol for vision-based OCR clients."""
from __future__ import annotations

from typing import Optional, Protocol


class VisionClientProtocol(Protocol):
    """Minimal interface for vision endpoint: image bytes to raw text."""

    async def extract_text_from_image(
        self, image_bytes: bytes, filename: Optional[str] = None
    ) -> str:
        """Return raw textual content extracted from an image."""
        ...
