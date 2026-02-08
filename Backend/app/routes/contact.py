"""POST /contact/sales: validate lead form, insert enterprise_leads."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.services.supabase_client import get_supabase

router = APIRouter()


class LeadForm(BaseModel):
    name: str
    email: EmailStr
    company: str
    message: str


@router.post("/sales")
async def contact_sales(lead: LeadForm):
    if len(lead.name) < 2 or len(lead.name) > 100:
        raise HTTPException(400, detail="Name must be 2-100 characters")
    if len(lead.company) < 2:
        raise HTTPException(400, detail="Company name required")
    if len(lead.message) > 2000:
        raise HTTPException(400, detail="Message too long")
    if "http://" in lead.message or "www." in lead.message:
        raise HTTPException(400, detail="Invalid submission")
    get_supabase().table("enterprise_leads").insert({
        "name": lead.name,
        "email": lead.email,
        "company": lead.company,
        "message": lead.message,
    }).execute()
    return {"status": "ok", "message": "We will be in touch within 24 hours."}
