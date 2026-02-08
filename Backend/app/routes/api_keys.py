"""API key management endpoints."""
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from app.middleware.auth import require_auth
from app.services.supabase_client import get_supabase
from app.services.crypto import generate_api_key, hash_api_key, get_key_prefix

router = APIRouter()
logger = logging.getLogger(__name__)
MAX_KEYS_PER_DAY = 5


class ApiKeyCreate(BaseModel):
    name: str | None = None
    expires_in_days: int | None = None


def count_keys_today(user_id: str) -> int:
    """Count API keys created today by user."""
    supabase = get_supabase()
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    r = supabase.table("api_keys").select("id", count="exact").eq("user_id", user_id).gte("created_at", today_start.isoformat()).execute()
    return r.count or 0


@router.get("")
@require_auth
async def list_api_keys(request: Request):
    """List user's API keys (prefix only, never full key)."""
    user_id = request.state.user_id
    supabase = get_supabase()
    r = supabase.table("api_keys").select("id, key_prefix, is_active, last_used_at, created_at, expires_at").eq("user_id", user_id).order("created_at", desc=True).execute()
    return {"keys": r.data or []}


@router.post("")
@require_auth
async def create_api_key(request: Request, data: ApiKeyCreate = ApiKeyCreate()):
    """Generate new API key (return full key ONCE)."""
    user_id = request.state.user_id
    org_id = request.state.org_id
    if count_keys_today(user_id) >= MAX_KEYS_PER_DAY:
        raise HTTPException(status_code=429, detail="Rate limit: max 5 keys per day")
    full_key = generate_api_key()
    key_hash = hash_api_key(full_key)
    key_prefix = get_key_prefix(full_key)
    expires_at = None
    if data.expires_in_days:
        expires_at = (datetime.utcnow() + timedelta(days=data.expires_in_days)).isoformat()
    supabase = get_supabase()
    r = supabase.table("api_keys").insert({
        "user_id": user_id,
        "org_id": org_id,
        "key_hash": key_hash,
        "key_prefix": key_prefix,
        "expires_at": expires_at,
    }).execute()
    if not r.data:
        raise HTTPException(status_code=500, detail="Failed to create API key")
    return {
        "id": r.data[0]["id"],
        "api_key": full_key,
        "key_prefix": key_prefix,
        "created_at": r.data[0]["created_at"],
        "expires_at": expires_at,
        "warning": "Save this key now. It will not be shown again.",
    }


@router.delete("/{key_id}")
@require_auth
async def revoke_api_key(request: Request, key_id: str):
    """Revoke an API key (set is_active = false)."""
    user_id = request.state.user_id
    supabase = get_supabase()
    r = supabase.table("api_keys").update({"is_active": False}).eq("id", key_id).eq("user_id", user_id).execute()
    if not r.data:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"id": key_id, "revoked": True}
