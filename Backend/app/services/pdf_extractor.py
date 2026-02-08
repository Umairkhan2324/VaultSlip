"""Extract page images from PDF for receipt digitization pipeline."""
from __future__ import annotations

import io
from typing import List

from PIL import Image
import fitz  # pymupdf


def pdf_to_images(pdf_bytes: bytes) -> List[bytes]:
    """Render each PDF page as PNG image bytes for OCR pipeline."""
    out: List[bytes] = []
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        for i in range(len(doc)):
            page = doc.load_page(i)
            pix = page.get_pixmap(dpi=150, alpha=False)
            img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            buf = io.BytesIO()
            img.save(buf, "PNG")
            out.append(buf.getvalue())
    finally:
        doc.close()
    return out
