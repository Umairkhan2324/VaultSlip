"""Save receipts and items to Supabase; create/update batches; increment usage."""
import uuid
from app.services.supabase_client import get_supabase
from app.services.org_quota import increment_usage


def create_batch(org_id: str, user_id: str, batch_id: str, total_files: int) -> None:
    get_supabase().table("batches").insert({
        "id": batch_id,
        "org_id": org_id,
        "user_id": user_id,
        "status": "pending",
        "total_files": total_files,
    }).execute()


def update_batch(batch_id: str, **kwargs) -> None:
    get_supabase().table("batches").update(kwargs).eq("id", batch_id).execute()


def save_receipt(org_id: str, batch_id: str, image_url: str, data: dict, needs_review: bool) -> str:
    supabase = get_supabase()
    receipt_id = str(uuid.uuid4())
    items = data.get("items", [])
    supabase.table("receipts").insert({
        "id": receipt_id,
        "org_id": org_id,
        "batch_id": batch_id,
        "image_url": image_url,
        "raw_json": data,
        "vendor": data.get("vendor"),
        "date": data.get("date"),
        "total": data.get("total"),
        "tax": data.get("tax"),
        "currency": data.get("currency", "USD"),
        "category": data.get("category"),
        "confidence": data.get("confidence"),
        "needs_review": needs_review,
        "is_deleted": False,
    }).execute()
    for it in items:
        supabase.table("receipt_items").insert({
            "receipt_id": receipt_id,
            "description": it.get("description", ""),
            "quantity": it.get("quantity"),
            "unit_price": it.get("unit_price"),
            "subtotal": it.get("subtotal"),
            "confidence": it.get("confidence"),
        }).execute()
    return receipt_id


def save_receipt_from_import(org_id: str, batch_id: str, row: dict) -> str:
    """Save one receipt from bulk import (CSV/XLSX); no image, no OCR."""
    supabase = get_supabase()
    receipt_id = str(uuid.uuid4())
    data = {
        "vendor": row.get("vendor"),
        "date": row.get("date"),
        "total": row.get("total"),
        "tax": row.get("tax"),
        "currency": row.get("currency", "USD"),
        "category": row.get("category"),
        "items": row.get("items", []),
    }
    supabase.table("receipts").insert({
        "id": receipt_id,
        "org_id": org_id,
        "batch_id": batch_id,
        "image_url": "",
        "raw_json": data,
        "vendor": data["vendor"],
        "date": data["date"],
        "total": data["total"],
        "tax": data.get("tax"),
        "currency": data["currency"],
        "category": data["category"],
        "confidence": 1.0,
        "needs_review": False,
        "is_deleted": False,
    }).execute()
    for it in data.get("items", []):
        supabase.table("receipt_items").insert({
            "receipt_id": receipt_id,
            "description": it.get("description", ""),
            "quantity": it.get("quantity"),
            "unit_price": it.get("unit_price"),
            "subtotal": it.get("subtotal"),
        }).execute()
    return receipt_id
