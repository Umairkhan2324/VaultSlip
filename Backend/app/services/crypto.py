"""Cryptographic utilities for API key generation and hashing."""
import secrets
import bcrypt


def generate_api_key() -> str:
    """Generate a secure random API key (32+ characters)."""
    return f"vs_live_{secrets.token_urlsafe(32)}"


def hash_api_key(key: str) -> str:
    """Hash an API key using bcrypt."""
    return bcrypt.hashpw(key.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_api_key(plain_key: str, key_hash: str) -> bool:
    """Verify an API key against its hash."""
    try:
        return bcrypt.checkpw(plain_key.encode("utf-8"), key_hash.encode("utf-8"))
    except Exception:
        return False


def get_key_prefix(key: str) -> str:
    """Extract prefix from API key (first 19 chars: 'vs_live_' + 12 chars)."""
    if len(key) < 19:
        return key[:12]
    return key[:19]
