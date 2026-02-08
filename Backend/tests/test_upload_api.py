"""Upload endpoint: auth required."""
from fastapi.testclient import TestClient


def test_upload_without_auth_returns_401(client: TestClient) -> None:
    r = client.post("/upload", files=[("files", ("x.jpg", b"fake", "image/jpeg"))])
    assert r.status_code == 401
