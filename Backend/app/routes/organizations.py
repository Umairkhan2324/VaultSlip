"""Organization read/update endpoints."""
import logging
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field, field_validator
from app.middleware.auth import require_auth
from app.services.supabase_client import get_supabase

router = APIRouter()
logger = logging.getLogger(__name__)


class OrganizationUpdate(BaseModel):
    name: str = Field(..., max_length=200)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Organization name cannot be empty")
        return v


@router.get("/{org_id}")
@require_auth
async def get_organization(request: Request, org_id: str):
    """Return organization details for current user."""
    user_org_id = request.state.org_id
    if org_id != user_org_id:
        raise HTTPException(status_code=403, detail="Access denied")
    supabase = get_supabase()
    r = supabase.table("organizations").select("id, name, plan").eq("id", org_id).execute()
    if not r.data:
        raise HTTPException(status_code=404, detail="Organization not found")
    return r.data[0]


@router.patch("/{org_id}")
@require_auth
async def update_organization(request: Request, org_id: str, data: OrganizationUpdate):
    """Update organization name."""
    user_org_id = request.state.org_id
    if org_id != user_org_id:
        raise HTTPException(status_code=403, detail="Access denied")
    supabase = get_supabase()
    try:
        r = supabase.table("organizations").update(
            {"name": data.name}
        ).eq("id", org_id).execute()
        if not r.data:
            raise HTTPException(status_code=404, detail="Organization not found")
        return {"id": org_id, "name": data.name, "updated": True}
    except Exception as e:
        logger.error("Organization update failed", extra={"org_id": org_id, "error": str(e)})
        raise HTTPException(status_code=500, detail="Failed to update organization")
