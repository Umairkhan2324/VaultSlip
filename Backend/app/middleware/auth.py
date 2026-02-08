"""Verify token via Supabase Auth server (works with HS256 and RS256). Resolve org_id from profiles."""
import logging
from functools import wraps
import httpx
from fastapi import Request, HTTPException
from app.config import get_settings
from app.services.supabase_client import get_supabase

logger = logging.getLogger(__name__)


def require_auth(handler):
    @wraps(handler)
    async def wrapper(request: Request, *args, **kwargs):
        auth = request.headers.get("Authorization") or ""
        if not auth.startswith("Bearer "):
            logger.info("Auth: no Bearer header")
            raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
        token = auth[7:].strip()
        if not token:
            logger.info("Auth: empty token")
            raise HTTPException(status_code=401, detail="Missing token")
        settings = get_settings()
        url = f"{settings.supabase_url.rstrip('/')}/auth/v1/user"
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": settings.supabase_service_role_key,
        }
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, headers=headers, timeout=10.0)
        except httpx.RequestError as e:
            logger.warning("Auth: Supabase request failed", extra={"error": str(type(e).__name__)})
            raise HTTPException(status_code=503, detail="Auth service unavailable")
        if resp.status_code != 200:
            logger.info("Auth: invalid or expired token")
            raise HTTPException(status_code=401, detail="Invalid token")
        data = resp.json()
        user_id = (data.get("id") or data.get("sub")) if isinstance(data, dict) else None
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        supabase = get_supabase()
        r = supabase.table("profiles").select("org_id").eq("id", user_id).execute()
        if not r.data or len(r.data) == 0:
            raise HTTPException(status_code=403, detail="Profile not found")
        request.state.user_id = user_id
        request.state.org_id = str(r.data[0]["org_id"])
        return await handler(request, *args, **kwargs)
    return wrapper
