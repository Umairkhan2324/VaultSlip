"""Protected route: return current user_id, org_id, plan, display_name, email."""
from fastapi import APIRouter, Request
import httpx
from app.middleware.auth import require_auth
from app.services.org_quota import get_org
from app.services.supabase_client import get_supabase
from app.config import get_settings

router = APIRouter()


@router.get("/me")
@require_auth
async def me(request: Request):
    user_id = request.state.user_id
    org = get_org(request.state.org_id)
    supabase = get_supabase()
    profile = supabase.table("profiles").select("email, display_name").eq("id", user_id).execute()
    email = None
    display_name = None
    if profile.data and len(profile.data) > 0:
        email = profile.data[0].get("email")
        display_name = profile.data[0].get("display_name")
    if not email:
        settings = get_settings()
        auth_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/user"
        auth_header = request.headers.get("Authorization", "")
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(auth_url, headers={"Authorization": auth_header, "apikey": settings.supabase_service_role_key}, timeout=10.0)
                if resp.status_code == 200:
                    auth_data = resp.json()
                    email = auth_data.get("email")
        except Exception:
            pass
    return {
        "user_id": user_id,
        "org_id": request.state.org_id,
        "plan": org.get("plan", "free"),
        "email": email or "",
        "display_name": display_name,
    }
