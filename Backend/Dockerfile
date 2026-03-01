# VaultSlip backend: Python 3.12 + Tesseract OCR, stateless API.
FROM python:3.12-slim

# Tesseract and deps for OCR; no PATH issues inside container.
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libpango-1.0-0 \
    libharfbuzz0b \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python deps first for layer caching.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code (no venv/.env via .dockerignore).
COPY app/ ./app/

# Non-root user for security.
RUN useradd --create-home --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
