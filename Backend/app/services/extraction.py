"""Receipt extraction pipeline: OCR engine + Groq structuring."""
import asyncio
import logging
from typing import Dict, List, Tuple

from app.ocr.factory import get_ocr_engine
from app.pipeline.structuring_llm_groq import structure_with_groq

logger = logging.getLogger(__name__)


async def _extract_one(index: int, content: bytes) -> Tuple[int, Dict]:
    engine = get_ocr_engine()
    ocr = await engine.extract_text(content)
    ext = await structure_with_groq(ocr)
    return index, ext.model_dump()


async def extract_batch(image_contents: List[Tuple[int, bytes]], concurrency: int = 8) -> dict:
    """Process a batch of images using the hybrid OCR + Groq pipeline."""
    sem = asyncio.Semaphore(concurrency)
    results: List[Dict] = []
    errors: List[Dict] = []

    async def one(index: int, content: bytes) -> None:
        async with sem:
            try:
                idx, data = await _extract_one(index, content)
                results.append({"index": idx, "data": data})
            except Exception as e:
                err_msg = str(e)
                logger.error("Extraction failed for index %s: %s", index, err_msg)
                errors.append({"index": index, "error": err_msg})

    await asyncio.gather(*[one(idx, c) for idx, c in image_contents])
    return {"results": results, "errors": errors}

