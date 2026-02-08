"""Health endpoint tests."""
import pytest
from fastapi.testclient import TestClient


def test_health_returns_ok(client: TestClient) -> None:
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
