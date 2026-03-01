"""POST /upload: auth, quota, validate files, save to Storage, background extract."""
import logging
import uuid
from pathlib import Path
from fastapi import APIRouter, Request, UploadFile, File, HTTPException, BackgroundTasks
from app.middleware.auth import require_auth
from app.middleware.quota import require_quota
from app.services.supabase_client import get_supabase
from app.services.receipt_store import create_batch
from app.services.org_quota import get_org
from app.services.receipt_detector import validate_receipt_image
from app.services.batch_processor import process_batch_bg

router = APIRouter()
logger = logging.getLogger(__name__)
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".pdf"}
IMAGE_EXTS = {".jpg", ".jpeg", ".png"}
MAX_SIZE_MB = 1
MAX_FILES = 200
IMAGE_SIGS = [(b"\xff\xd8\xff", "jpeg"), (b"\x89PNG\r\n\x1a\n", "png")]
PDF_SIG = b"%PDF"


def is_valid_image(content: bytes) -> bool:
    return any(content[: len(s)] == s for s, _ in IMAGE_SIGS)


def is_valid_pdf(content: bytes) -> bool:
    return len(content) >= 5 and content[:5] == PDF_SIG


@router.post("")
@require_auth
@require_quota("upload")
async def upload_receipts(
    request: Request,
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...),
):
    org_id = request.state.org_id
    user_id = request.state.user_id
    # Quota enforcement is effectively disabled for now; all plans behave the same.
    # get_org(org_id) is still called for consistency and future use.
    _ = get_org(org_id)
    if not files:
        raise HTTPException(400, detail="No files provided")
    if len(files) > MAX_FILES:
        raise HTTPException(400, detail=f"Max {MAX_FILES} files per batch")
    batch_id = str(uuid.uuid4())
    storage_paths: list[tuple[str, str]] = []
    skipped: list[dict[str, str]] = []
    bucket = get_supabase().storage.from_("receipts")
    for f in files:
        ext = Path(f.filename or "").suffix.lower()
        if ext not in ALLOWED_EXT:
            raise HTTPException(400, detail=f"Invalid type: {f.filename}. Allowed: jpg, jpeg, png, pdf.")
        content = await f.read()
        if len(content) > MAX_SIZE_MB * 1024 * 1024:
            raise HTTPException(400, detail=f"File too large: {f.filename}. Max 1 MB per file.")
        if ext in IMAGE_EXTS:
            if not is_valid_image(content):
                raise HTTPException(400, detail=f"Invalid image: {f.filename}")
            check = validate_receipt_image(content, f.filename or "")
            if not check["is_receipt"]:
                skipped.append({"filename": f.filename or "unnamed", "reason": check["reason"]})
                continue
        elif ext == ".pdf":
            if not is_valid_pdf(content):
                raise HTTPException(400, detail=f"Invalid PDF: {f.filename}")
        path = f"{org_id}/{batch_id}/{uuid.uuid4()}{ext}"
        content_type = f.content_type or ("application/pdf" if ext == ".pdf" else "image/jpeg")
        bucket.upload(path, content, {"content-type": content_type})
        storage_paths.append((path, ext))
    if not storage_paths:
        if skipped:
            raise HTTPException(
                400,
                detail={
                    "error": "No valid receipts found. Please upload receipt images only.",
                    "skipped": skipped,
                },
            )
        raise HTTPException(400, detail="No valid receipt files found")
    create_batch(org_id, user_id, batch_id, total_files=len(files))
    background_tasks.add_task(process_batch_bg, org_id, user_id, batch_id, storage_paths)
    resp: dict[str, object] = {
        "batch_id": batch_id,
        "status": "processing",
        "total_files": len(files),
    }
    if skipped:
        resp["skipped"] = skipped
    return resp
