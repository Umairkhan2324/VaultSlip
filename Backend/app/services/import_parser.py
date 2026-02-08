"""Parse CSV and XLSX for bulk receipt import."""
from __future__ import annotations

import csv
import io
from typing import List

import openpyxl


def _normalize_key(s: str) -> str:
    return s.strip().lower().replace(" ", "_") if s else ""


def parse_csv(content: bytes) -> List[dict]:
    """Parse CSV bytes; first row = headers. Returns list of dicts (vendor, date, total, etc.)."""
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    rows: List[dict] = []
    for r in reader:
        row = {}
        for k, v in r.items():
            key = _normalize_key(k)
            if key and v is not None and str(v).strip():
                row[key] = str(v).strip()
        if row.get("vendor") or row.get("date") or row.get("total"):
            total = row.get("total")
            if total is not None:
                try:
                    row["total"] = float(str(total).replace(",", ""))
                except ValueError:
                    pass
            rows.append(row)
    return rows


def parse_xlsx(content: bytes) -> List[dict]:
    """Parse XLSX bytes; first row = headers. Returns list of dicts."""
    wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
    ws = wb.active
    rows: List[dict] = []
    headers: List[str] = []
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            headers = [_normalize_key(str(c or "")) for c in row]
            continue
        r = {}
        for j, cell in enumerate(row):
            if j < len(headers) and headers[j] and cell is not None and str(cell).strip():
                r[headers[j]] = str(cell).strip() if not isinstance(cell, (int, float)) else cell
        if r.get("vendor") or r.get("date") or r.get("total"):
            if "total" in r and isinstance(r["total"], (int, float)):
                r["total"] = float(r["total"])
            rows.append(r)
    wb.close()
    return rows
