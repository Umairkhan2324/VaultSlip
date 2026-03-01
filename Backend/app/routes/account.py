"""Account deletion endpoint."""
import logging
import httpx
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from app.middleware.auth import require_auth
from app.services.supabase_client import get_supabase
from app.config import get_settings

router = APIRouter()
logger = logging.getLogger(__name__)


class AccountDeletion(BaseModel):
    confirmation: str
    password: str


@router.delete("")
@require_auth
async def delete_account(request: Request, data: AccountDeletion):
    """Delete user account immediately."""
    if data.confirmation != "DELETE":
        raise HTTPException(status_code=400, detail="Confirmation must be 'DELETE'")
    user_id = request.state.user_id
    org_id = request.state.org_id
    supabase = get_supabase()
    profile = supabase.table("profiles").select("email").eq("id", user_id).execute()
    email = profile.data[0].get("email") if profile.data else None
    if not email:
        raise HTTPException(status_code=404, detail="Profile not found")
    settings = get_settings()
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{settings.supabase_url.rstrip('/')}/auth/v1/token?grant_type=password",
                json={"email": email, "password": data.password},
                headers={"apikey": settings.supabase_service_role_key, "Content-Type": "application/json"},
                timeout=10.0,
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid password")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Auth service unavailable")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid password")
    try:
        supabase.table("api_keys").delete().eq("user_id", user_id).execute()
        supabase.table("chat_messages").delete().eq("user_id", user_id).execute()
        supabase.table("receipts").delete().eq("org_id", org_id).execute()
        supabase.table("batches").delete().eq("org_id", org_id).execute()
        supabase.table("user_preferences").delete().eq("user_id", user_id).execute()
        supabase.table("data_export_jobs").delete().eq("user_id", user_id).execute()
        org_members = supabase.table("profiles").select("id").eq("org_id", org_id).execute()
        if org_members.data and len(org_members.data) == 1:
            supabase.table("organizations").delete().eq("id", org_id).execute()
        supabase.table("profiles").delete().eq("id", user_id).execute()
        logger.info("Account deleted", extra={"user_id": user_id})
        return {"message": "Account deleted successfully"}
    except Exception as e:
        logger.error("Account deletion failed", extra={"user_id": user_id, "error": str(e)})
        raise HTTPException(status_code=500, detail="Failed to delete account")
