"""Heuristic receipt detector: reject obviously non-receipt images.

Keeps logic lightweight: size + simple variance check. No external models.
"""
from typing import TypedDict

from PIL import Image
from io import BytesIO


class ReceiptCheck(TypedDict):
    is_receipt: bool
    reason: str


MIN_DIM = 300  # pixels
MIN_VARIANCE = 15.0  # very low variance => likely blank / solid image


def _image_from_bytes(content: bytes) -> Image.Image | None:
    try:
        return Image.open(BytesIO(content))
    except Exception:
        return None


def _luminance_variance(img: Image.Image) -> float:
    # Downscale to keep this cheap, work in grayscale.
    gray = img.convert("L").resize((64, 64))
    hist = gray.histogram()
    total = sum(hist)
    if total == 0:
        return 0.0
    mean = sum(i * c for i, c in enumerate(hist)) / total
    var = sum(((i - mean) ** 2) * c for i, c in enumerate(hist)) / total
    return float(var)


def validate_receipt_image(content: bytes, filename: str) -> ReceiptCheck:
    """Best-effort heuristic: not perfect, but filters out junk images.

    - Rejects if the image cannot be opened.
    - Rejects if width or height is below MIN_DIM.
    - Rejects nearly blank / solid-color images using luminance variance.
    """
    img = _image_from_bytes(content)
    if img is None:
        return {"is_receipt": False, "reason": "Image could not be decoded"}

    w, h = img.size
    if w < MIN_DIM or h < MIN_DIM:
        return {
            "is_receipt": False,
            "reason": f"Image too small ({w}x{h}), please upload a clear photo of the receipt",
        }

    var = _luminance_variance(img)
    if var < MIN_VARIANCE:
        return {
            "is_receipt": False,
            "reason": "Image appears blank or very low contrast, not a readable receipt photo",
        }

    return {"is_receipt": True, "reason": ""}

