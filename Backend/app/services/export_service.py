"""Data export service for user data."""
import json
import zipfile
import io
from datetime import datetime, timedelta
from typing import Literal
import logging
from app.services.supabase_client import get_supabase

logger = logging.getLogger(__name__)


def export_user_data(user_id: str, org_id: str, format: Literal["ZIP", "JSON", "CSV", "Excel"] = "ZIP") -> tuple[str, str]:
    """Export all user data synchronously. Returns (storage_path, download_url)."""
    supabase = get_supabase()
    data = {
        "profile": {},
        "receipts": [],
        "batches": [],
        "chat_messages": [],
    }
    profile = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if profile.data:
        data["profile"] = profile.data[0]
    receipts = supabase.table("receipts").select("*").eq("org_id", org_id).execute()
    if receipts.data:
        data["receipts"] = receipts.data
    batches = supabase.table("batches").select("*").eq("org_id", org_id).execute()
    if batches.data:
        data["batches"] = batches.data
    messages = supabase.table("chat_messages").select("*").eq("org_id", org_id).execute()
    if messages.data:
        data["chat_messages"] = messages.data
    if format == "JSON":
        content = json.dumps(data, indent=2, default=str).encode("utf-8")
        ext = "json"
    elif format == "Excel":
        import csv
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Type", "Data"])
        writer.writerow(["Profile", json.dumps(data["profile"], default=str)])
        for r in data["receipts"]:
            writer.writerow(["Receipt", json.dumps(r, default=str)])
        for b in data["batches"]:
            writer.writerow(["Batch", json.dumps(b, default=str)])
        for m in data["chat_messages"]:
            writer.writerow(["Message", json.dumps(m, default=str)])
        content = output.getvalue().encode("utf-8")
        ext = "csv"
    elif format == "CSV":
        import csv
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Type", "Data"])
        writer.writerow(["Profile", json.dumps(data["profile"], default=str)])
        for r in data["receipts"]:
            writer.writerow(["Receipt", json.dumps(r, default=str)])
        for b in data["batches"]:
            writer.writerow(["Batch", json.dumps(b, default=str)])
        for m in data["chat_messages"]:
            writer.writerow(["Message", json.dumps(m, default=str)])
        content = output.getvalue().encode("utf-8")
        ext = "csv"
    else:
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            zip_file.writestr("profile.json", json.dumps(data["profile"], indent=2, default=str))
            zip_file.writestr("receipts.json", json.dumps(data["receipts"], indent=2, default=str))
            zip_file.writestr("batches.json", json.dumps(data["batches"], indent=2, default=str))
            zip_file.writestr("chat_messages.json", json.dumps(data["chat_messages"], indent=2, default=str))
        content = zip_buffer.getvalue()
        ext = "zip"
    expires_at = (datetime.utcnow() + timedelta(days=7)).isoformat()
    path = f"exports/{org_id}/{user_id}/{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{ext}"
    bucket = supabase.storage.from_("receipts")
    bucket.upload(path, content, {"content-type": f"application/{ext}"})
    download_url = bucket.get_public_url(path)
    return path, download_url
