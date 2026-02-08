"""Email service using Supabase."""
import logging
import httpx
from app.config import get_settings

logger = logging.getLogger(__name__)


async def send_processing_complete_email(user_email: str, batch_id: str) -> bool:
    """Send email notification when batch processing completes."""
    try:
        settings = get_settings()
        url = f"{settings.supabase_url.rstrip('/')}/functions/v1/send-email"
        payload = {
            "to": user_email,
            "subject": "Receipt processing complete",
            "html": f"<p>Your receipt batch {batch_id} has finished processing.</p>",
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers={
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
            }, timeout=10.0)
            if resp.status_code == 200:
                return True
            logger.warning("Email send failed", extra={"status": resp.status_code})
            return False
    except Exception as e:
        logger.error("Email send error", extra={"error": str(e)})
        return False


async def send_weekly_summary_email(user_email: str, summary_data: dict) -> bool:
    """Send weekly summary email."""
    try:
        settings = get_settings()
        url = f"{settings.supabase_url.rstrip('/')}/functions/v1/send-email"
        receipt_count = summary_data.get("receipt_count", 0)
        total_spent = summary_data.get("total_spent", 0)
        payload = {
            "to": user_email,
            "subject": "Your weekly receipt summary",
            "html": f"<p>This week you processed {receipt_count} receipts totaling ${total_spent:.2f}.</p>",
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers={
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
            }, timeout=10.0)
            if resp.status_code == 200:
                return True
            logger.warning("Email send failed", extra={"status": resp.status_code})
            return False
    except Exception as e:
        logger.error("Email send error", extra={"error": str(e)})
        return False
