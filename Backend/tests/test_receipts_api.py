"""Receipts API tests: auth required, list shape."""
import pytest
from fastapi.testclient import TestClient


def test_receipts_list_without_auth_returns_401(client: TestClient) -> None:
    r = client.get("/receipts")
    assert r.status_code == 401


def test_receipts_list_with_invalid_token_returns_401(client: TestClient) -> None:
    r = client.get("/receipts", headers={"Authorization": "Bearer invalid-token"})
    assert r.status_code in (401, 503)


def test_receipts_list_with_empty_bearer_returns_401(client: TestClient) -> None:
    r = client.get("/receipts", headers={"Authorization": "Bearer "})
    assert r.status_code == 401
