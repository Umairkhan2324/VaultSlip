"""
Create a test user in Supabase Auth for load testing and E2E.
Trigger handle_new_user() creates org + profile automatically.
Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or set in Backend/.env).
Optional: TEST_USER_EMAIL (default loadtest@vaultslip.local), TEST_USER_PASSWORD.
"""
import os
import sys

# Load Backend/.env when run from Backend or project root
try:
    from dotenv import load_dotenv
    _dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    load_dotenv(os.path.join(_dir, ".env"))
except ImportError:
    pass

import httpx

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BASE = os.environ.get("SUPABASE_URL", "").rstrip("/")
KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
EMAIL = os.environ.get("TEST_USER_EMAIL", "loadtest@vaultslip.local")
PASSWORD = os.environ.get("TEST_USER_PASSWORD", "LoadTestSecure1!")


def main() -> None:
    if not BASE or not KEY:
        print("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)
    url = f"{BASE}/auth/v1/admin/users"
    headers = {"Authorization": f"Bearer {KEY}", "apikey": KEY, "Content-Type": "application/json"}
    body = {"email": EMAIL, "password": PASSWORD, "email_confirm": True}
    with httpx.Client(timeout=15.0) as client:
        r = client.post(url, json=body, headers=headers)
    if r.status_code in (200, 201):
        data = r.json()
        uid = data.get("id") or (data.get("identities") and data["identities"][0].get("id"))
        print(f"Created test user: {EMAIL} (id={uid})")
        print("Profile and org created by DB trigger. Get token: python scripts/get_test_token.py")
        return
    if r.status_code == 422 and "already been registered" in (r.text or "").lower():
        print(f"User {EMAIL} already exists. Get token: python scripts/get_test_token.py")
        return
    print(f"Error {r.status_code}: {r.text[:500]}")
    sys.exit(1)


if __name__ == "__main__":
    main()
