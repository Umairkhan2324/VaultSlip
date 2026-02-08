# VaultSlip

Receipt digitization and AI conversation: upload receipt images (or PDF/CSV/XLSX), extract data with OCR and AI, view in a canvas, and chat with your data. Built with **Supabase** (DB, Auth, Storage), **FastAPI** (extraction + agent), and **Next.js 16** (vaultslip-forntend).

- No Stripe; plans (free/pro/enterprise) set manually or by seed.
- Enterprise users: see [docs/SEED_ENTERPRISE.md](docs/SEED_ENTERPRISE.md).

## Quick start

### 1. Supabase

- Create a project at [supabase.com](https://supabase.com).
- Run SQL in `supabase/migrations/` (001, 002, 003) in order.
- Create storage bucket `receipts`; optionally run `supabase/storage_policies.sql`.
- Copy `.env.example` values: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` (Project Settings > API).

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
# Set .env: SUPABASE_*, OPENAI_API_KEY, SUPABASE_JWT_SECRET, CORS_ORIGINS
uvicorn app.main:app --reload --port 8000
```

- Health: [http://localhost:8000/health](http://localhost:8000/health)
- **Docker:** To run the backend in a container (Tesseract + Python included), see [setup.md – Run backend with Docker](setup.md#61-run-backend-with-docker).

### 3. Frontend

```bash
cd vaultslip-forntend
npm install
# Set .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_BACKEND_URL
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000). Sign up, then Dashboard to upload receipts.

### 4. Seed enterprise orgs (optional)

```bash
cd backend
set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
python scripts/seed.py
```

Then link users to those orgs (see [docs/SEED_ENTERPRISE.md](docs/SEED_ENTERPRISE.md)).

## Project layout

| Area | Path | Notes |
|------|------|--------|
| **Setup** | [setup.md](setup.md) | Groq + Supabase + Backend/Frontend env + local run + security |
| Frontend | `vaultslip-forntend/` | Next.js 16, Supabase Auth, dashboard, upload, receipts, chat |
| Backend | `Backend/` | FastAPI, Supabase client, extraction, chat agent, quota |
| Schema | `supabase/migrations/` | Organizations, profiles, batches, receipts, RLS, auth trigger |
| Seed | `Backend/scripts/seed.py` | Creates enterprise orgs |
| Docs | `docs/SEED_ENTERPRISE.md` | How to seed and assign enterprise |
| Testing | `docs/TESTING.md` | API tests (pytest), E2E (Playwright), load test (Locust) |

## Troubleshooting

- **401 on `/me` or `/upload`**: Backend verifies the Supabase JWT. Ensure `SUPABASE_JWT_SECRET` in Backend `.env` is the **JWT Secret** from Supabase (Project Settings → API → JWT Secret), not the anon or service-role key. If the frontend user is logged in but token is missing/expired, you will be redirected to sign-in.

## Security notes

- All backend receipt/batch/chat queries are scoped by `org_id` from the verified JWT.
- No raw user input in SQL; parameterized queries / Supabase client only.
- Secrets in env only; no secrets in frontend (anon key only).
- Contact form: length limits and honeypot (URL in message rejected).
"# VaultSlip" 
