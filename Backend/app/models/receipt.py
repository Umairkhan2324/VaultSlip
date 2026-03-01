"""Pydantic models for receipt extraction (strict output contract)."""
from datetime import date
from typing import List, Optional
from pydantic import BaseModel, Field


class ReceiptItem(BaseModel):
    description: str
    quantity: float
    unit_price: float
    subtotal: float
    confidence: float = Field(ge=0, le=1)


class ReceiptExtraction(BaseModel):
    vendor: str
    date: Optional[date] = None
    items: List[ReceiptItem]
    subtotal: float
    tax: float
    total: float
    currency: str = "USD"
    category: str
    confidence: float = Field(ge=0, le=1)
    notes: Optional[str] = None
