# VaultSlip – Setup Guide

Discrete steps to set up Groq, Supabase, Backend, and Frontend locally. Use this with [Backend/.env.example](Backend/.env.example) and the frontend env vars below.

---

## 1. Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.10+ (e.g. 3.12)
- **Tesseract** (optional; for OCR fallback) – [Windows](https://github.com/UB-Mannheim/tesseract/wiki), macOS: `brew install tesseract`

---

## 2. Groq API key

1. Go to [console.groq.com](https://console.groq.com).
2. Sign up or log in.
3. Open **API Keys** (left sidebar or account menu).
4. Click **Create API Key**; name it (e.g. `vaultslip-dev`).
5. Copy the key (shown once). Store it in Backend `.env` as `GROQ_API_KEY` (see step 4).
6. **Security:** Use the key only in the Backend. Never put it in frontend code or in `NEXT_PUBLIC_*` env vars.

---

## 3. Supabase account and project

### 3.1 Create project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → choose org, set **Name** (e.g. `vaultslip`), **Database password** (store it safely), **Region**.
3. Wait until the project is ready.

### 3.2 Get API keys and JWT secret

1. In the project: **Project Settings** (gear) → **API**.
2. Copy and store (for Backend `.env`):
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY` (Backend optional; required for frontend and test scripts)
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (Backend only; never expose to frontend)
3. **Project Settings** → **API** → **JWT Settings**:
   - Copy **JWT Secret** → `SUPABASE_JWT_SECRET` (Backend only).

### 3.3 Run migrations

1. In Supabase: **SQL Editor**.
2. Run the migration files under `supabase/migrations/` **in order** (001, 002, 003, 004, 005, 006, 007, 008).
3. Optionally run `supabase/storage_policies.sql` after creating the bucket (next step).

### 3.4 Storage bucket

1. **Storage** → **New bucket**.
2. Name: `receipts`. Set visibility per your needs (e.g. private).
3. Create. If you have `storage_policies.sql`, run it in SQL Editor to apply RLS for the bucket.

---

## 4. Backend environment (from `.env.example`)

1. Copy the example file:
   ```bash
   cd Backend
   copy .env.example .env
   ```
2. Edit `Backend/.env` and set each variable:

| Variable | Where to get it | Required |
|----------|-----------------|----------|
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role | Yes |
| `SUPABASE_JWT_SECRET` | Project Settings → API → JWT Secret | Yes |
| `SUPABASE_ANON_KEY` | Project Settings → API → anon public | For token script / optional at runtime |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys | For Groq OCR/LLM |
| `OPENAI_API_KEY` | platform.openai.com (if using OpenAI) | Optional |
| `CORS_ORIGINS` | Comma-separated origins, e.g. `http://localhost:3000` | Yes (default: localhost) |

3. **Do not commit `.env`.** It must stay in `.gitignore`.

---

## 5. Frontend environment

1. In `vaultslip-forntend/`, create `.env.local` (or `.env`).
2. Set:

| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase project URL (same as Backend) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon key) | Supabase Auth + RLS (safe to expose) |
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:8000` | Backend API for local dev |

3. **Security:** Only `NEXT_PUBLIC_*` vars are exposed to the browser. Never put `SUPABASE_SERVICE_ROLE_KEY` or `GROQ_API_KEY` in the frontend.

---

## 6. Run backend locally

```bash
cd Backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Health: [http://localhost:8000/health](http://localhost:8000/health) → `{"status":"ok"}`.
- Docs: [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 6.1 Run backend with Docker

Use Docker to run the backend with Tesseract and Python deps included; no local install or PATH needed.

1. **Prerequisites:** Docker and Docker Compose installed. Ensure `Backend/.env` exists (see section 4).
2. **Build and run** (from project root):
   ```bash
   docker compose up -d
   ```
   This builds the backend image (Python 3.12 + Tesseract OCR) and starts the API on port 8000. Env vars are loaded from `Backend/.env` at runtime (not baked into the image).
3. **CORS:** Set `CORS_ORIGINS` in `Backend/.env` to include your frontend origin (e.g. `http://localhost:3000`).
4. **Scaling:** The API is stateless. To run multiple replicas: `docker compose up -d --scale backend=3` (put a reverse proxy in front), or deploy the same image to Kubernetes/ECS with a load balancer.

---

## 7. Run frontend locally

```bash
cd vaultslip-forntend
npm install
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000). Sign up, then use Dashboard to upload receipts.

---

## 8. Security and production readiness

### 8.1 Current mitigations

- **Auth:** JWT verified with Supabase; `org_id` from DB; protected routes use `require_auth`.
- **Secrets:** Backend uses env only; service role and Groq key never in frontend; redaction in logs (tokens, auth headers, PII).
- **Data access:** Receipts/batches scoped by `org_id`; Supabase client uses parameterized queries (no raw SQL concatenation).
- **Errors:** Global handler returns generic 500; no stack traces or internals in responses.
- **Input:** Pydantic validation on APIs; contact form length limits and simple anti-spam (URL in message rejected).
- **CORS:** Configurable via `CORS_ORIGINS`; must be set to real frontend origin(s) in production.
- **Sensitive endpoints:** API key creation rate-limited (e.g. 5/day); data export rate-limited (e.g. 1/24h).

### 8.2 Threats and gaps

| Area | Risk | Mitigation / recommendation |
|------|------|-----------------------------|
| **Service role key** | If leaked, full DB/storage access | Keep only in Backend env; never in frontend or logs; rotate if exposed. |
| **CORS** | Overly permissive in prod | Set `CORS_ORIGINS` to exact frontend origin(s); avoid `*` with credentials. |
| **Global rate limiting** | DoS / brute force on auth or API | No app-level global throttle today. Add rate limiting (e.g. by IP or user) for auth and expensive endpoints before production. |
| **Upload / storage** | Large or abusive uploads | Per-file size limit (e.g. 1 MB) and max files per batch exist; consider per-org storage quotas. |
| **Contact form** | Spam / abuse | Basic validation and URL block; consider CAPTCHA or stricter rate limit for production. |
| **Dependencies** | Known CVEs | Pin versions; run `pip audit` / `npm audit` and update regularly. |
| **HTTPS** | Eavesdropping / tampering | Use HTTPS in production; Backend and Frontend behind TLS. |
| **Secrets in build** | Env in image or client bundle | Backend: env at runtime only. Frontend: only `NEXT_PUBLIC_*`; no server secrets in client. |

### 8.3 Production checklist (summary)

- [ ] All secrets from env; no hardcoded keys.
- [ ] `CORS_ORIGINS` set to production frontend origin(s).
- [ ] Supabase RLS and migrations applied; storage bucket and policies in place.
- [ ] Rate limiting on auth and sensitive endpoints.
- [ ] HTTPS only; secure cookies if used.
- [ ] Logging: structured; no secrets or PII (redaction in place).
- [ ] Dependency audits and updates.
- [ ] Optional: WAF, DDoS protection, and monitoring/alerting.

**Verdict:** The app is suitable for **local and staging** use with the above setup. For **production**, add global or per-endpoint rate limiting, tighten CORS and contact-form protection, and run through the checklist above.

---

## Quick reference

- **Backend env:** [Backend/.env.example](Backend/.env.example) → copy to `Backend/.env`.
- **Frontend env:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_BACKEND_URL` in `vaultslip-forntend/.env.local`.
- **Testing:** [docs/TESTING.md](docs/TESTING.md) (API, E2E, load).
- **Troubleshooting:** See [README.md](README.md) (e.g. 401 → check `SUPABASE_JWT_SECRET` and token).
