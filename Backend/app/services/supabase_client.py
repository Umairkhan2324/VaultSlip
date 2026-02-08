"""Supabase client (service role) for backend. Bypasses RLS."""
from supabase import create_client
from app.config import get_settings

_cached_client = None


def get_supabase():
    global _cached_client
    if _cached_client is None:
        settings = get_settings()
        _cached_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
    return _cached_client
