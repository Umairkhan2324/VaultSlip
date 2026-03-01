"""
Seed 2–3 organizations with plan=enterprise. Run after migrations applied.
Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
Profiles require auth.users; create users in Dashboard then run seed_profiles
or link org_id to existing profile by email.
"""
import os
import uuid
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
if not url or not key:
    print("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

client = create_client(url, key)

ENTERPRISE_ORGS = [
    {"name": "Enterprise Org 1"},
    {"name": "Enterprise Org 2"},
    {"name": "Enterprise Org 3"},
]


def main():
    for org in ENTERPRISE_ORGS:
        r = client.table("organizations").insert({
            "name": org["name"],
            "plan": "enterprise",
        }).execute()
        if r.data:
            print(f"Created org: {org['name']} (id={r.data[0]['id']})")
        else:
            print(f"Skip or error: {org['name']}")
    print("Seed done. Create users in Supabase Auth, then add profiles with org_id from organizations.")

if __name__ == "__main__":
    main()
