"""Background batch extraction for uploaded receipts.

This module is responsible for:
- Downloading images from Supabase storage
- De-duplicating images within a batch (by SHA-256)
- Running the extraction pipeline
- Persisting receipts and updating batch status/usage
- Optionally notifying the user when processing completes
"""
from __future__ import annotations

import hashlib
import logging
from typing import List, Tuple

from app.services.supabase_client import get_supabase
from app.services.extraction import extract_batch
from app.services.receipt_store import update_batch, save_receipt
from app.services.org_quota import increment_usage
from app.services.email_service import send_processing_complete_email
from app.services.pdf_extractor import pdf_to_images
from app.utils.redaction import sanitize_failure_reason

logger = logging.getLogger(__name__)


async def process_batch_bg(org_id: str, user_id: str, batch_id: str, storage_paths: List[Tuple[str, str]]) -> None:
    """Background task: download → dedupe → extract → store → notify. Supports images and PDF (pages as images)."""
    supabase = get_supabase()
    bucket = supabase.storage.from_("receipts")
    logger.info(
        "Starting batch extraction",
        extra={"org_id": org_id, "batch_id": batch_id, "files": len(storage_paths)},
    )
    path_tuples: List[Tuple[str, str]] = []
    contents: List[Tuple[int, bytes]] = []
    seen_hashes: set[str] = set()
    for idx, (path, ext) in enumerate(storage_paths):
        try:
            data = bucket.download(path)
            if ext == ".pdf":
                images = pdf_to_images(data)
                for img_bytes in images:
                    digest = hashlib.sha256(img_bytes).hexdigest()
                    if digest in seen_hashes:
                        continue
                    seen_hashes.add(digest)
                    path_tuples.append((path, ext))
                    contents.append((len(contents), img_bytes))
            else:
                digest = hashlib.sha256(data).hexdigest()
                if digest in seen_hashes:
                    logger.info(
                        "Skipping duplicate image in batch",
                        extra={"org_id": org_id, "batch_id": batch_id, "index": idx},
                    )
                    continue
                seen_hashes.add(digest)
                path_tuples.append((path, ext))
                contents.append((len(contents), data))
        except Exception as e:
            logger.error(
                "Failed to download or process file from storage",
                extra={"org_id": org_id, "batch_id": batch_id, "index": idx, "error": str(e)},
            )
    if not contents:
        logger.error("No contents downloaded for batch", extra={"org_id": org_id, "batch_id": batch_id})
        update_batch(batch_id, status="failed")
        return
    update_batch(batch_id, status="processing")
    out = await extract_batch(contents, concurrency=8)
    success = 0
    for item in out["results"]:
        idx = item["index"]
        path, _ = path_tuples[idx]
        url = bucket.get_public_url(path)
        needs_review = (item["data"].get("confidence") or 0) < 0.85
        save_receipt(org_id, batch_id, url, item["data"], needs_review)
        success += 1
    increment_usage(org_id, success)
    status = "done" if not out["errors"] else "partial"
    err_list = out["errors"]
    failure_reason = None
    if err_list:
        first_err = err_list[0].get("error") or "Extraction failed"
        failure_reason = sanitize_failure_reason(first_err)
        for err in err_list:
            idx = err.get("index")
            path = path_tuples[idx][0] if idx < len(path_tuples) else "?"
            logger.error(
                "Batch extraction failed for file: batch_id=%s index=%s path=%s error=%s",
                batch_id, idx, path, err.get("error", ""),
            )
    # Add failure_reason to kwargs after running migration 009_add_batch_failure_reason.sql:
    # if failure_reason is not None: kwargs["failure_reason"] = failure_reason
    kwargs = {"status": status, "processed": success, "failed": len(err_list)}
    update_batch(batch_id, **kwargs)
    logger.info(
        "Finished batch extraction: batch_id=%s processed=%s failed=%s status=%s",
        batch_id, success, len(err_list), status,
    )
    if status != "done":
        return
    try:
        prefs = supabase.table("user_preferences").select(
            "processing_complete_alerts, email_notifications_enabled"
        ).eq("user_id", user_id).execute()
        if prefs.data and len(prefs.data) > 0:
            p = prefs.data[0]
            if p.get("email_notifications_enabled") and p.get("processing_complete_alerts"):
                profile = supabase.table("profiles").select("email").eq("id", user_id).execute()
                if profile.data and len(profile.data) > 0:
                    email = profile.data[0].get("email")
                    if email:
                        await send_processing_complete_email(email, batch_id)
    except Exception as e:  # pragma: no cover - best-effort notifications
        logger.warning("Failed to send completion email", extra={"error": str(e)})

