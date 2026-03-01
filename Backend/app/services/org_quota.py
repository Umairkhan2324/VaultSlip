"""Org and monthly usage for quota enforcement. Uses Supabase service role."""
from datetime import datetime
from app.services.supabase_client import get_supabase


def get_org(org_id: str) -> dict:
    r = get_supabase().table("organizations").select("id, plan").eq("id", org_id).execute()
    if not r.data or len(r.data) == 0:
        raise ValueError("Org not found")
    return r.data[0]


def get_monthly_usage(org_id: str) -> int:
    now = datetime.utcnow()
    r = get_supabase().table("usage_tracking").select("receipts_processed").eq(
        "org_id", org_id
    ).eq("year", now.year).eq("month", now.month).execute()
    if not r.data or len(r.data) == 0:
        return 0
    return int(r.data[0].get("receipts_processed", 0) or 0)


def increment_usage(org_id: str, count: int) -> None:
    now = datetime.utcnow()
    supabase = get_supabase()
    r = supabase.table("usage_tracking").select("receipts_processed").eq(
        "org_id", org_id
    ).eq("year", now.year).eq("month", now.month).execute()
    if r.data and len(r.data) > 0:
        current = int(r.data[0].get("receipts_processed", 0) or 0)
        supabase.table("usage_tracking").update({
            "receipts_processed": current + count
        }).eq("org_id", org_id).eq("year", now.year).eq("month", now.month).execute()
    else:
        supabase.table("usage_tracking").insert({
            "org_id": org_id,
            "year": now.year,
            "month": now.month,
            "receipts_processed": count,
        }).execute()
