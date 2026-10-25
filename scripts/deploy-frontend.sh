#!/bin/bash
# ============================================================
# deploy-frontend.sh — безопасный деплой фронтенда на VPS
# Запускать ЛОКАЛЬНО (Windows Git Bash или WSL):
#   bash scripts/deploy-frontend.sh
# ============================================================
set -euo pipefail

VPS="kirill@157.180.112.46"
SSH_KEY="$HOME/.ssh/id_ed25519"
REMOTE_DIR="/home/kirill/jobradar-weiterbildung-website/backend/frontend_dist"
LOCAL_DIST="./dist"

if [ ! -f "$LOCAL_DIST/index.html" ]; then
    echo "ERROR: dist/index.html не найден — сначала npm run build"
    exit 1
fi

echo "=== Backup текущего dist на VPS ==="
ssh -i "$SSH_KEY" "$VPS" "cp -r $REMOTE_DIR ${REMOTE_DIR}.bak-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true"

echo "=== Загружаю новый dist (rsync, только фронтенд-файлы) ==="
rsync -av --delete \
    --include='index.html' \
    --include='vite.svg' \
    --include='assets/***' \
    --exclude='*' \
    -e "ssh -i $SSH_KEY" \
    "$LOCAL_DIST/" "$VPS:$REMOTE_DIR/"

echo "=== Исправляю права ==="
ssh -i "$SSH_KEY" "$VPS" "chmod -R o+rX $REMOTE_DIR"

echo "=== Перезагружаю nginx ==="
ssh -i "$SSH_KEY" "$VPS" "docker exec jobradar-website nginx -s reload"

echo "=== Проверка ==="
sleep 3
STATUS=$(curl -so /dev/null -w '%{http_code}' "https://kibrueg.de/school")
echo "GET /school → HTTP $STATUS"
JS_CT=$(curl -sI "https://kibrueg.de/assets/index-CnPHDqq7.js" | grep -i content-type | tr -d '\r')
echo "assets content-type: $JS_CT"
echo ""
echo "Deploy complete!"
