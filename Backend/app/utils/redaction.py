"""Redact sensitive data before logging. No PII or secrets in logs."""
from __future__ import annotations

import re

SENSITIVE_KEYS = frozenset({
    "password", "token", "authorization", "api_key", "secret",
    "email", "cookie", "set-cookie", "x-api-key",
})

# API key patterns: gsk_..., sk-..., etc.
API_KEY_PATTERN = re.compile(r"\b(gsk_|sk-)[a-zA-Z0-9_-]{20,}\b", re.IGNORECASE)


def redact_dict(d: dict) -> dict:
    """Return a copy with sensitive keys redacted (value replaced by '[redacted]')."""
    out = {}
    for k, v in d.items():
        key_lower = k.lower() if isinstance(k, str) else ""
        if key_lower in SENSITIVE_KEYS or "token" in key_lower or "secret" in key_lower:
            out[k] = "[redacted]"
        elif isinstance(v, dict):
            out[k] = redact_dict(v)
        else:
            out[k] = v
    return out


def redact_message(msg: str) -> str:
    """Replace token-like substrings with [redacted]."""
    if not isinstance(msg, str):
        return str(msg)
    if "Bearer " in msg or "bearer " in msg:
        msg = msg.split("Bearer ")[0] + "Bearer [redacted]"
    return API_KEY_PATTERN.sub(r"\1[redacted]", msg)


def sanitize_failure_reason(msg: str, max_len: int = 200) -> str:
    """Safe, short string for batch failure_reason (no secrets)."""
    s = redact_message(msg).strip()[:max_len]
    return s if s else "Extraction failed"
