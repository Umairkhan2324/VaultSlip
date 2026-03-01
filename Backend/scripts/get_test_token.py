"""
Print a JWT for the test user (for LOAD_TEST_TOKEN).
Requires: SUPABASE_URL, SUPABASE_ANON_KEY, TEST_USER_EMAIL, TEST_USER_PASSWORD.
Get SUPABASE_ANON_KEY from Supabase Dashboard > Project Settings > API > anon public.
"""
import os
import sys

try:
    from dotenv import load_dotenv
    _dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    load_dotenv(os.path.join(_dir, ".env"))
except ImportError:
    pass

import httpx

BASE = os.environ.get("SUPABASE_URL", "").rstrip("/")
ANON = os.environ.get("SUPABASE_ANON_KEY", "")
EMAIL = os.environ.get("TEST_USER_EMAIL", "loadtest@vaultslip.local")
PASSWORD = os.environ.get("TEST_USER_PASSWORD", "LoadTestSecure1!")


def main() -> None:
    if not BASE or not ANON:
        print("Set SUPABASE_URL and SUPABASE_ANON_KEY (Dashboard > API > anon public)")
        sys.exit(1)
    url = f"{BASE}/auth/v1/token?grant_type=password"
    headers = {"apikey": ANON, "Content-Type": "application/json"}
    body = {"email": EMAIL, "password": PASSWORD}
    with httpx.Client(timeout=10.0) as client:
        r = client.post(url, json=body, headers=headers)
    if r.status_code != 200:
        print(f"Error {r.status_code}: {r.text[:400]}")
        sys.exit(1)
    data = r.json()
    token = data.get("access_token")
    if not token:
        print("No access_token in response")
        sys.exit(1)
    print(token)


if __name__ == "__main__":
    main()
