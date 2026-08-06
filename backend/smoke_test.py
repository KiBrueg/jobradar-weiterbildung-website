from __future__ import annotations

import base64
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE = "http://127.0.0.1:8787"
ROOT = Path(__file__).resolve().parent


def request(path: str, *, auth: str | None = None, token: str | None = None, method: str = "GET", body: dict | None = None):
    data = None
    headers = {"Accept": "application/json"}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if auth:
        headers["Authorization"] = "Basic " + base64.b64encode(auth.encode()).decode()
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=8) as res:
            payload = res.read().decode("utf-8", "replace")
            return res.status, payload, dict(res.headers)
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", "replace"), dict(exc.headers)


def wait_ready() -> bool:
    for _ in range(30):
        status, _, _ = request("/")
        if status in {200, 404}:
            return True
        time.sleep(0.3)
    return False


def main() -> int:
    env = os.environ.copy()
    env.update({
        "JOBRADAR_ADMIN_USER": "admin",
        "JOBRADAR_ADMIN_PASSWORD": "testpass",
        "JOBRADAR_N8N_TOKEN": "test-n8n-token",
        "JOBRADAR_PUBLIC_BASE_URL": "https://example.test",
    })
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8787"],
        cwd=ROOT,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    try:
        if not wait_ready():
            print("server did not become ready")
            return 1
        checks: list[tuple[str, bool, str]] = []
        checks.append(("/api/dashboard without auth is blocked", request("/api/dashboard")[0] == 401, ""))
        st, body, _ = request("/api/system/status", auth="admin:testpass")
        checks.append(("/api/system/status with auth works", st == 200 and '"ok"' in body, body[:120]))
        status = json.loads(body)
        checks.append(("admin auth flag true", status.get("admin_auth_configured") is True, body[:120]))
        checks.append(("n8n token flag true", status.get("n8n_token_configured") is True, body[:120]))
        st, body, _ = request("/api/n8n/search-tasks", token="test-n8n-token")
        checks.append(("/api/n8n/search-tasks accepts bearer token", st == 200 and '"ok"' in body, body[:120]))
        st, body, _ = request("/api/n8n/search-tasks")
        checks.append(("/api/n8n/search-tasks without token blocked", st == 401, body[:120]))
        st, body, _ = request("/api/system/test-notification", auth="admin:testpass", method="POST", body={})
        checks.append(("test notification degrades safely without webhook", st == 200 and "webhook_not_configured" in body, body[:160]))
        failed = 0
        for name, ok, detail in checks:
            print(("PASS" if ok else "FAIL"), name, detail)
            failed += 0 if ok else 1
        return 1 if failed else 0
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=8)
        except subprocess.TimeoutExpired:
            proc.kill()


if __name__ == "__main__":
    raise SystemExit(main())
