"""Tier limits and require_quota decorator. Uses get_org and get_monthly_usage."""
from fastapi import Request, HTTPException
from functools import wraps
from app.services.org_quota import get_org, get_monthly_usage

TIER_LIMITS = {
    # TEMP: disable plan differences – treat all as unlimited.
    "free": {"receipts_per_month": -1, "users": -1, "chat": True, "export": "full", "history_days": -1},
    "pro": {"receipts_per_month": -1, "users": -1, "chat": True, "export": "full", "history_days": -1},
    "enterprise": {"receipts_per_month": -1, "users": -1, "chat": True, "export": "full+api", "history_days": -1},
}


def require_quota(feature: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            org = get_org(request.state.org_id)
            limits = TIER_LIMITS.get(org["plan"], TIER_LIMITS["free"])
            # With limits set to -1 / chat=True above, no feature is blocked.
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator
