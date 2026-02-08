"""Receipt-focused tools used by the Groq chat agent."""
from __future__ import annotations

import json
from typing import Any, Dict, List

from app.services.supabase_client import get_supabase


def _table():
    return get_supabase().table("receipts")


def search_receipts(org_id: str, query: str) -> str:
    q = (query or "").lower()
    r = (
        _table()
        .select("id, vendor, date, total, category")
        .eq("org_id", org_id)
        .eq("is_deleted", False)
        .execute()
    )
    rows = r.data or []
    if q:
        rows = [
            x
            for x in rows
            if q in (x.get("vendor") or "").lower() or q in (x.get("category") or "").lower()
        ]
    return json.dumps(rows[:50]) if rows else "No receipts matched."


def get_spending_summary(org_id: str) -> str:
    r = (
        _table()
        .select("category, total")
        .eq("org_id", org_id)
        .eq("is_deleted", False)
        .execute()
    )
    rows = r.data or []
    by_cat: Dict[str, float] = {}
    total = 0.0
    for x in rows:
        c = x.get("category") or "Other"
        amount = float(x.get("total") or 0)
        by_cat[c] = by_cat.get(c, 0.0) + amount
        total += amount
    return json.dumps({"total_spend": total, "by_category": by_cat})


def get_flagged_receipts(org_id: str) -> str:
    r = (
        _table()
        .select("id, vendor, total, confidence, needs_review, category")
        .eq("org_id", org_id)
        .eq("is_deleted", False)
        .or_("needs_review.eq.true,confidence.lt.0.85")
        .execute()
    )
    return json.dumps(r.data or []) if r.data else "No receipts need review."


def audit_high_spend(org_id: str, min_total: float, category: str | None = None) -> str:
    base = (
        _table()
        .select("id, vendor, date, total, category, confidence, needs_review")
        .eq("org_id", org_id)
        .eq("is_deleted", False)
        .gte("total", min_total)
    )
    if category:
        base = base.eq("category", category)
    r = base.order("total", desc=True).limit(100).execute()
    rows = r.data or []
    return json.dumps(rows) if rows else "No receipts exceeded that threshold."


def run_tool(org_id: str, name: str, args: Dict[str, Any]) -> str:
    if name == "search_receipts":
        return search_receipts(org_id, args.get("query") or "")
    if name == "get_spending_summary":
        return get_spending_summary(org_id)
    if name == "get_flagged_receipts":
        return get_flagged_receipts(org_id)
    if name == "audit_high_spend":
        min_total = float(args.get("min_total") or 0)
        category = args.get("category") or None
        return audit_high_spend(org_id, min_total, category)
    return "Unknown tool"


__all__ = ["run_tool"]

