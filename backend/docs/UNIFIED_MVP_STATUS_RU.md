# JobRadar Unified React + FastAPI MVP — Statusbericht

Datum: 2026-07-26

## Ergebnis

React/Bolt Website und lokale FastAPI Admin-App wurden in einem lokalen MVP zusammengeführt.

Ein FastAPI Server bedient jetzt:

```text
/                         React Landing
/referenzen               React Referenzen
/impressum                React Impressum
/datenschutz              React Datenschutz
/barrierefreiheit         React Barrierefreiheit
/kontakt                  React Kontakt
/admin                    React Admin / CEO Cockpit
/api/*                    FastAPI API
/download/*               FastAPI Downloads
/assets/*                 React Build Assets
```

## Aktueller Server

```text
http://127.0.0.1:8787
http://127.0.0.1:8787/admin
```

## Stand der Branches

Bolt accessibility/compliance fixes aus `main` wurden in die MVP-Branch integriert.

React/GitHub Branch:

```text
unify-react-fastapi-mvp
```

Aktueller Push:

```text
fe85816 Merge remote-tracking branch 'origin/main' into unify-react-fastapi-mvp
```

Wichtige enthaltene Commits:

```text
ac76d0f feat: connect CEO cockpit to FastAPI API
d30d92d feat: wire CEO cockpit tables to FastAPI
f43e979 feat: link CEO report downloads
5cea11e feat: add CEO report XLSX downloads
6b45bfe feat: document n8n write loop endpoints
9a9840d fix: final public site accessibility and compliance polish
35648be fix: remove dead href props, add aria-current and aria-labels to references page nav
d12acf7 fix: add aria-label to landing page logo and dynamic mobile menu label
```

## Bolt Accessibility/Compliance Merge

Merged from `origin/main` into `unify-react-fastapi-mvp` without conflicts.

Validated markers:

```text
CeoCockpit API integration: OK
CEO XLSX links: OK
src/lib/api.ts report helper: OK
Admin n8n status docs: OK
Landing main#main-content: OK
References main#main-content: OK
PublicHeader aria-current: OK
PublicFooter © + Seitennavigation: OK
```

Browser `/` validation:

```text
main#main-content count: 1
skip link target exists: true
footer nav aria-label: Seitennavigation
```

## Turnkey Start

Start-Datei:

```text
C:\Users\brueg\Desktop\projects\JobRadar_Weiterbildung_Admin\start_jobradar_mvp.bat
```

Die Start-Datei fragt ein Admin-Passwort ab. Wenn ein Passwort gesetzt wird, sind geschützt:

```text
/admin
/api/*
/download/*
```

Benutzername:

```text
admin
```

Das Passwort wird nicht im Code gespeichert. Es wird nur als Prozess-Umgebungsvariable `JOBRADAR_ADMIN_PASSWORD` gesetzt.

## Backend-Dateien

```text
app.py
ceo_metrics.py
sync_frontend_from_react.bat
start_jobradar_mvp.bat
docs/UNIFIED_MVP_STATUS_RU.md
frontend_dist/*
```

Hinweis: `JobRadar_Weiterbildung_Admin` ist aktuell kein Git-Repository. Deshalb wurde ein ZIP-Snapshot unter `C:\Users\brueg\Desktop\HERMESdownloads\` erstellt.

## Live API Integration

CEO Cockpit lädt live aus:

```text
/api/ceo-dashboard?range=tag
/api/ceo-dashboard?range=woche
/api/ceo-dashboard?range=monat
/api/ceo-dashboard?range=jahr
```

Live angebunden:

```text
current KPI summary
series chart
cost_breakdown
source_health
course_performance
ai_role_benchmark
actions
```

## n8n Write Loop

Backend MVP endpoints:

```text
GET  /api/n8n/search-tasks
GET  /api/n8n/status
POST /api/n8n/workflow-runs
POST /api/n8n/source-runs
POST /api/n8n/cost-events
POST /api/n8n/leads
GET  /api/n8n/runs
```

Write-loop smoke test inserted and verified marker:

```text
MVP_N8N_LOOP_1785062029
workflow_marker = 1
source_marker   = 1
cost_marker     = 1
lead_marker     = 1
```

Note: Smoke marker is synthetic verification data and was intentionally left in local DB. Remove later only with explicit approval.

## Report Downloads

React Report Buttons laden echte Backend Reports:

```text
/download/ceo-report.json?range=monat
/download/ceo-report.xlsx?range=monat
/download/ceo-report.json?range=jahr
/download/ceo-report.xlsx?range=jahr
```

XLSX Workbook enthält:

```text
Summary
Kosten
Quellen
Kurse
AI Rollen
Aktionen
```

## Technische Verifikation nach Merge

React:

```text
npm run typecheck ✅
npm run build ✅
npm run lint ✅
```

Build output:

```text
✓ 1491 modules transformed.
✓ built in 2.85s
```

Lint:

```text
0 errors
9 warnings — nur bestehende Fast Refresh warnings
```

FastAPI:

```text
python -m py_compile app.py ceo_metrics.py ✅
```

HTTP Smoke:

```text
/                                      200 ✅
/referenzen                            200 ✅
/impressum                             200 ✅
/datenschutz                           200 ✅
/barrierefreiheit                      200 ✅
/kontakt                               200 ✅
/admin                                 200 ✅
/api/ceo-dashboard?range=monat         200 ✅
/api/n8n/status                        200 ✅
/download/ceo-report.xlsx?range=monat  200 ✅
```

XLSX verification:

```text
Summary|Kosten|Quellen|Kurse|AI Rollen|Aktionen
B2 = Monatsreport
```

Browser `/admin`:

```text
Live API-Daten visible: true
AI-Rollen Benchmark visible: true
XLSX links visible: /download/ceo-report.xlsx?range=monat, /download/ceo-report.xlsx?range=jahr
JS console errors: 0
```

## MVP-Status

Jetzt erreicht:

```text
React Public Website + React Admin + FastAPI API + SQLite CEO Metrics + JSON/XLSX Report Download + optional Admin Auth + n8n read/write loop + Bolt accessibility/compliance polish laufen unter einer lokalen URL.
```

Noch nicht Production/SaaS-ready:

1. Backend-FastAPI-Projekt sollte als eigenes Git-Repository initialisiert oder in ein Monorepo überführt werden.
2. Für externen Pilot: Passwort setzen, Cloudflare Tunnel/VPS, Backup, TLS, finale Datenschutz-/Impressum-Daten ergänzen.
3. Smoke data ggf. vor Pilot bereinigen oder durch echte n8n Daten ersetzen.

## Kurzes Fazit

Der lokale MVP ist technisch vorzeigbar:

```text
Eine URL, öffentliche Website, Admin Cockpit, Live-KPIs, Live-Tabellen, AI-Rollen-Benchmark, echte JSON/XLSX-Reports, optionaler Passwortschutz, n8n Write Loop, Accessibility/Compliance Polish.
```
