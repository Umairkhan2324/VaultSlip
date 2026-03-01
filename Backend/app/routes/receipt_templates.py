"""Receipt template CRUD: save, list, apply templates."""
from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from app.middleware.auth import require_auth
from app.services.supabase_client import get_supabase

router = APIRouter()


class TemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=500)
    template_data: dict


class TemplateUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=500)
    template_data: dict | None = None


@router.post("")
@require_auth
async def create_template(request: Request, data: TemplateCreate):
    org_id = request.state.org_id
    user_id = request.state.user_id
    supabase = get_supabase()
    r = supabase.table("receipt_templates").insert({
        "org_id": org_id,
        "user_id": user_id,
        "name": data.name,
        "description": data.description,
        "template_data": data.template_data,
    }).execute()
    return r.data[0] if r.data else None


@router.get("")
@require_auth
async def list_templates(request: Request):
    org_id = request.state.org_id
    supabase = get_supabase()
    r = supabase.table("receipt_templates").select("*").eq(
        "org_id", org_id
    ).order("created_at", desc=True).execute()
    return {"templates": r.data or []}


@router.get("/{template_id}")
@require_auth
async def get_template(request: Request, template_id: str):
    org_id = request.state.org_id
    supabase = get_supabase()
    r = supabase.table("receipt_templates").select("*").eq("id", template_id).eq(
        "org_id", org_id
    ).execute()
    if not r.data or len(r.data) == 0:
        raise HTTPException(404, detail="Template not found")
    return r.data[0]


@router.patch("/{template_id}")
@require_auth
async def update_template(request: Request, template_id: str, data: TemplateUpdate):
    org_id = request.state.org_id
    supabase = get_supabase()
    update_data = {}
    if data.name is not None:
        update_data["name"] = data.name
    if data.description is not None:
        update_data["description"] = data.description
    if data.template_data is not None:
        update_data["template_data"] = data.template_data
    if not update_data:
        raise HTTPException(400, detail="No fields to update")
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    r = supabase.table("receipt_templates").update(update_data).eq("id", template_id).eq(
        "org_id", org_id
    ).execute()
    if not r.data or len(r.data) == 0:
        raise HTTPException(404, detail="Template not found")
    return r.data[0]


@router.delete("/{template_id}")
@require_auth
async def delete_template(request: Request, template_id: str):
    org_id = request.state.org_id
    supabase = get_supabase()
    r = supabase.table("receipt_templates").delete().eq("id", template_id).eq(
        "org_id", org_id
    ).execute()
    if not r.data or len(r.data) == 0:
        raise HTTPException(404, detail="Template not found")
    return {"deleted": True}


@router.post("/apply/{receipt_id}/{template_id}")
@require_auth
async def apply_template(request: Request, receipt_id: str, template_id: str):
    org_id = request.state.org_id
    supabase = get_supabase()
    receipt = supabase.table("receipts").select("*").eq("id", receipt_id).eq(
        "org_id", org_id
    ).eq("is_deleted", False).execute()
    if not receipt.data or len(receipt.data) == 0:
        raise HTTPException(404, detail="Receipt not found")
    template = supabase.table("receipt_templates").select("*").eq("id", template_id).eq(
        "org_id", org_id
    ).execute()
    if not template.data or len(template.data) == 0:
        raise HTTPException(404, detail="Template not found")
    template_data = template.data[0].get("template_data", {})
    update_fields = {}
    if "vendor" in template_data:
        update_fields["vendor"] = template_data["vendor"]
    if "category" in template_data:
        update_fields["category"] = template_data["category"]
    if "date" in template_data:
        update_fields["date"] = template_data["date"]
    if "total" in template_data:
        update_fields["total"] = template_data["total"]
    if "tax" in template_data:
        update_fields["tax"] = template_data["tax"]
    if "currency" in template_data:
        update_fields["currency"] = template_data["currency"]
    if update_fields:
        update_fields["updated_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        supabase.table("receipts").update(update_fields).eq("id", receipt_id).execute()
    if "items" in template_data and isinstance(template_data["items"], list):
        existing = supabase.table("receipt_items").select("id").eq("receipt_id", receipt_id).execute()
        for item_id in [x["id"] for x in (existing.data or [])]:
            supabase.table("receipt_items").delete().eq("id", item_id).execute()
        for item in template_data["items"]:
            supabase.table("receipt_items").insert({
                "receipt_id": receipt_id,
                "description": str(item.get("description", "")),
                "quantity": float(item.get("quantity", 0)) if item.get("quantity") is not None else None,
                "unit_price": float(item.get("unit_price", 0)) if item.get("unit_price") is not None else None,
                "subtotal": float(item.get("subtotal", 0)) if item.get("subtotal") is not None else None,
            }).execute()
    updated = supabase.table("receipts").select("*").eq("id", receipt_id).execute()
    items = supabase.table("receipt_items").select("*").eq("receipt_id", receipt_id).execute()
    result = updated.data[0] if updated.data else {}
    result["items"] = items.data or []
    return result
