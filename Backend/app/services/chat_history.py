"""Load and save chat messages for org + user."""
from app.services.supabase_client import get_supabase


def get_recent_chat_history(org_id: str, user_id: str, limit: int = 20) -> list[dict]:
    r = get_supabase().table("chat_messages").select("role, content").eq(
        "org_id", org_id
    ).eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
    rows = (r.data or [])[::-1]
    return [{"role": x["role"], "content": x["content"]} for x in rows]


def save_chat_message(org_id: str, user_id: str, role: str, content: str) -> None:
    get_supabase().table("chat_messages").insert({
        "org_id": org_id,
        "user_id": user_id,
        "role": role,
        "content": content,
    }).execute()
