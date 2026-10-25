#!/bin/bash
# ============================================================
# healthcheck-website.sh — проверка и авто-починка /school
# ============================================================
set -euo pipefail

DOMAIN="https://kibrueg.de"
JS_PATH="/assets/index-CnPHDqq7.js"
LOG_DIR="/home/kirill/jobradar-weiterbildung-website/healthcheck-logs"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG="$LOG_DIR/$TIMESTAMP.log"

log() { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG"; }

# --- 1. Проверка: content-type JS файла ---
CONTENT_TYPE=$(curl -sI "${DOMAIN}${JS_PATH}" \
    -H "Cache-Control: no-cache" \
    --max-time 10 \
    | grep -i '^content-type:' | tr -d '\r' | awk '{print $2}')

log "CHECK content-type of ${JS_PATH}: '$CONTENT_TYPE'"

if echo "$CONTENT_TYPE" | grep -qi 'javascript'; then
    log "OK — JS served correctly"
    exit 0
fi

# --- 2. Проблема обнаружена — сохранить состояние ДО ---
log "PROBLEM: expected application/javascript, got '$CONTENT_TYPE'"
log "Saving before-state..."

docker exec jobradar-website ls /usr/share/nginx/html/ >> "$LOG" 2>&1
docker exec jobradar-website ls /usr/share/nginx/html/assets/ | head -5 >> "$LOG" 2>&1

# --- 3. Исправить права (частая причина) ---
log "Fixing permissions..."
chmod -R o+rX /home/kirill/jobradar-weiterbildung-website/backend/frontend_dist/

# --- 4. Перезагрузить nginx ---
log "Reloading nginx..."
docker exec jobradar-website nginx -s reload
sleep 5

# --- 5. Проверить после ---
CONTENT_TYPE_AFTER=$(curl -sI "${DOMAIN}${JS_PATH}" \
    -H "Cache-Control: no-cache" \
    --max-time 10 \
    | grep -i '^content-type:' | tr -d '\r' | awk '{print $2}')

log "AFTER content-type: '$CONTENT_TYPE_AFTER'"

if echo "$CONTENT_TYPE_AFTER" | grep -qi 'javascript'; then
    log "FIXED — nginx reload resolved the issue"
else
    log "STILL BROKEN after reload — restarting container..."
    cd /home/kirill/n8n-automation && docker compose up -d --no-deps jobradar-website >> "$LOG" 2>&1
    sleep 10
    CONTENT_TYPE_FINAL=$(curl -sI "${DOMAIN}${JS_PATH}" \
        -H "Cache-Control: no-cache" \
        --max-time 10 \
        | grep -i '^content-type:' | tr -d '\r' | awk '{print $2}')
    log "FINAL content-type: '$CONTENT_TYPE_FINAL'"
    if echo "$CONTENT_TYPE_FINAL" | grep -qi 'javascript'; then
        log "FIXED after container restart"
    else
        log "CRITICAL: could not auto-fix — manual intervention needed"
        exit 2
    fi
fi
