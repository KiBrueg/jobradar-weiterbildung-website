#!/usr/bin/env bash
# E2E verification after deploying commit abec498 (React admin at /admin).
# Usage: BASIC_USER=admin BASIC_PASS='<JOBRADAR_ADMIN_PASSWORD>' ./scripts/verify-admin-e2e.sh
set -euo pipefail
BASE=https://kibrueg.de
AUTH="${BASIC_USER:-admin}:${BASIC_PASS:?set BASIC_PASS}"

echo "1) /admin serves React SPA (expect 200 + vite bundle ref)"
curl -sf -u "$AUTH" "$BASE/admin" | grep -o 'assets/index-[^"]*' && echo OK

echo "2) /api/dashboard reachable with Basic auth (expect JSON)"
curl -sf -u "$AUTH" "$BASE/api/dashboard" | head -c 200; echo; echo OK

echo "3) school login rejects unknown email (expect 401)"
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/school/login" \
  -H 'Content-Type: application/json' -d '{"email":"nope@test.de","password":"x"}')
[ "$code" = 401 ] && echo OK || { echo "FAIL: $code"; exit 1; }

echo "All checks passed."
