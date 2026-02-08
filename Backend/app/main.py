"""FastAPI app: health, CORS, mounted routes, logging, error handling."""
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.logging_config import configure_logging
from app.routes import health, me, receipts, upload, chat, contact, batches, profile, organizations, preferences, api_keys, data_export, account, receipt_templates

configure_logging()
logger = logging.getLogger(__name__)
settings = get_settings()

app = FastAPI(title="VaultSlip API")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Return generic 500; never leak stack or internals to client."""
    logger.exception("Unhandled exception", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again later."},
    )
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router, tags=["health"])
app.include_router(me.router, tags=["auth"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(organizations.router, prefix="/api/organizations", tags=["organizations"])
app.include_router(preferences.router, prefix="/api/preferences", tags=["preferences"])
app.include_router(api_keys.router, prefix="/api/api-keys", tags=["api-keys"])
app.include_router(data_export.router, prefix="/api/data", tags=["data"])
app.include_router(account.router, prefix="/api/account", tags=["account"])
app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(receipts.router, prefix="/receipts", tags=["receipts"])
app.include_router(receipt_templates.router, prefix="/receipt-templates", tags=["templates"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(contact.router, prefix="/contact", tags=["contact"])
app.include_router(batches.router, prefix="/batches", tags=["batches"])


@app.on_event("startup")
async def _log_startup() -> None:
    logger.info("VaultSlip API startup complete")
