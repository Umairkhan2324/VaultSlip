"""Data export endpoints."""
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from app.middleware.auth import require_auth
from app.services.supabase_client import get_supabase
from app.services.export_service import export_user_data

router = APIRouter()
logger = logging.getLogger(__name__)


class ExportRequest(BaseModel):
    format: str = Field(default="ZIP", pattern="^(ZIP|JSON|CSV|Excel)$")


def check_rate_limit(user_id: str) -> bool:
    """Check if user can export (1 per 24 hours)."""
    supabase = get_supabase()
    yesterday = (datetime.utcnow() - timedelta(days=1)).isoformat()
    r = supabase.table("data_export_jobs").select("id", count="exact").eq("user_id", user_id).gte("created_at", yesterday).execute()
    return (r.count or 0) < 1


@router.post("/export")
@require_auth
async def create_export(request: Request, data: ExportRequest = ExportRequest()):
    """Create data export (synchronous)."""
    user_id = request.state.user_id
    org_id = request.state.org_id
    if not check_rate_limit(user_id):
        raise HTTPException(status_code=429, detail="Rate limit: 1 export per 24 hours")
    supabase = get_supabase()
    try:
        job = supabase.table("data_export_jobs").insert({
            "user_id": user_id,
            "org_id": org_id,
            "status": "processing",
            "format": data.format,
        }).execute()
        job_id = job.data[0]["id"] if job.data else None
        storage_path, download_url = export_user_data(user_id, org_id, data.format)
        expires_at = (datetime.utcnow() + timedelta(days=7)).isoformat()
        supabase.table("data_export_jobs").update({
            "status": "completed",
            "storage_path": storage_path,
            "download_url": download_url,
            "expires_at": expires_at,
            "completed_at": datetime.utcnow().isoformat(),
        }).eq("id", job_id).execute()
        return {"job_id": job_id, "status": "completed", "download_url": download_url, "expires_at": expires_at}
    except Exception as e:
        logger.error("Export failed", extra={"user_id": user_id, "error": str(e)})
        if job_id:
            supabase.table("data_export_jobs").update({
                "status": "failed",
                "error_message": str(e),
            }).eq("id", job_id).execute()
        raise HTTPException(status_code=500, detail="Export failed")


@router.get("/export/{job_id}")
@require_auth
async def get_export_status(request: Request, job_id: str):
    """Get export job status."""
    user_id = request.state.user_id
    supabase = get_supabase()
    r = supabase.table("data_export_jobs").select("*").eq("id", job_id).eq("user_id", user_id).execute()
    if not r.data or len(r.data) == 0:
        raise HTTPException(status_code=404, detail="Export job not found")
    return r.data[0]
