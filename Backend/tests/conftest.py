"""Pytest fixtures for API tests."""
import os
import pytest
from fastapi.testclient import TestClient

# Avoid loading .env in tests if not present (CI); app loads its own.
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "placeholder")
os.environ.setdefault("SUPABASE_JWT_SECRET", "placeholder")

from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
