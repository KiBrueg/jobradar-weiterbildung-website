# JobRadar Weiterbildung Admin — рабочий backend

Рабочая FastAPI/SQLite админка для JobRadar Weiterbildung MVP.

## Локальный запуск на Windows

Папка проекта:

```text
C:\Users\brueg\Desktop\projects\jobradar-weiterbildung-website\backend
```

Быстрый запуск:

```text
start_jobradar_admin.bat
```

Локальный URL:

```text
http://127.0.0.1:8787
```

## Что сейчас работает

- SQLite база `jobradar.sqlite3`;
- школы: создать/редактировать/архивировать;
- курсы школы: создать/редактировать;
- search profile по курсу: target titles, skills, exclusions, source queries;
- school portal `/school/{token}` с noindex/no-store;
- Job Pool: pending → approve/reject, assignment to all/specific schools;
- webhook notification при approve через `JOBRADAR_APPROVE_NOTIFY_WEBHOOK`;
- notification audit log в `notification_events`;
- n8n endpoints `/api/n8n/*` для config/import/metrics;
- exports: school HTML/CSV/JSON + SQLite backup;
- CEO cockpit metrics endpoints;
- Basic Auth protection for `/admin`, `/api`, `/download`, `/qa` when `JOBRADAR_ADMIN_PASSWORD` is set;
- separate `JOBRADAR_N8N_TOKEN` for machine access to `/api/n8n/*`.

## Production env

Скопировать `backend/.env.example` и задать реальные значения:

```env
JOBRADAR_ADMIN_USER=admin
JOBRADAR_ADMIN_PASSWORD=...
JOBRADAR_PUBLIC_BASE_URL=https://kibrueg.de
JOBRADAR_N8N_TOKEN=...
JOBRADAR_APPROVE_NOTIFY_WEBHOOK=...
```

Не коммитить `.env`.

## Smoke checks

После запуска:

```bash
python -m py_compile app.py ceo_metrics.py
curl -i http://127.0.0.1:8787/api/system/status
curl -i http://127.0.0.1:8787/api/dashboard
curl -i http://127.0.0.1:8787/school/<token>
```

Если задан `JOBRADAR_ADMIN_PASSWORD`, `/api/*` и `/download/*` должны возвращать `401` без Basic Auth. `/api/n8n/*` можно вызвать с:

```text
Authorization: Bearer <JOBRADAR_N8N_TOKEN>
```

## Что ещё не production-grade SaaS

- school portal пока token-link/read-only, не полноценный email/password login;
- SQLite подходит для MVP/pilot, для multi-tenant production нужен Postgres + tenant/RLS;
- webhook email зависит от внешнего n8n workflow;
- destructive delete документов в админке пока есть как internal action, использовать осторожно.
