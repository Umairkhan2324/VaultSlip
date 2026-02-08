"""Receipts CRUD: list, get, patch, export; bulk import from CSV/XLSX."""
import csv
import io
import uuid
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, Request, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from app.middleware.auth import require_auth
from app.middleware.quota import TIER_LIMITS, require_quota
from app.services.org_quota import get_org, increment_usage
from app.services.supabase_client import get_supabase
from app.services.receipt_store import create_batch, update_batch, save_receipt_from_import
from app.services.import_parser import parse_csv, parse_xlsx

router = APIRouter()
SAFE_FIELDS = {"vendor", "category", "date", "notes", "total", "tax", "currency"}


@router.get("/export")
@require_auth
async def export_receipts(request: Request, format: str = "csv"):
    org_id = request.state.org_id
    org = get_org(org_id)
    limits = TIER_LIMITS.get(org["plan"], TIER_LIMITS["free"])
    if limits.get("export") == "basic" and format != "csv":
        raise HTTPException(403, detail="Excel export requires Pro plan")
    r = get_supabase().table("receipts").select(
        "id, vendor, date, total, tax, currency, category, confidence, needs_review, created_at"
    ).eq("org_id", org_id).eq("is_deleted", False).order("created_at", desc=True).execute()
    rows = r.data or []
    if format == "csv":
        buf = io.StringIO()
        w = csv.writer(buf)
        w.writerow(["id", "vendor", "date", "total", "tax", "currency", "category", "confidence", "needs_review", "created_at"])
        for x in rows:
            w.writerow([
                x.get("id"), x.get("vendor"), x.get("date"), x.get("total"), x.get("tax"),
                x.get("currency"), x.get("category"), x.get("confidence"), x.get("needs_review"), x.get("created_at"),
            ])
        buf.seek(0)
        return StreamingResponse(
            iter([buf.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=receipts.csv"},
        )
    raise HTTPException(400, detail="format must be csv")


@router.get("")
@require_auth
async def list_receipts(request: Request, skip: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=100)):
    r = get_supabase().table("receipts").select(
        "id, batch_id, image_url, vendor, date, total, tax, currency, category, confidence, needs_review, created_at"
    ).eq("org_id", request.state.org_id).eq("is_deleted", False).order("created_at", desc=True).range(
        skip, skip + limit - 1
    ).execute()
    return {"items": r.data or [], "skip": skip, "limit": limit}


@router.post("/import")
@require_auth
@require_quota("upload")
async def import_receipts(request: Request, file: UploadFile = File(...)):
    """Bulk import receipts from CSV or XLSX (vendor, date, total, currency, category)."""
    org_id = request.state.org_id
    user_id = request.state.user_id
    _ = get_org(org_id)
    ext = Path(file.filename or "").suffix.lower()
    if ext not in (".csv", ".xlsx"):
        raise HTTPException(400, detail="Only CSV and XLSX are allowed for import.")
    content = await file.read()
    if ext == ".csv":
        rows = parse_csv(content)
    else:
        rows = parse_xlsx(content)
    if not rows:
        raise HTTPException(400, detail="No valid receipt rows found. Need vendor, date, or total.")
    batch_id = str(uuid.uuid4())
    create_batch(org_id, user_id, batch_id, total_files=len(rows))
    for row in rows:
        save_receipt_from_import(org_id, batch_id, row)
    increment_usage(org_id, len(rows))
    update_batch(batch_id, status="done", processed=len(rows))
    return {"batch_id": batch_id, "imported": len(rows)}


RECEIPT_COLUMNS = (
    "id, batch_id, image_url, vendor, date, total, tax, currency, category, "
    "confidence, needs_review, created_at, updated_at, is_deleted"
)


@router.get("/{receipt_id}")
@require_auth
async def get_receipt(request: Request, receipt_id: str):
    r = get_supabase().table("receipts").select(RECEIPT_COLUMNS).eq("id", receipt_id).eq(
        "org_id", request.state.org_id
    ).eq("is_deleted", False).execute()
    if not r.data or len(r.data) == 0:
        raise HTTPException(404, detail="Receipt not found")
    receipt = r.data[0]
    items = get_supabase().table("receipt_items").select("*").eq("receipt_id", receipt_id).execute()
    receipt["items"] = items.data or []
    return receipt


@router.patch("/{receipt_id}")
@require_auth
async def patch_receipt(request: Request, receipt_id: str, body: dict):
    allowed = {k: v for k, v in body.items() if k in SAFE_FIELDS}
    if not allowed:
        raise HTTPException(400, detail=f"Allowed fields: {SAFE_FIELDS}")
    allowed["updated_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    r = get_supabase().table("receipts").update(allowed).eq(
        "id", receipt_id
    ).eq("org_id", request.state.org_id).execute()
    if not r.data or len(r.data) == 0:
        raise HTTPException(404, detail="Receipt not found")
    return r.data[0]


@router.patch("/{receipt_id}/items")
@require_auth
async def patch_receipt_items(request: Request, receipt_id: str, body: dict):
    org_id = request.state.org_id
    supabase = get_supabase()
    receipt_check = supabase.table("receipts").select("id").eq("id", receipt_id).eq(
        "org_id", org_id
    ).eq("is_deleted", False).execute()
    if not receipt_check.data or len(receipt_check.data) == 0:
        raise HTTPException(404, detail="Receipt not found")
    items = body.get("items", [])
    if not isinstance(items, list):
        raise HTTPException(400, detail="items must be an array")
    existing = supabase.table("receipt_items").select("id").eq("receipt_id", receipt_id).execute()
    existing_ids = {x["id"] for x in (existing.data or [])}
    new_ids = {x.get("id") for x in items if x.get("id")}
    to_delete = existing_ids - new_ids
    for item_id in to_delete:
        supabase.table("receipt_items").delete().eq("id", item_id).execute()
    for item in items:
        item_data = {
            "receipt_id": receipt_id,
            "description": str(item.get("description", "")),
            "quantity": float(item.get("quantity", 0)) if item.get("quantity") is not None else None,
            "unit_price": float(item.get("unit_price", 0)) if item.get("unit_price") is not None else None,
            "subtotal": float(item.get("subtotal", 0)) if item.get("subtotal") is not None else None,
        }
        if item.get("id") and item["id"] in existing_ids:
            supabase.table("receipt_items").update(item_data).eq("id", item["id"]).execute()
        else:
            supabase.table("receipt_items").insert(item_data).execute()
    updated = supabase.table("receipt_items").select("*").eq("receipt_id", receipt_id).execute()
    return {"items": updated.data or []}
