"""Health check for Render/load balancers."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}
