"""GET /batches/{id}: batch status for org."""
from fastapi import APIRouter, Request, HTTPException
from app.middleware.auth import require_auth
from app.services.supabase_client import get_supabase

router = APIRouter()


@router.get("/{batch_id}")
@require_auth
async def get_batch(request: Request, batch_id: str):
    # Include failure_reason only after running migration 009_add_batch_failure_reason.sql
    r = get_supabase().table("batches").select(
        "id, status, total_files, processed, failed, created_at"
    ).eq(
        "id", batch_id
    ).eq("org_id", request.state.org_id).execute()
    if not r.data or len(r.data) == 0:
        raise HTTPException(404, detail="Batch not found")
    return r.data[0]
