"""User preferences endpoints."""
import logging
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from app.middleware.auth import require_auth
from app.services.supabase_client import get_supabase

router = APIRouter()
logger = logging.getLogger(__name__)


class ExportPreferences(BaseModel):
    default_export_format: str = Field(..., pattern="^(CSV|JSON|Excel)$")
    auto_export_enabled: bool = False
    auto_export_frequency: str = Field(default="weekly", pattern="^(daily|weekly|monthly)$")


class NotificationPreferences(BaseModel):
    email_notifications_enabled: bool = True
    processing_complete_alerts: bool = True
    weekly_summary: bool = False


def get_or_create_preferences(user_id: str) -> dict:
    """Get user preferences, creating defaults if missing."""
    supabase = get_supabase()
    r = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
    if r.data and len(r.data) > 0:
        return r.data[0]
    defaults = {
        "user_id": user_id,
        "default_export_format": "CSV",
        "auto_export_enabled": False,
        "auto_export_frequency": "weekly",
        "email_notifications_enabled": True,
        "processing_complete_alerts": True,
        "weekly_summary": False,
    }
    r = supabase.table("user_preferences").insert(defaults).execute()
    return r.data[0] if r.data else defaults


@router.get("")
@require_auth
async def get_preferences(request: Request):
    """Get user preferences."""
    user_id = request.state.user_id
    prefs = get_or_create_preferences(user_id)
    return prefs


@router.patch("/export")
@require_auth
async def update_export_preferences(request: Request, data: ExportPreferences):
    """Update export preferences."""
    user_id = request.state.user_id
    supabase = get_supabase()
    try:
        update_data = {
            "default_export_format": data.default_export_format,
            "auto_export_enabled": data.auto_export_enabled,
            "auto_export_frequency": data.auto_export_frequency,
        }
        r = supabase.table("user_preferences").upsert({
            "user_id": user_id,
            **update_data
        }).execute()
        return r.data[0] if r.data else update_data
    except Exception as e:
        logger.error("Export preferences update failed", extra={"user_id": user_id, "error": str(e)})
        raise HTTPException(status_code=500, detail="Failed to update preferences")


@router.patch("/notifications")
@require_auth
async def update_notification_preferences(request: Request, data: NotificationPreferences):
    """Update notification preferences."""
    user_id = request.state.user_id
    supabase = get_supabase()
    try:
        update_data = {
            "email_notifications_enabled": data.email_notifications_enabled,
            "processing_complete_alerts": data.processing_complete_alerts,
            "weekly_summary": data.weekly_summary,
        }
        r = supabase.table("user_preferences").upsert({
            "user_id": user_id,
            **update_data
        }).execute()
        return r.data[0] if r.data else update_data
    except Exception as e:
        logger.error("Notification preferences update failed", extra={"user_id": user_id, "error": str(e)})
        raise HTTPException(status_code=500, detail="Failed to update preferences")
