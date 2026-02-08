"""Profile update endpoint."""
import logging
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field, field_validator
from app.middleware.auth import require_auth
from app.services.supabase_client import get_supabase

router = APIRouter()
logger = logging.getLogger(__name__)


class ProfileUpdate(BaseModel):
    display_name: str = Field(..., max_length=100)

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Display name cannot be empty")
        return v


@router.patch("")
@require_auth
async def update_profile(request: Request, data: ProfileUpdate):
    """Update user profile display name."""
    user_id = request.state.user_id
    supabase = get_supabase()
    try:
        r = supabase.table("profiles").update({
            "display_name": data.display_name
        }).eq("id", user_id).execute()
        if not r.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return {"user_id": user_id, "display_name": data.display_name, "updated": True}
    except Exception as e:
        logger.error("Profile update failed", extra={"user_id": user_id, "error": str(e)})
        raise HTTPException(status_code=500, detail="Failed to update profile")
