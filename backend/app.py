from __future__ import annotations

import base64
import binascii
import csv
import html
import io
import json
import os
import secrets
from passlib.context import CryptContext
import shutil
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import psycopg2

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
import psycopg2.extras
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.requests import Request

# ── Jobradar Postgres connection (env: JOBRADAR_PG_DSN or PG_HOST/USER/PASS/DB)
_PG_DSN: str | None = os.getenv("JOBRADAR_PG_DSN") or (
    "postgresql://{u}:{p}@{h}:{port}/{d}".format(
        u=os.getenv("POSTGRES_USER", "hub"),
        p=os.getenv("POSTGRES_PASSWORD", ""),
        h=os.getenv("POSTGRES_HOST", "postgres"),
        port=os.getenv("POSTGRES_PORT", "5432"),
        d=os.getenv("POSTGRES_DB_JOBRADAR", "jobradar"),
    )
    if os.getenv("POSTGRES_PASSWORD")
    else None
)

@contextmanager
def pg():
    if not _PG_DSN:
        raise HTTPException(503, "Postgres not configured (set JOBRADAR_PG_DSN or POSTGRES_PASSWORD)")
    conn = psycopg2.connect(_PG_DSN, cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def pg_rows(sql: str, params=None) -> list[dict]:
    with pg() as conn:
        cur = conn.cursor()
        cur.execute(sql, params or ())
        return [dict(r) for r in cur.fetchall()]

def pg_exec(sql: str, params=None) -> None:
    with pg() as conn:
        conn.cursor().execute(sql, params or ())

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "jobradar.sqlite3"
UPLOAD_DIR = BASE_DIR / "uploads"
REPORT_DIR = BASE_DIR / "reports"
FRONTEND_DIST = BASE_DIR / "frontend_dist"
if not (FRONTEND_DIST / "index.html").exists() and (BASE_DIR.parent / "dist" / "index.html").exists():
    FRONTEND_DIST = BASE_DIR.parent / "dist"
FRONTEND_ASSETS = FRONTEND_DIST / "assets"

ADMIN_USER = os.getenv("JOBRADAR_ADMIN_USER", "admin")
ADMIN_PASSWORD = os.getenv("JOBRADAR_ADMIN_PASSWORD", "")
N8N_TOKEN = os.getenv("JOBRADAR_N8N_TOKEN", "")
PUBLIC_BASE_URL = os.getenv("JOBRADAR_PUBLIC_BASE_URL", "https://kibrueg.de").rstrip("/")
MANUAL_JOB_WEBHOOK = os.getenv("JOBRADAR_MANUAL_JOB_WEBHOOK", "")
REGISTRATION_WEBHOOK = os.getenv("JOBRADAR_REGISTRATION_WEBHOOK", "")
PROTECTED_PREFIXES = ("/admin", "/api", "/download", "/qa")
N8N_PREFIX = "/api/n8n"
UPLOAD_DIR.mkdir(exist_ok=True)
REPORT_DIR.mkdir(exist_ok=True)

app = FastAPI(title="JobRadar Admin")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


def _unauthorized(is_ajax: bool = False) -> Response:
    headers = {} if is_ajax else {"WWW-Authenticate": 'Basic realm="JobRadar Admin"'}
    return Response("Authentication required", status_code=401, headers=headers)


def _valid_basic_auth(header: str | None) -> bool:
    if not ADMIN_PASSWORD:
        return True
    if not header or not header.startswith("Basic "):
        return False
    try:
        decoded = base64.b64decode(header.removeprefix("Basic "), validate=True).decode("utf-8")
    except (binascii.Error, UnicodeDecodeError):
        return False
    username, sep, password = decoded.partition(":")
    if not sep:
        return False
    return secrets.compare_digest(username, ADMIN_USER) and secrets.compare_digest(password, ADMIN_PASSWORD)


def _valid_n8n_token(request: Request) -> bool:
    """Allow n8n machine access without exposing admin Basic credentials."""
    if not N8N_TOKEN:
        return False
    supplied = request.headers.get("x-jobradar-n8n-token", "")
    auth = request.headers.get("authorization", "")
    if auth.startswith("Bearer "):
        supplied = auth.removeprefix("Bearer ")
    return bool(supplied) and secrets.compare_digest(supplied, N8N_TOKEN)




SCHOOL_API_PREFIX = "/api/school/"
SCHOOL_PUBLIC_PATHS = {"/api/school/login"}

def _verify_school_bearer(request: "Request") -> "dict | None":
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.removeprefix("Bearer ").strip()
    if not token or len(token) < 24:
        return None
    return one(
        """SELECT id,name,contact_email,portal_plan,portal_enabled
             FROM schools WHERE portal_token=? AND portal_enabled=1 AND status<>'archived'""",
        (token,),
    )


def _is_protected_path(path: str) -> bool:
    return path.startswith(PROTECTED_PREFIXES)


@app.middleware("http")
async def optional_admin_basic_auth(request: Request, call_next):
    """Protect internal admin/API/download surfaces in exposed deployments.

    Local development remains passwordless by default. In production set
    JOBRADAR_ADMIN_PASSWORD. n8n can use JOBRADAR_N8N_TOKEN for /api/n8n/*.
    School portals remain separate tokenized /school/{token} read-only pages.
    """
    path = request.url.path
    if path.startswith(SCHOOL_API_PREFIX):
        if path in SCHOOL_PUBLIC_PATHS:
            return await call_next(request)
        school = _verify_school_bearer(request)
        if not school:
            return Response("Unauthorized", status_code=401,
                            headers={"WWW-Authenticate": "Bearer realm=\"school portal\""})
        request.state.school = school
        return await call_next(request)
    if ADMIN_PASSWORD and _is_protected_path(path):
        if path.startswith(N8N_PREFIX) and _valid_n8n_token(request):
            return await call_next(request)
        if not _valid_basic_auth(request.headers.get("authorization")):
            is_ajax = "application/json" in request.headers.get("accept", "") or path.startswith("/api")
            return _unauthorized(is_ajax=is_ajax)
    return await call_next(request)


app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
if FRONTEND_ASSETS.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_ASSETS)), name="frontend_assets")


def db() -> sqlite3.Connection:
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def now() -> str:
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"


def e(value: Any) -> str:
    return html.escape(str(value or ""))


def rows(sql: str, params: tuple = ()) -> list[dict[str, Any]]:
    with db() as con:
        return [dict(r) for r in con.execute(sql, params).fetchall()]


def one(sql: str, params: tuple = ()) -> dict[str, Any] | None:
    with db() as con:
        r = con.execute(sql, params).fetchone()
        return dict(r) if r else None


def exec_sql(sql: str, params: tuple = ()) -> int:
    with db() as con:
        cur = con.execute(sql, params)
        con.commit()
        return int(cur.lastrowid)


def table_columns(con: sqlite3.Connection, table: str) -> set[str]:
    return {r[1] for r in con.execute(f"PRAGMA table_info({table})").fetchall()}


def init_db() -> None:
    with db() as con:
        con.execute("PRAGMA foreign_keys=ON")
        con.executescript(
            """
            CREATE TABLE IF NOT EXISTS schools (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL UNIQUE,
              website TEXT DEFAULT '',
              contact_email TEXT DEFAULT '',
              status TEXT DEFAULT 'active',
              note TEXT DEFAULT '',
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS courses (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL UNIQUE,
              school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL,
              provider TEXT NOT NULL DEFAULT '',
              funding TEXT DEFAULT '',
              remote TEXT DEFAULT '',
              fit_score INTEGER DEFAULT 0,
              status TEXT DEFAULT 'active',
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS search_profiles (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              course_id INTEGER NOT NULL UNIQUE REFERENCES courses(id) ON DELETE CASCADE,
              access_mode TEXT NOT NULL DEFAULT 'Internal admin only',
              target_titles TEXT DEFAULT '',
              skills TEXT DEFAULT '',
              location_rules TEXT DEFAULT '',
              language_rules TEXT DEFAULT '',
              exclude_titles TEXT DEFAULT '',
              source_queries TEXT DEFAULT '',
              coach_note TEXT DEFAULT '',
              active INTEGER DEFAULT 1,
              updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS leads (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
              title TEXT NOT NULL,
              provider TEXT DEFAULT '',
              status TEXT DEFAULT 'New',
              score INTEGER DEFAULT 0,
              cost TEXT DEFAULT '',
              why_fit TEXT DEFAULT '',
              missing_evidence TEXT DEFAULT '',
              risks TEXT DEFAULT '',
              sources TEXT DEFAULT '',
              email_draft TEXT DEFAULT '',
              updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS documents (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
              filename TEXT NOT NULL,
              original_name TEXT NOT NULL,
              doc_type TEXT DEFAULT 'course document',
              access TEXT DEFAULT 'admin',
              status TEXT DEFAULT 'uploaded',
              note TEXT DEFAULT '',
              uploaded_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS access_roles (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              role TEXT NOT NULL UNIQUE,
              allowed TEXT NOT NULL,
              denied TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS change_requests (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
              field TEXT NOT NULL,
              old_value TEXT DEFAULT '',
              new_value TEXT NOT NULL,
              requested_by TEXT DEFAULT 'provider/coach',
              status TEXT DEFAULT 'pending',
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS workflow_runs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              workflow_name TEXT NOT NULL,
              run_mode TEXT DEFAULT 'test',
              status TEXT DEFAULT 'started',
              input_count INTEGER DEFAULT 0,
              output_count INTEGER DEFAULT 0,
              note TEXT DEFAULT '',
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS reports (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL,
              course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
              report_type TEXT DEFAULT 'School Report',
              period_start TEXT DEFAULT '',
              period_end TEXT DEFAULT '',
              status TEXT DEFAULT 'prepared',
              file_path TEXT DEFAULT '',
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS job_assignments (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
              school_id INTEGER,
              assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
              note TEXT DEFAULT ''
            );
            CREATE INDEX IF NOT EXISTS idx_ja_lead ON job_assignments(lead_id);
            CREATE INDEX IF NOT EXISTS idx_ja_school ON job_assignments(school_id);
            CREATE TABLE IF NOT EXISTS notification_events (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              event_type TEXT NOT NULL,
              lead_id INTEGER DEFAULT 0,
              school_id INTEGER DEFAULT 0,
              to_email TEXT DEFAULT '',
              status TEXT NOT NULL,
              error TEXT DEFAULT '',
              created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_notification_events_created ON notification_events(created_at);
            CREATE TABLE IF NOT EXISTS school_registrations (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              contact_person TEXT NOT NULL,
              email TEXT NOT NULL,
              plan TEXT DEFAULT 'pilot',
              message TEXT DEFAULT '',
              created_at TEXT NOT NULL DEFAULT (datetime('now')),
              status TEXT NOT NULL DEFAULT 'pending'
            );
            CREATE INDEX IF NOT EXISTS idx_school_registrations_status ON school_registrations(status, created_at);
            """
        )

        cols = table_columns(con, "courses")
        if "school_id" not in cols:
            con.execute("ALTER TABLE courses ADD COLUMN school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL")
        if "provider" not in table_columns(con, "courses"):
            con.execute("ALTER TABLE courses ADD COLUMN provider TEXT DEFAULT ''")
        school_cols = table_columns(con, "schools")
        portal_migrations = {
            "portal_token": "TEXT DEFAULT ''",
            "portal_enabled": "INTEGER DEFAULT 0",
            "portal_plan": "TEXT DEFAULT 'Pilot Portal'",
            "portal_price_eur": "REAL DEFAULT 490",
            "portal_valid_until": "TEXT DEFAULT 'Pilotphase · monatlich kuendbar'",
            "portal_note": "TEXT DEFAULT ''",
            "portal_password": "TEXT DEFAULT ''",
        }
        for col, ddl in portal_migrations.items():
            if col not in school_cols:
                con.execute(f"ALTER TABLE schools ADD COLUMN {col} {ddl}")
                school_cols.add(col)
        lead_cols = table_columns(con, "leads")
        lead_migrations = {
            "school_status": "TEXT DEFAULT 'new'",
            "school_note": "TEXT DEFAULT ''",
            "jobradar_job_id": "TEXT DEFAULT ''",
        }
        for col, ddl in lead_migrations.items():
            if col not in lead_cols:
                con.execute(f"ALTER TABLE leads ADD COLUMN {col} {ddl}")
                lead_cols.add(col)
        # Schools table migrations
        school_cols = table_columns(con, "schools")
        school_migrations = {
            "search_profiles": "TEXT DEFAULT NULL",
        }
        for col, ddl in school_migrations.items():
            if col not in school_cols:
                con.execute(f"ALTER TABLE schools ADD COLUMN {col} {ddl}")
        existing_courses = con.execute("SELECT COUNT(*) FROM courses").fetchone()[0]
        seed_time = now()
        if not existing_courses:
            seed_schools = [
                ("AZAV Academy", "", "", "active", "Seed provider for data analyst course"),
                ("Data School EU", "", "", "active", "Seed provider for AI automation/n8n course"),
                ("Future Skills GmbH", "", "", "active", "Seed provider for SAP/data course"),
                ("BI Campus", "", "", "active", "Seed provider for BI course"),
                ("Remote Code School", "", "", "risk", "Seed provider with lower-fit Python bootcamp"),
            ]
            con.executemany(
                "INSERT OR IGNORE INTO schools(name,website,contact_email,status,note,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",
                [(a, b, c, d, e, seed_time, seed_time) for a, b, c, d, e in seed_schools],
            )
            school_ids = {r["name"]: r["id"] for r in con.execute("SELECT id,name FROM schools")}
            seed_courses = [
                ("Data Analyst Weiterbildung", "AZAV Academy", "Bildungsgutschein", "Yes", 92, "active"),
                ("AI Automation / n8n Course", "Data School EU", "AZAV pending", "Yes", 89, "active"),
                ("SAP + Data Basics", "Future Skills GmbH", "Confirmed", "Hybrid risk", 84, "review"),
                ("Business Intelligence Track", "BI Campus", "Bildungsgutschein", "Yes", 88, "active"),
                ("Python Backend Bootcamp", "Remote Code School", "Unknown", "Yes", 71, "risk"),
            ]
            con.executemany(
                "INSERT INTO courses(name,school_id,provider,funding,remote,fit_score,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
                [(name, school_ids[provider], provider, funding, remote, score, status, seed_time, seed_time) for name, provider, funding, remote, score, status in seed_courses],
            )
        # Ensure every provider string has a school row and school_id is filled.
        providers = [r["provider"] for r in con.execute("SELECT DISTINCT provider FROM courses WHERE COALESCE(provider,'')<>''")]
        for provider in providers:
            con.execute(
                "INSERT OR IGNORE INTO schools(name,status,note,created_at,updated_at) VALUES(?,?,?,?,?)",
                (provider, "active", "Migrated from course provider", seed_time, seed_time),
            )
            sid = con.execute("SELECT id FROM schools WHERE name=?", (provider,)).fetchone()[0]
            con.execute("UPDATE courses SET school_id=? WHERE provider=? AND (school_id IS NULL OR school_id='')", (sid, provider))
        course_ids = {r["name"]: r["id"] for r in con.execute("SELECT id,name FROM courses")}
        profile_count = con.execute("SELECT COUNT(*) FROM search_profiles").fetchone()[0]
        if not profile_count:
            profiles = {
                "Data Analyst Weiterbildung": ("Provider can suggest changes", "Junior Data Analyst\nBI Analyst\nReporting Analyst\nData Quality Analyst", "SQL, Excel, Power BI, Python basics, dashboards, data cleaning", "Remote Germany / EU, Berlin optional, no on-site requirement", "German B1/B2 OK, English OK, entry-level or junior only", "Senior, Lead, Manager, 5+ years, pure controlling, on-site only", "site:arbeitsagentur.de Data Analyst Junior Remote\nJunior BI Analyst Berlin Remote\nData Quality Analyst Einstieg", "Coach focus: realistic entry titles and skill gaps."),
                "AI Automation / n8n Course": ("Provider can view", "AI Automation Specialist\nn8n Automation Builder\nJunior Automation Consultant\nWorkflow Automation Assistant", "n8n, Zapier, APIs, Webhooks, LLM prompts, Airtable/Sheets, basic JavaScript", "Remote DE/EU only; no travel-heavy consulting", "German/English, junior or freelance project-friendly", "Senior consultant, pure sales, heavy DevOps/SRE, on-site workshops only", "n8n automation remote Germany\nAI automation junior remote\nWorkflow automation assistant", "Coach focus: tool-choice, prompt versioning, evals and approval gates."),
                "SAP + Data Basics": ("Internal admin only", "Junior SAP Data Analyst\nERP Reporting Assistant\nSAP Support Analyst Junior\nOData / Integration Assistant", "SAP basics, Excel, SQL, OData, reporting, process documentation", "Remote preferred; hybrid risk must be flagged", "German required, junior only", "Senior SAP consultant, ABAP expert, travel required, full on-site", "Junior SAP Data Analyst Remote\nERP Reporting Assistant Einstieg\nSAP Support Junior Berlin", "Coach focus: SAP basics to business-process portfolio demos."),
                "Business Intelligence Track": ("Coach can edit criteria", "Junior BI Analyst\nPower BI Developer Junior\nReporting Specialist Junior\nData Visualization Analyst", "Power BI, SQL, DAX basics, dashboards, stakeholder reporting", "Remote/hybrid-light Germany, no permanent on-site", "German B1/B2, English OK, entry-level", "Senior BI architect, team lead, pure finance controlling, 5+ years", "Junior BI Analyst Remote Germany\nPower BI Junior Berlin\nReporting Specialist Einstieg", "Coach focus: derive portfolio dashboard exercises from vacancies."),
            }
            con.executemany(
                """INSERT OR IGNORE INTO search_profiles(course_id,access_mode,target_titles,skills,location_rules,language_rules,exclude_titles,source_queries,coach_note,updated_at)
                   VALUES(?,?,?,?,?,?,?,?,?,?)""",
                [(course_ids[name], *vals, seed_time) for name, vals in profiles.items() if name in course_ids],
            )
        lead_count = con.execute("SELECT COUNT(*) FROM leads").fetchone()[0]
        if not lead_count:
            leads = [
                (course_ids["Data Analyst Weiterbildung"], "Data Analyst Weiterbildung", "AZAV Academy", "New", 92, "€0.42", "Remote DE/EU and data-analysis focus match filters.\nGood proof for smart database and reporting dashboard.", "Current curriculum URL\nAZAV proof\nPlacement stats", "Cite provider claims before export.\nNo personal data before approval.", "provider page: needs citation\ncourse PDF: not indexed", "Hallo AZAV Academy,\n\nich prüfe passende remote-fähige Weiterbildungen im Bereich Data Analytics / AI Automation. Können Sie bitte bestätigen, ob der Kurs aktuell per Bildungsgutschein/AZAV förderbar ist?\n\nVielen Dank"),
                (course_ids["AI Automation / n8n Course"], "AI Automation / n8n Course", "Data School EU", "Strong fit", 89, "€0.31", "Directly fits AI automation/n8n positioning.\nUseful for tool-choice, prompt registry and eval proof.", "AZAV status\nProject examples\nRemote exam rules", "May be unsuitable if funding is not confirmed.", "remote option confirmed\nAZAV missing", "Hallo Data School EU,\n\nkönnen Sie bestätigen, ob der AI Automation / n8n Kurs aktuell AZAV-/Bildungsgutschein-fähig ist?\n\nFreundliche Grüße"),
                (course_ids["SAP + Data Basics"], "SAP + Data Basics", "Future Skills GmbH", "Waiting", 84, "€0.28", "SAP-adjacent angle supports SAP portfolio track.\nGood bridge between ERP/data/automation.", "Remote-only confirmation\nConcrete SAP tooling\nUpdated funding page", "Hybrid/on-site risk conflicts with filters.", "funding confirmed\nremote hybrid risk", "Hallo Future Skills GmbH,\n\nist die Teilnahme vollständig remote möglich und welche SAP-/ERP-Technologien werden praktisch genutzt?\n\nVielen Dank"),
                (course_ids["Python Backend Bootcamp"], "Python Backend Bootcamp", "Remote Code School", "Risk", 71, "€0.19", "Backend/API can support automation, but weaker than data/AI course focus.", "Funding unknown\nAI/data relevance weak\nPlacement not proven", "May become generic coding bootcamp instead of AI automation path.", "remote yes\nfunding unknown", "Hallo Remote Code School,\n\nist der Python Backend Bootcamp per Bildungsgutschein förderbar und enthält er APIs, Datenpipelines oder Automatisierung?\n\nFreundliche Grüße"),
            ]
            con.executemany(
                """INSERT INTO leads(course_id,title,provider,status,score,cost,why_fit,missing_evidence,risks,sources,email_draft,updated_at)
                   VALUES(?,?,?,?,?,?,?,?,?,?,?,?)""",
                [(*l, seed_time) for l in leads if l[0]],
            )
        con.executemany(
            "INSERT OR IGNORE INTO access_roles(role,allowed,denied) VALUES(?,?,?)",
            [
                ("Provider", "View own school/courses; upload documents; suggest search profile changes", "Other schools; private data; budgets; raw inbox; external sending"),
                ("Coach", "Edit assigned course criteria; add coach report notes; review matches", "System settings; other schools unless assigned; public exports without approval"),
                ("Admin", "Add/rename/archive schools and courses; approve changes; export reports", "None; still uses audit/approval for external actions"),
                ("AI Agent", "Read approved config; draft summaries; flag risks", "Direct external actions; private data not needed for task"),
            ],
        )
        con.commit()


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    react_index = FRONTEND_DIST / "index.html"
    if react_index.exists():
        return FileResponse(react_index)
    return templates.TemplateResponse(request, "index.html", {})


@app.get("/admin", response_class=HTMLResponse, include_in_schema=False)
def admin_spa() -> Response:
    """Serve the React admin SPA. Basic auth already enforced by middleware."""
    react_index = FRONTEND_DIST / "index.html"
    if react_index.exists():
        return HTMLResponse(react_index.read_text(encoding="utf-8"),
                            headers={"Cache-Control": "no-cache", "X-Robots-Tag": "noindex"})
    return Response(status_code=303, headers={"Location": "/admin/schools"})


@app.get("/api/dashboard")
def dashboard() -> dict[str, Any]:
    init_db()
    schools = rows("SELECT * FROM schools ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, name")
    courses = rows(
        """SELECT c.*, COALESCE(s.name,c.provider) AS school_name, s.status AS school_status
           FROM courses c LEFT JOIN schools s ON s.id=c.school_id
           ORDER BY CASE c.status WHEN 'archived' THEN 1 ELSE 0 END, school_name, c.name"""
    )
    profiles = rows(
        """SELECT sp.*, c.name AS course_name, c.provider, c.school_id, COALESCE(s.name,c.provider) AS school_name
           FROM search_profiles sp JOIN courses c ON c.id=sp.course_id
           LEFT JOIN schools s ON s.id=c.school_id
           WHERE c.status<>'archived'
           ORDER BY school_name, c.name"""
    )
    leads = rows("SELECT * FROM leads ORDER BY score DESC, updated_at DESC")
    documents = rows(
        """SELECT d.*, c.name AS course_name, COALESCE(s.name,c.provider) AS school_name
           FROM documents d LEFT JOIN courses c ON c.id=d.course_id
           LEFT JOIN schools s ON s.id=c.school_id ORDER BY uploaded_at DESC"""
    )
    roles = rows("SELECT * FROM access_roles ORDER BY role")
    requests = rows(
        """SELECT cr.*, c.name AS course_name, COALESCE(s.name,c.provider) AS school_name
           FROM change_requests cr LEFT JOIN courses c ON c.id=cr.course_id
           LEFT JOIN schools s ON s.id=c.school_id ORDER BY cr.created_at DESC LIMIT 50"""
    )
    school_stats = rows(
        """
        SELECT s.id AS school_id, s.name AS school_name, s.status,
               COUNT(DISTINCT CASE WHEN c.status<>'archived' THEN c.id END) AS active_courses,
               COUNT(DISTINCT c.id) AS total_courses,
               COUNT(DISTINCT sp.id) AS search_profiles,
               COUNT(DISTINCT l.id) AS leads,
               COUNT(DISTINCT d.id) AS documents,
               COUNT(DISTINCT CASE WHEN cr.status='pending' THEN cr.id END) AS pending_changes,
               ROUND(COALESCE(AVG(l.score),0),1) AS avg_score
        FROM schools s
        LEFT JOIN courses c ON c.school_id=s.id
        LEFT JOIN search_profiles sp ON sp.course_id=c.id
        LEFT JOIN leads l ON l.course_id=c.id
        LEFT JOIN documents d ON d.course_id=c.id
        LEFT JOIN change_requests cr ON cr.course_id=c.id
        GROUP BY s.id, s.name, s.status
        ORDER BY CASE s.status WHEN 'active' THEN 0 ELSE 1 END, s.name
        """
    )
    active_courses = [c for c in courses if c["status"] != "archived"]
    return {
        "schools": schools,
        "courses": courses,
        "profiles": profiles,
        "leads": leads,
        "documents": documents,
        "roles": roles,
        "change_requests": requests,
        "school_stats": school_stats,
        "kpis": {
            "schools": len([s for s in schools if s["status"] != "archived"]),
            "courses": len(active_courses),
            "profiles": len(profiles),
            "leads": len(leads),
            "documents": len(documents),
            "pending_changes": len([r for r in requests if r["status"] == "pending"]),
        },
    }


@app.get("/api/system/status")
def system_status() -> dict[str, Any]:
    init_db()
    latest_notifications = rows(
        """SELECT event_type,lead_id,school_id,to_email,status,error,created_at
           FROM notification_events ORDER BY created_at DESC LIMIT 10"""
    )
    return {
        "ok": True,
        "admin_auth_configured": bool(ADMIN_PASSWORD),
        "n8n_token_configured": bool(N8N_TOKEN),
        "approve_notify_webhook_configured": bool(os.getenv("JOBRADAR_APPROVE_NOTIFY_WEBHOOK") or os.getenv("JOBRADAR_NOTIFY_WEBHOOK_URL")),
        "public_base_url": PUBLIC_BASE_URL,
        "counts": one(
            """
            SELECT
              (SELECT COUNT(*) FROM schools WHERE status<>'archived') AS schools,
              (SELECT COUNT(*) FROM courses WHERE status<>'archived') AS courses,
              (SELECT COUNT(*) FROM search_profiles WHERE active=1) AS active_profiles,
              (SELECT COUNT(*) FROM leads) AS leads,
              (SELECT COUNT(*) FROM notification_events) AS notification_events
            """
        ) or {},
        "latest_notifications": latest_notifications,
    }


@app.post("/api/system/test-notification")
def test_notification(body: dict | None = None) -> dict[str, Any]:
    """Send a safe test payload through the configured approve webhook."""
    init_db()
    webhook = os.getenv("JOBRADAR_APPROVE_NOTIFY_WEBHOOK") or os.getenv("JOBRADAR_NOTIFY_WEBHOOK_URL")
    if not webhook:
        return {"ok": False, "sent": 0, "reason": "webhook_not_configured"}
    school_id = int((body or {}).get("school_id") or 0)
    school = one("SELECT id,name,contact_email,portal_token FROM schools WHERE id=?", (school_id,)) if school_id else one("SELECT id,name,contact_email,portal_token FROM schools WHERE COALESCE(contact_email,'')<>'' ORDER BY id LIMIT 1")
    if not school or not (school.get("contact_email") or "").strip():
        return {"ok": False, "sent": 0, "reason": "school_email_not_configured"}
    lead_id = int((body or {}).get("lead_id") or 0)
    lead = one("SELECT id FROM leads WHERE id=?", (lead_id,)) if lead_id else one("SELECT id FROM leads ORDER BY score DESC LIMIT 1")
    if not lead:
        return {"ok": False, "sent": 0, "reason": "lead_not_found"}
    sent = _notify_school_new_lead(int(lead["id"]), int(school["id"]), "JobRadar webhook test")
    return {"ok": sent > 0, "sent": sent}


@app.post("/api/schools")
async def create_school(request: Request) -> dict[str, Any]:
    data = await request.json()
    name = (data.get("name") or "").strip()
    if not name:
        raise HTTPException(400, "school name required")
    sid = exec_sql(
        "INSERT INTO schools(name,website,contact_email,status,note,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",
        (name, data.get("website", ""), data.get("contact_email", ""), "active", data.get("note", ""), now(), now()),
    )
    return {"ok": True, "school": one("SELECT * FROM schools WHERE id=?", (sid,))}


@app.put("/api/schools/{school_id}")
async def update_school(school_id: int, request: Request) -> dict[str, Any]:
    data = await request.json()
    existing = one("SELECT * FROM schools WHERE id=?", (school_id,))
    if not existing:
        raise HTTPException(404, "school not found")
    exec_sql(
        "UPDATE schools SET name=?,website=?,contact_email=?,status=?,note=?,updated_at=? WHERE id=?",
        (
            (data.get("name") or existing["name"]).strip(),
            data.get("website", existing["website"]),
            data.get("contact_email", existing["contact_email"]),
            data.get("status", existing["status"]),
            data.get("note", existing["note"]),
            now(),
            school_id,
        ),
    )
    school = one("SELECT * FROM schools WHERE id=?", (school_id,))
    exec_sql("UPDATE courses SET provider=?,updated_at=? WHERE school_id=?", (school["name"], now(), school_id))
    return {"ok": True, "school": school}


@app.post("/api/schools/{school_id}/archive")
def archive_school(school_id: int) -> dict[str, Any]:
    if not one("SELECT * FROM schools WHERE id=?", (school_id,)):
        raise HTTPException(404, "school not found")
    exec_sql("UPDATE schools SET status='archived',updated_at=? WHERE id=?", (now(), school_id))
    exec_sql("UPDATE courses SET status='archived',updated_at=? WHERE school_id=?", (now(), school_id))
    return {"ok": True}


@app.post("/api/courses")
async def create_course(request: Request) -> dict[str, Any]:
    data = await request.json()
    name = (data.get("name") or "").strip()
    school_id = int(data.get("school_id") or 0)
    school = one("SELECT * FROM schools WHERE id=?", (school_id,))
    if not name or not school:
        raise HTTPException(400, "course name and valid school_id required")
    cid = exec_sql(
        "INSERT INTO courses(name,school_id,provider,funding,remote,fit_score,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
        (name, school_id, school["name"], data.get("funding", ""), data.get("remote", ""), int(data.get("fit_score") or 0), "active", now(), now()),
    )
    exec_sql(
        """INSERT INTO search_profiles(course_id,access_mode,target_titles,skills,location_rules,language_rules,exclude_titles,source_queries,coach_note,updated_at)
           VALUES(?,?,?,?,?,?,?,?,?,?)""",
        (cid, "Internal admin only", "", "", "Remote Germany / EU preferred", "Entry-level / junior only", "Senior, Lead, Manager, 5+ years", "", "", now()),
    )
    return {"ok": True, "course": one("SELECT * FROM courses WHERE id=?", (cid,))}


@app.put("/api/courses/{course_id}")
async def update_course(course_id: int, request: Request) -> dict[str, Any]:
    data = await request.json()
    existing = one("SELECT * FROM courses WHERE id=?", (course_id,))
    if not existing:
        raise HTTPException(404, "course not found")
    school_id = int(data.get("school_id") or existing["school_id"] or 0)
    school = one("SELECT * FROM schools WHERE id=?", (school_id,))
    provider = school["name"] if school else existing["provider"]
    exec_sql(
        "UPDATE courses SET name=?,school_id=?,provider=?,funding=?,remote=?,fit_score=?,status=?,updated_at=? WHERE id=?",
        (
            (data.get("name") or existing["name"]).strip(),
            school_id,
            provider,
            data.get("funding", existing["funding"]),
            data.get("remote", existing["remote"]),
            int(data.get("fit_score", existing["fit_score"]) or 0),
            data.get("status", existing["status"]),
            now(),
            course_id,
        ),
    )
    return {"ok": True, "course": one("SELECT * FROM courses WHERE id=?", (course_id,))}


@app.post("/api/courses/{course_id}/archive")
def archive_course(course_id: int) -> dict[str, Any]:
    if not one("SELECT * FROM courses WHERE id=?", (course_id,)):
        raise HTTPException(404, "course not found")
    exec_sql("UPDATE courses SET status='archived',updated_at=? WHERE id=?", (now(), course_id))
    return {"ok": True}


@app.put("/api/profiles/{profile_id}")
async def update_profile(profile_id: int, request: Request) -> dict[str, Any]:
    data = await request.json()
    allowed = ["access_mode", "target_titles", "skills", "location_rules", "language_rules", "exclude_titles", "source_queries", "coach_note", "active"]
    existing = one("SELECT * FROM search_profiles WHERE id=?", (profile_id,))
    if not existing:
        raise HTTPException(404, "profile not found")
    values = {k: data.get(k, existing.get(k)) for k in allowed}
    exec_sql(
        """UPDATE search_profiles SET access_mode=?,target_titles=?,skills=?,location_rules=?,language_rules=?,exclude_titles=?,source_queries=?,coach_note=?,active=?,updated_at=? WHERE id=?""",
        (values["access_mode"], values["target_titles"], values["skills"], values["location_rules"], values["language_rules"], values["exclude_titles"], values["source_queries"], values["coach_note"], int(values["active"]), now(), profile_id),
    )
    return {"ok": True, "profile": one("SELECT * FROM search_profiles WHERE id=?", (profile_id,))}


@app.post("/api/change-requests")
async def create_change_request(request: Request) -> dict[str, Any]:
    data = await request.json()
    course_id = int(data.get("course_id") or 0)
    field = (data.get("field") or "criteria").strip()
    new_value = (data.get("new_value") or "").strip()
    requested_by = (data.get("requested_by") or "provider/coach").strip()
    if not course_id or not new_value:
        raise HTTPException(400, "course_id and new_value required")
    rid = exec_sql(
        "INSERT INTO change_requests(course_id,field,old_value,new_value,requested_by,status,created_at) VALUES(?,?,?,?,?,?,?)",
        (course_id, field, data.get("old_value", ""), new_value, requested_by, "pending", now()),
    )
    return {"ok": True, "request": one("SELECT * FROM change_requests WHERE id=?", (rid,))}


@app.post("/api/change-requests/{request_id}/{action}")
def decide_change_request(request_id: int, action: str) -> dict[str, Any]:
    if action not in {"approve", "reject"}:
        raise HTTPException(400, "action must be approve or reject")
    status = "approved" if action == "approve" else "rejected"
    exec_sql("UPDATE change_requests SET status=? WHERE id=?", (status, request_id))
    return {"ok": True, "status": status}


@app.post("/api/documents")
async def upload_document(
    course_id: int = Form(...),
    doc_type: str = Form("course document"),
    access: str = Form("admin"),
    note: str = Form(""),
    file: UploadFile = File(...),
) -> dict[str, Any]:
    if not one("SELECT id FROM courses WHERE id=?", (course_id,)):
        raise HTTPException(404, "course not found")
    safe_name = Path(file.filename or "upload.bin").name.replace(" ", "_")
    stored = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{safe_name}"
    dest = UPLOAD_DIR / stored
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    doc_id = exec_sql(
        """INSERT INTO documents(course_id,filename,original_name,doc_type,access,status,note,uploaded_at)
           VALUES(?,?,?,?,?,?,?,?)""",
        (course_id, stored, file.filename or safe_name, doc_type, access, "uploaded", note, now()),
    )
    return {"ok": True, "document": one("SELECT * FROM documents WHERE id=?", (doc_id,))}


@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: int) -> dict[str, Any]:
    doc = one("SELECT * FROM documents WHERE id=?", (doc_id,))
    if not doc:
        raise HTTPException(404, "document not found")
    path = UPLOAD_DIR / doc["filename"]
    if path.exists():
        path.unlink()
    exec_sql("DELETE FROM documents WHERE id=?", (doc_id,))
    return {"ok": True}


@app.get("/api/export/profile/{profile_id}")
def export_profile(profile_id: int) -> dict[str, Any]:
    p = one(
        """SELECT sp.*, c.name AS course_name, c.provider, COALESCE(s.name,c.provider) AS school_name
           FROM search_profiles sp JOIN courses c ON c.id=sp.course_id
           LEFT JOIN schools s ON s.id=c.school_id WHERE sp.id=?""",
        (profile_id,),
    )
    if not p:
        raise HTTPException(404, "profile not found")
    return {
        "school": p["school_name"],
        "course": p["course_name"],
        "access": p["access_mode"],
        "target_professions": [x for x in p["target_titles"].splitlines() if x.strip()],
        "keywords_skills": [x.strip() for x in p["skills"].split(",") if x.strip()],
        "location_rules": p["location_rules"],
        "language_rules": p["language_rules"],
        "exclude_titles": [x.strip() for x in p["exclude_titles"].split(",") if x.strip()],
        "source_queries": [x for x in p["source_queries"].splitlines() if x.strip()],
        "coach_note": p["coach_note"],
    }



def school_report_data(school_id: int) -> dict[str, Any]:
    init_db()
    school = one("SELECT * FROM schools WHERE id=?", (school_id,))
    if not school:
        raise HTTPException(404, "school not found")
    courses = rows("SELECT * FROM courses WHERE school_id=? ORDER BY CASE status WHEN 'archived' THEN 1 ELSE 0 END, name", (school_id,))
    leads = rows(
        """SELECT l.*, c.name AS course_name FROM leads l
           LEFT JOIN courses c ON c.id=l.course_id WHERE c.school_id=?
           ORDER BY l.score DESC, l.updated_at DESC""",
        (school_id,),
    )
    documents = rows(
        """SELECT d.*, c.name AS course_name FROM documents d
           LEFT JOIN courses c ON c.id=d.course_id WHERE c.school_id=?
           ORDER BY d.uploaded_at DESC""",
        (school_id,),
    )
    profiles = rows(
        """SELECT sp.*, c.name AS course_name FROM search_profiles sp
           JOIN courses c ON c.id=sp.course_id WHERE c.school_id=?
           ORDER BY c.name""",
        (school_id,),
    )
    changes = rows(
        """SELECT cr.*, c.name AS course_name FROM change_requests cr
           LEFT JOIN courses c ON c.id=cr.course_id WHERE c.school_id=?
           ORDER BY cr.created_at DESC""",
        (school_id,),
    )
    active_courses = [c for c in courses if c["status"] != "archived"]
    avg_score = round(sum(int(l["score"] or 0) for l in leads) / len(leads), 1) if leads else 0
    stats = {
        "active_courses": len(active_courses),
        "total_courses": len(courses),
        "search_profiles": len(profiles),
        "leads": len(leads),
        "documents": len(documents),
        "pending_changes": len([c for c in changes if c["status"] == "pending"]),
        "avg_score": avg_score,
    }
    return {"school": school, "stats": stats, "courses": courses, "profiles": profiles, "leads": leads, "documents": documents, "change_requests": changes, "generated_at": now()}


def safe_report_name(name: str) -> str:
    return "".join(ch if ch.isalnum() or ch in "-_" else "_" for ch in name).strip("_") or "school"


PORTAL_VISIBLE_LEAD_STATUSES = {"approved", "freigegeben", "visible", "strong fit"}


def new_portal_token() -> str:
    return secrets.token_urlsafe(32)


def _split_lines(value: Any) -> list[str]:
    text = str(value or "")
    if "\n" in text:
        return [x.strip() for x in text.splitlines() if x.strip()]
    return [x.strip() for x in text.split(",") if x.strip()]


def school_portal_data(token: str) -> dict[str, Any]:
    """Return a school-scoped, customer-safe data view for /school/{token}.

    This intentionally excludes internal costs, email drafts, raw source payloads,
    n8n state, prompts, credentials, rejected leads and other schools.
    """
    init_db()
    if not token or len(token) < 24:
        raise HTTPException(404, "portal not found")
    school = one(
        """SELECT id,name,website,contact_email,status,note,portal_plan,portal_price_eur,
                  portal_valid_until,portal_note
             FROM schools
             WHERE portal_token=? AND portal_enabled=1 AND status<>'archived'""",
        (token,),
    )
    if not school:
        raise HTTPException(404, "portal not found")

    school_id = int(school["id"])
    courses = rows(
        """SELECT id,name,funding,remote,fit_score,status,updated_at
             FROM courses
             WHERE school_id=? AND status<>'archived'
             ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'review' THEN 1 WHEN 'risk' THEN 2 ELSE 3 END, name""",
        (school_id,),
    )
    profiles_raw = rows(
        """SELECT sp.id,sp.course_id,c.name AS course_name,sp.target_titles,sp.skills,
                  sp.location_rules,sp.language_rules,sp.exclude_titles,sp.active,sp.updated_at
             FROM search_profiles sp JOIN courses c ON c.id=sp.course_id
             WHERE c.school_id=? AND c.status<>'archived'
             ORDER BY c.name""",
        (school_id,),
    )
    profiles = [
        {
            "id": p["id"],
            "course_id": p["course_id"],
            "course_name": p["course_name"],
            "target_titles": _split_lines(p["target_titles"]),
            "skills": _split_lines(p["skills"]),
            "location_rules": p["location_rules"],
            "language_rules": p["language_rules"],
            "active": bool(p["active"]),
            "updated_at": p["updated_at"],
        }
        for p in profiles_raw
    ]
    leads = rows(
        """SELECT l.id,l.course_id,c.name AS course_name,l.title,l.provider,l.status,l.score,
                  l.why_fit,l.missing_evidence,l.updated_at
             FROM leads l
             JOIN job_assignments ja ON ja.lead_id=l.id
             JOIN courses c ON c.id=l.course_id
             WHERE lower(l.status)='approved'
               AND (ja.school_id=? OR ja.school_id IS NULL)
             ORDER BY l.score DESC, l.updated_at DESC""",
        (school_id,),
    )
    documents = rows(
        """SELECT d.id,d.course_id,c.name AS course_name,d.original_name,d.doc_type,d.access,d.status,d.uploaded_at
             FROM documents d JOIN courses c ON c.id=d.course_id
             WHERE c.school_id=? AND lower(COALESCE(d.access,'')) IN ('school','public')
             ORDER BY d.uploaded_at DESC""",
        (school_id,),
    )
    reports = rows(
        """SELECT id,course_id,report_type,period_start,period_end,status,created_at
             FROM reports
             WHERE school_id=? AND lower(COALESCE(status,'')) IN ('prepared','published','ready')
             ORDER BY created_at DESC LIMIT 12""",
        (school_id,),
    )
    stats = {
        "courses": len(courses),
        "profiles": len(profiles),
        "approved_matches": len(leads),
        "reports": len(reports),
        "avg_score": round(sum(int(l["score"] or 0) for l in leads) / len(leads), 1) if leads else 0,
    }
    return {
        "school": school,
        "tariff": {
            "plan": school.get("portal_plan") or "Pilot Portal",
            "price_eur": school.get("portal_price_eur") or 490,
            "valid_until": school.get("portal_valid_until") or "Pilotphase · monatlich kuendbar",
            "included": [
                "bis 2 Kurse im Pilot",
                "4 Suchlaeufe pro Monat",
                "gepruefte Matches statt Rohdaten",
                "schulbezogene Reports",
                "Aenderungswuensche ueber Freigabeprozess",
            ],
        },
        "stats": stats,
        "courses": courses,
        "profiles": profiles,
        "leads": leads,
        "documents": documents,
        "reports": reports,
        "generated_at": now(),
    }


def portal_headers() -> dict[str, str]:
    return {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
    }


def render_school_portal_html(data: dict[str, Any], token: str) -> str:
    def e(v: Any) -> str:
        return html.escape(str(v or ""))

    school = data["school"]
    tariff = data["tariff"]
    stats = data["stats"]
    course_rows = "".join(
        f"<tr><td><b>{e(c['name'])}</b></td><td>{e(c['funding'])}</td><td>{e(c['remote'])}</td><td>{e(c['status'])}</td><td>{e(c['fit_score'])}%</td></tr>"
        for c in data["courses"]
    ) or "<tr><td colspan='5' class='empty'>Noch keine Kurse freigegeben.</td></tr>"
    lead_rows = "".join(
        f"<tr><td><b>{e(l['title'])}</b><br><span>{e(l['provider'])}</span></td><td>{e(l['course_name'])}</td><td>{e(l['score'])}%</td><td>{e(l['why_fit'])}</td></tr>"
        for l in data["leads"]
    ) or "<tr><td colspan='4' class='empty'>Noch keine freigegebenen Matches.</td></tr>"
    report_rows = "".join(
        f"<tr><td>{e(r['report_type'])}</td><td>{e(r['period_start'])} – {e(r['period_end'])}</td><td>{e(r['status'])}</td></tr>"
        for r in data["reports"]
    ) or "<tr><td colspan='3' class='empty'>Noch keine Reports freigegeben.</td></tr>"
    profile_cards = "".join(
        f"<section class='mini'><h3>{e(p['course_name'])}</h3><p><b>Zielrollen:</b> {e(', '.join(p['target_titles'][:5]))}</p><p><b>Skills:</b> {e(', '.join(p['skills'][:8]))}</p><p><b>Region:</b> {e(p['location_rules'])}</p></section>"
        for p in data["profiles"]
    ) or "<p class='muted'>Noch keine Suchprofile freigegeben.</p>"
    included = "".join(f"<li>{e(x)}</li>" for x in tariff["included"])
    return f"""<!doctype html><html lang='de'><head><meta charset='utf-8'>
<meta name='viewport' content='width=device-width,initial-scale=1'><meta name='robots' content='noindex,nofollow'>
<title>JobRadar Schulportal – {e(school['name'])}</title>
<style>
:root{{color-scheme:light;--ink:#172033;--muted:#64748b;--line:#dbe3ef;--brand:#2563eb;--ok:#059669}}
*{{box-sizing:border-box}}body{{margin:0;font-family:Inter,ui-sans-serif,system-ui,Segoe UI,Arial,sans-serif;background:#f8fafc;color:var(--ink)}}
.wrap{{max-width:1180px;margin:0 auto;padding:28px 20px}}.hero{{background:linear-gradient(135deg,#0f172a,#1e3a8a);color:white;padding:48px 0}}
.badge{{display:inline-flex;border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:6px 10px;color:#dbeafe;font-size:12px;font-weight:700}}
h1{{font-size:clamp(32px,5vw,56px);line-height:1.02;margin:18px 0 12px;letter-spacing:-.04em}}p{{line-height:1.6}}.muted{{color:var(--muted)}}
.grid{{display:grid;gap:16px}}.kpis{{grid-template-columns:repeat(4,minmax(0,1fr));margin-top:22px}}.card{{background:white;border:1px solid var(--line);border-radius:18px;padding:20px;box-shadow:0 12px 28px rgba(15,23,42,.06)}}
.kpi b{{display:block;font-size:28px}}.kpi span{{color:var(--muted);font-size:13px}}.cols{{grid-template-columns:1fr 2fr}}table{{width:100%;border-collapse:collapse;font-size:14px}}th,td{{text-align:left;border-bottom:1px solid #eef2f7;padding:12px;vertical-align:top}}th{{color:#475569;background:#f8fafc;font-size:12px;text-transform:uppercase;letter-spacing:.04em}}td span{{color:var(--muted);font-size:12px}}.empty{{text-align:center;color:#94a3b8;padding:28px}}.mini{{border:1px solid #e2e8f0;border-radius:14px;padding:14px;margin:10px 0;background:#fbfdff}}.safe{{background:#0f172a;color:white}}.safe li{{margin:8px 0;color:#cbd5e1}}a.btn{{display:inline-flex;gap:8px;align-items:center;border-radius:12px;background:white;color:#0f172a;padding:11px 14px;text-decoration:none;font-weight:700;margin-right:8px}}a.btn.secondary{{background:#dbeafe;color:#1e40af}}@media(max-width:800px){{.kpis,.cols{{grid-template-columns:1fr}}}}
</style></head><body>
<header class='hero'><div class='wrap'><span class='badge'>JobRadar Schulportal · read-only · noindex</span><h1>{e(school['name'])}</h1><p>Ihre freigegebene Sicht auf Kurse, Suchprofile, gepruefte Matches und Reports. Interne Kosten, Rohdaten, Logs und andere Schulen bleiben verborgen.</p><p><a class='btn' href='/school/{e(token)}/report.html'>HTML-Report</a><a class='btn secondary' href='/school/{e(token)}/report.csv'>CSV herunterladen</a></p></div></header>
<main class='wrap'>
<section class='grid kpis'><div class='card kpi'><b>{stats['courses']}</b><span>Kurse</span></div><div class='card kpi'><b>{stats['profiles']}</b><span>Suchprofile</span></div><div class='card kpi'><b>{stats['approved_matches']}</b><span>freigegebene Matches</span></div><div class='card kpi'><b>{stats['reports']}</b><span>Reports</span></div></section>
<section class='grid cols' style='margin-top:16px'><div class='card'><h2>Tarif & Leistung</h2><p><b>{e(tariff['plan'])}</b><br>{e(tariff['price_eur'])} € / Monat<br><span class='muted'>{e(tariff['valid_until'])}</span></p><ul>{included}</ul></div><div class='card'><h2>Kurse</h2><table><tr><th>Kurs</th><th>Foerderung</th><th>Remote</th><th>Status</th><th>Fit</th></tr>{course_rows}</table></div></section>
<section class='card' style='margin-top:16px'><h2>Suchprofile</h2>{profile_cards}</section>
<section class='card' style='margin-top:16px'><h2>Freigegebene Matches</h2><p class='muted'>Nur portal-sichtbare Treffer; Kandidaten in QA, Rejected Leads und interne Notizen werden nicht angezeigt.</p><table><tr><th>Rolle</th><th>Kurs</th><th>Fit</th><th>Warum passend</th></tr>{lead_rows}</table></section>
<section class='card' style='margin-top:16px'><h2>Reports</h2><table><tr><th>Typ</th><th>Zeitraum</th><th>Status</th></tr>{report_rows}</table></section>
<section class='card safe' style='margin-top:16px'><h2>Bewusst verborgen</h2><ul><li>interne Parser-/LLM-/n8n-/Hostingkosten und Marge</li><li>Rohdaten, Scraping-Logs, Prompts, Credentials und Webhooks</li><li>andere Schulen, abgelehnte Treffer und interne QA-Notizen</li></ul></section>
<p class='muted'>Generiert: {e(data['generated_at'])}</p>
</main></body></html>"""



# ── Job Pool & Manual Add ─────────────────────────────────────────────────────

def _similar_title_duplicates(lead_id: int, title: str) -> list:
    words = {
        w for w in "".join(
            ch.lower() if ch.isalnum() else " "
            for ch in (title or "")
        ).split()
        if len(w) >= 4
    }
    if not words:
        return []
    result = []
    for row in rows(
        "SELECT id,title FROM leads WHERE id<>? AND lower(status) IN ('new','candidate','approved')",
        (lead_id,),
    ):
        other = {
            w for w in "".join(
                ch.lower() if ch.isalnum() else " "
                for ch in (row.get("title") or "")
            ).split()
            if len(w) >= 4
        }
        if other and len(words & other) / max(1, min(len(words), len(other))) >= 0.6:
            result.append(int(row["id"]))
    return result[:8]



def _record_notification(event_type: str, lead_id: int, school_id: int | None, email: str, status: str, error: str = "") -> None:
    try:
        exec_sql(
            """INSERT INTO notification_events(event_type,lead_id,school_id,to_email,status,error,created_at)
               VALUES(?,?,?,?,?,?,?)""",
            (event_type, lead_id, int(school_id or 0), email, status, error[:500], now()),
        )
    except Exception:
        pass


def _notify_school_new_lead(lead_id: int, school_id: int | None, note: str = "") -> int:
    """Best-effort customer-safe notification hook for approved leads.

    Sends to n8n if JOBRADAR_APPROVE_NOTIFY_WEBHOOK or JOBRADAR_NOTIFY_WEBHOOK_URL
    is configured. No secrets/tokens are printed or exposed in API responses.
    Missing webhook/contact emails must not block approve.
    """
    webhook = os.getenv("JOBRADAR_APPROVE_NOTIFY_WEBHOOK") or os.getenv("JOBRADAR_NOTIFY_WEBHOOK_URL")
    if not webhook:
        _record_notification("job_approved_for_school", lead_id, school_id, "", "skipped_no_webhook")
        return 0
    lead = one("SELECT id,title,provider,score,why_fit,updated_at FROM leads WHERE id=?", (lead_id,))
    if not lead:
        _record_notification("job_approved_for_school", lead_id, school_id, "", "skipped_missing_lead")
        return 0
    targets = []
    if school_id is None:
        targets = rows("""SELECT id,name,contact_email,portal_token
                          FROM schools
                          WHERE status<>'archived' AND portal_enabled=1
                            AND COALESCE(contact_email,'')<>''""")
    else:
        school = one("""SELECT id,name,contact_email,portal_token
                        FROM schools
                        WHERE id=? AND status<>'archived'""", (school_id,))
        if school:
            targets = [school]
    import urllib.request as _ur, json as _j
    sent_count = 0
    for school in targets:
        email = (school.get("contact_email") or "").strip()
        if not email:
            _record_notification("job_approved_for_school", lead_id, school.get("id"), "", "skipped_no_email")
            continue
        portal_url = ""
        if school.get("portal_token"):
            portal_url = f"{PUBLIC_BASE_URL}/school/{school['portal_token']}"
        payload = {
            "event": "job_approved_for_school",
            "school_id": school["id"],
            "school_name": school["name"],
            "to_email": email,
            "subject": "Neue gepruefte Stelle in Ihrem JobRadar Portal",
            "lead": {
                "id": lead["id"],
                "title": lead["title"],
                "provider": lead["provider"],
                "score": lead["score"],
                "why_fit": lead["why_fit"],
            },
            "portal_url": portal_url,
            "note": note,
        }
        try:
            req = _ur.Request(webhook, data=_j.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"}, method="POST")
            _ur.urlopen(req, timeout=10).read(256)
            sent_count += 1
            _record_notification("job_approved_for_school", lead_id, school["id"], email, "sent")
        except Exception as exc:
            _record_notification("job_approved_for_school", lead_id, school["id"], email, "error", str(exc))
    return sent_count


@app.get("/api/leads/pending")
def leads_pending() -> dict:
    init_db()
    pending = rows(
        """SELECT l.id,l.title,l.provider,l.score,l.why_fit,l.missing_evidence,
                  l.risks,l.sources,l.status,l.updated_at
             FROM leads l WHERE lower(l.status) IN ('new','candidate')
             ORDER BY l.score DESC""")
    for lead in pending:
        lead["duplicates"] = _similar_title_duplicates(int(lead["id"]), lead.get("title") or "")
    schools_list = rows("SELECT id,name FROM schools WHERE status<>'archived' ORDER BY name")
    return {"leads": pending, "schools": schools_list}


@app.get("/api/pool")
def leads_pool() -> dict:
    init_db()
    pool = rows(
        """SELECT
             l.id, l.title, l.provider, l.score, l.why_fit, l.status, l.updated_at,
             CASE
               WHEN SUM(CASE WHEN ja.school_id IS NULL THEN 1 ELSE 0 END) > 0
                 THEN 'Alle Schulen'
               ELSE COALESCE(GROUP_CONCAT(s.name, ' · '), 'Nicht zugewiesen')
             END AS assigned_to,
             CASE
               WHEN SUM(CASE WHEN ja.school_id IS NULL THEN 1 ELSE 0 END) > 0
                 THEN 0
               ELSE COUNT(ja.school_id)
             END AS assigned_count
           FROM leads l
           LEFT JOIN job_assignments ja ON ja.lead_id = l.id
           LEFT JOIN schools s ON s.id = ja.school_id
           WHERE lower(l.status) = 'approved'
           GROUP BY l.id
           ORDER BY l.score DESC""")
    return {"leads": pool}


@app.post("/api/leads/{lead_id}/approve")
def approve_lead(lead_id: int, body: dict) -> dict:
    init_db()
    lead = one("SELECT id FROM leads WHERE id=?", (lead_id,))
    if not lead:
        raise HTTPException(404, "lead not found")
    school_ids = body.get("school_ids", [])
    note = body.get("note", "")
    exec_sql("UPDATE leads SET status='Approved',updated_at=? WHERE id=?", (now(), lead_id))
    exec_sql("DELETE FROM job_assignments WHERE lead_id=?", (lead_id,))
    notification_count = 0
    if school_ids:
        for sid in school_ids:
            school_id = int(sid)
            exec_sql(
                "INSERT INTO job_assignments(lead_id,school_id,note,assigned_at) VALUES(?,?,?,?)",
                (lead_id, school_id, note, now()))
            notification_count += _notify_school_new_lead(lead_id, school_id, note)
        assigned = len(school_ids)
    else:
        exec_sql(
            "INSERT INTO job_assignments(lead_id,school_id,note,assigned_at) VALUES(?,NULL,?,?)",
            (lead_id, note, now()))
        assigned = 0
        notification_count = _notify_school_new_lead(lead_id, None, note)
    return {"ok": True, "assigned_to": assigned, "notification_count": notification_count}


@app.post("/api/leads/{lead_id}/reject")
def reject_lead(lead_id: int) -> dict:
    init_db()
    exec_sql("UPDATE leads SET status='Rejected',updated_at=? WHERE id=?", (now(), lead_id))
    exec_sql("DELETE FROM job_assignments WHERE lead_id=?", (lead_id,))
    return {"ok": True}


@app.get("/admin/pool", response_class=HTMLResponse)
def admin_pool(request: Request):
    init_db()
    pending = rows(
        """SELECT l.id,l.title,l.provider,l.score,l.why_fit,l.status,l.updated_at
             FROM leads l WHERE lower(l.status) IN ('new','candidate')
             ORDER BY l.score DESC""")
    approved = rows(
        """SELECT l.id,l.title,l.provider,l.score,l.status,l.updated_at,
                  COALESCE(GROUP_CONCAT(s.name,' · '),'Alle Schulen') AS assigned_to
             FROM leads l
             LEFT JOIN job_assignments ja ON ja.lead_id=l.id
             LEFT JOIN schools s ON s.id=ja.school_id
             WHERE lower(l.status)='approved'
             GROUP BY l.id ORDER BY l.score DESC""")
    schools_list = rows("SELECT id,name FROM schools WHERE status<>'archived' ORDER BY name")

    def sc(v):
        v = int(v or 0)
        return "#22c55e" if v >= 80 else "#f59e0b" if v >= 60 else "#ef4444"

    school_opts = "".join(
        "<label style='display:block;margin:4px 0'>"
        "<input type='checkbox' name='sid' value='" + str(s["id"]) + "'> " + e(s["name"]) + "</label>"
        for s in schools_list)

    def prow(l):
        sid = l["id"]; sc_ = sc(l["score"]); score = l["score"]
        title = e(l["title"]); prov = e(l["provider"])
        why = e((l["why_fit"] or "")[:80])
        return (
            "<tr><td><b style='color:" + sc_ + "'>" + str(score) + "</b></td>"
            "<td>" + title + "</td><td>" + prov + "</td>"
            "<td style='font-size:13px;color:#64748b'>" + why + "</td>"
            "<td>"
            "<button onclick='openApprove(" + str(sid) + ","" + title + "")' class='bok'>&#10003; Freigeben</button> "
            "<button onclick='doReject(" + str(sid) + ")' class='bno'>&#10007; Ablehnen</button>"
            "</td></tr>")

    def arow(l):
        sid = l["id"]; sc_ = sc(l["score"]); score = l["score"]
        title = e(l["title"]); prov = e(l["provider"])
        assigned = e(l["assigned_to"] or "Alle Schulen")
        date = (l["updated_at"] or "")[:10]
        return (
            "<tr><td><b style='color:" + sc_ + "'>" + str(score) + "</b></td>"
            "<td>" + title + "</td><td>" + prov + "</td>"
            "<td>" + assigned + "</td>"
            "<td>" + date + "</td>"
            "<td><button onclick='doReject(" + str(sid) + ")' class='bno'>Widerrufen</button></td></tr>")

    prows = "".join(prow(l) for l in pending) or "<tr><td colspan=5 style='text-align:center;padding:20px;color:#94a3b8'>Keine offenen Stellen</td></tr>"
    arows = "".join(arow(l) for l in approved) or "<tr><td colspan=6 style='text-align:center;padding:20px;color:#94a3b8'>Noch keine freigegebenen Stellen</td></tr>"

    html = f"""<!DOCTYPE html><html><head><meta charset='utf-8'><title>Job Pool</title>
<style>
body{{font-family:system-ui;margin:0;background:#f8fafc;color:#1e293b}}
nav{{background:#1e293b;padding:12px 24px;display:flex;gap:20px;align-items:center}}
nav a{{color:#94a3b8;text-decoration:none;font-size:14px}}nav a:hover{{color:#fff}}
nav b{{color:#fff}}
.wrap{{max-width:1100px;margin:28px auto;padding:0 20px}}
h2{{margin:24px 0 10px;font-size:18px}}
table{{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}}
th{{background:#f1f5f9;padding:9px 12px;text-align:left;font-size:12px;color:#64748b;text-transform:uppercase}}
td{{padding:9px 12px;border-top:1px solid #f1f5f9;font-size:13px}}
.bok{{background:#22c55e;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;font-size:12px}}
.bno{{background:#ef4444;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;font-size:12px}}
.overlay{{display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:50;align-items:center;justify-content:center}}
.overlay.on{{display:flex}}
.modal{{background:#fff;border-radius:12px;padding:24px;min-width:340px;max-width:480px;box-shadow:0 8px 32px rgba(0,0,0,.18)}}
.modal h3{{margin:0 0 8px}}.modal p{{color:#64748b;margin:0 0 14px;font-size:14px}}
textarea{{width:100%;box-sizing:border-box;border:1px solid #e2e8f0;border-radius:6px;padding:8px;font-size:13px}}
.mact{{margin-top:14px;display:flex;gap:8px;justify-content:flex-end}}
.mbtn{{padding:8px 16px;border:1px solid #e2e8f0;background:#fff;border-radius:6px;cursor:pointer;font-size:13px}}
</style></head><body>
<nav><b>JobRadar</b><a href='/'>Dashboard</a><a href='/admin/schools'>Schulen</a><a href='/admin/pool'>Job Pool</a><a href='/admin/add-job'>+ Stelle</a></nav>
<div class='wrap'>
  <h2>Zur Pruefung ({len(pending)})</h2>
  <table><thead><tr><th>Score</th><th>Titel</th><th>Anbieter</th><th>Warum passend</th><th>Aktion</th></tr></thead>
  <tbody>{prows}</tbody></table>
  <h2>Freigegeben ({len(approved)})</h2>
  <table><thead><tr><th>Score</th><th>Titel</th><th>Anbieter</th><th>Zugewiesen</th><th>Datum</th><th>Aktion</th></tr></thead>
  <tbody>{arows}</tbody></table>
</div>
<div class='overlay' id='ov'>
  <div class='modal'>
    <h3>Stelle freigeben</h3>
    <p id='mt'></p>
    <b style='font-size:13px'>Schulen:</b>
    <label style='display:block;margin:8px 0 4px;font-size:13px'><input type='checkbox' id='allCb' checked onchange='toggleAll(this)'> <b>Alle Schulen</b></label>
    <div id='scb' style='margin-left:16px;opacity:.4;pointer-events:none;font-size:13px'>{school_opts}</div>
    <br><b style='font-size:13px'>Notiz (optional):</b>
    <textarea id='note' rows='3' placeholder='z.B. Gute Remote-Option...'></textarea>
    <div class='mact'>
      <button class='mbtn' onclick='closeM()'>Abbrechen</button>
      <button class='bok' style='padding:8px 16px' onclick='submitApprove()'>Freigeben</button>
    </div>
  </div>
</div>
<script>
let cid=null;
function openApprove(id,t){{cid=id;document.getElementById('mt').textContent=t;document.getElementById('ov').classList.add('on');}}
function closeM(){{document.getElementById('ov').classList.remove('on');cid=null;}}
function toggleAll(cb){{const d=document.getElementById('scb');d.style.opacity=cb.checked?'.4':'1';d.style.pointerEvents=cb.checked?'none':'auto';d.querySelectorAll('input').forEach(i=>i.checked=false);}}
async function submitApprove(){{
  const all=document.getElementById('allCb').checked;
  const sids=all?[]:[...document.querySelectorAll('#scb input:checked')].map(i=>+i.value);
  const note=document.getElementById('note').value;
  await fetch('/api/leads/'+cid+'/approve',{{method:'POST',headers:{{'Content-Type':'application/json'}},body:JSON.stringify({{school_ids:sids,note}})}});
  closeM();location.reload();
}}
async function doReject(id){{if(!confirm('Ablehnen?'))return;await fetch('/api/leads/'+id+'/reject',{{method:'POST'}});location.reload();}}
</script></body></html>"""
    return HTMLResponse(html)


@app.get("/admin/add-job", response_class=HTMLResponse)
def admin_add_job_form(request: Request):
    html = """<!DOCTYPE html><html><head><meta charset='utf-8'><title>Stelle hinzufuegen</title>
<style>
body{font-family:system-ui;margin:0;background:#f8fafc;color:#1e293b}
nav{background:#1e293b;padding:12px 24px;display:flex;gap:20px;align-items:center}
nav a{color:#94a3b8;text-decoration:none;font-size:14px}nav a:hover{color:#fff}
nav b{color:#fff}
.wrap{max-width:620px;margin:40px auto;padding:0 20px}
.card{background:#fff;border-radius:12px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
label{display:block;font-weight:500;margin:14px 0 5px;font-size:14px}
input,select,textarea{width:100%;box-sizing:border-box;border:1px solid #e2e8f0;border-radius:8px;padding:9px 12px;font-size:14px;font-family:inherit}
textarea{resize:vertical}
.btn{background:#1e293b;color:#fff;border:none;padding:11px 20px;border-radius:8px;cursor:pointer;font-size:14px;width:100%;margin-top:18px}
.ok{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;border-radius:8px;padding:14px;margin-top:14px;display:none}
</style></head><body>
<nav><b>JobRadar</b><a href='/'>Dashboard</a><a href='/admin/schools'>Schulen</a><a href='/admin/pool'>Job Pool</a><a href='/admin/add-job'>+ Stelle</a></nav>
<div class='wrap'><div class='card'>
  <h2 style='margin-top:0'>Stelle manuell hinzufuegen</h2>
  <p style='color:#64748b;font-size:14px'>Die Stelle wird in der Pruefungswarteschlange angezeigt.</p>
  <form id='f'>
    <label>URL (optional)</label>
    <input type='url' name='url' placeholder='https://jobs.example.com/...' />
    <label>Beschreibungstext (URL oder Text einfuegen)</label>
    <textarea name='description' rows='8' placeholder='Jobbeschreibung einfuegen...'></textarea>
    <label>Quelle</label>
    <select name='source'>
      <option>ChatGPT DeepSearch</option><option>Hermes</option>
      <option>LinkedIn</option><option>Stepstone</option>
      <option>Indeed</option><option>Remotive</option><option>Andere</option>
    </select>
    <button type='submit' class='btn'>Zur Pruefung einreichen</button>
  </form>
  <div class='ok' id='ok'>Eingereicht! Erscheint in Kuerze im <a href='/admin/pool'>Job Pool</a>.</div>
</div></div>
<script>
document.getElementById('f').onsubmit=async(e)=>{
  e.preventDefault();
  const fd=new FormData(e.target);
  await fetch('/admin/add-job',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(fd)});
  document.getElementById('ok').style.display='block';
  e.target.reset();
};
</script></body></html>"""
    return HTMLResponse(html)


@app.post("/admin/add-job")
def admin_add_job_submit(
    url: str = Form(default=""),
    description: str = Form(default=""),
    source: str = Form(default="Andere"),
):
    import urllib.request as _ur, json as _j
    raw = description.strip() or url.strip()
    if not raw:
        raise HTTPException(400, "URL oder Beschreibung erforderlich")
    payload = {
        "input_source": "manual", "source_detail": "manual_text",
        "subject": f"[{source}] {url or 'Manual Entry'}",
        "raw_text": raw, "raw_meta": {"url": url, "source_label": source},
    }
    webhook = MANUAL_JOB_WEBHOOK
    if not webhook:
        return {"ok": False, "queued": False, "reason": "manual_job_webhook_not_configured"}
    req = _ur.Request(
        webhook,
        data=_j.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}, method="POST")
    try:
        _ur.urlopen(req, timeout=10)
        return {"ok": True, "queued": True}
    except Exception as exc:
        return {"ok": False, "queued": False, "reason": "webhook_error", "error": str(exc)[:200]}



def admin_nav() -> str:
    return "<nav><b>JobRadar</b><a href='/'>Dashboard</a><a href='/admin/schools'>Schulen</a><a href='/admin/registrations'>Anmeldungen</a><a href='/admin/pool'>Job Pool</a><a href='/admin/add-job'>+ Stelle</a></nav>"


def status_options(current: Any) -> str:
    cur = str(current or "active")
    opts = ["lead", "active", "review", "risk", "archived"]
    return "".join(f"<option {'selected' if o == cur else ''}>{o}</option>" for o in opts)


def admin_style() -> str:
    return """<style>
body{font-family:system-ui;margin:0;background:#f8fafc;color:#1e293b}nav{background:#1e293b;padding:12px 24px;display:flex;gap:20px;align-items:center}nav a{color:#94a3b8;text-decoration:none;font-size:14px}nav a:hover{color:#fff}nav b{color:#fff}.wrap{max-width:1180px;margin:28px auto;padding:0 20px}.card{background:#fff;border-radius:12px;padding:22px;margin:18px 0;box-shadow:0 1px 3px rgba(0,0,0,.08)}.mini{border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;background:#fbfdff}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}.wide{grid-column:1/-1}label{display:block;font-size:13px;font-weight:600;color:#334155}input,select,textarea{width:100%;box-sizing:border-box;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;font:inherit;margin-top:5px}textarea{resize:vertical}.actions{text-align:right;align-self:end}button,.btn{background:#1e293b;color:#fff;border:none;border-radius:8px;padding:9px 14px;text-decoration:none;display:inline-block;cursor:pointer}.primary{background:#2563eb}.small{font-size:12px;padding:6px 10px}table{width:100%;border-collapse:collapse}th{background:#f1f5f9;text-align:left;font-size:12px;color:#64748b;text-transform:uppercase;padding:9px}td{border-top:1px solid #eef2f7;padding:10px;font-size:14px;vertical-align:top}span,.muted{color:#64748b}.portalbox{background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px;margin-top:14px;word-break:break-all}.profile{margin-top:12px;border-top:1px dashed #cbd5e1;padding-top:12px}@media(max-width:800px){.grid2{grid-template-columns:1fr}.wide{grid-column:auto}}</style>"""


def registration_status_badge(status: Any) -> str:
    value = str(status or "pending")
    colors = {"pending": "#f59e0b", "approved": "#16a34a", "rejected": "#64748b"}
    color = colors.get(value, "#64748b")
    return f"<span style='display:inline-block;border-radius:999px;background:{color};color:white;padding:3px 9px;font-size:12px;font-weight:700'>{e(value)}</span>"


def _registration_notify(payload: dict[str, Any]) -> None:
    """Best-effort notification for new school self-registrations."""
    webhook = REGISTRATION_WEBHOOK or os.getenv("JOBRADAR_APPROVE_NOTIFY_WEBHOOK") or os.getenv("JOBRADAR_NOTIFY_WEBHOOK_URL")
    if not webhook:
        return
    import urllib.request as _ur, json as _j
    data = {
        "event": "school_registration",
        "to_email": "kontakt@kibrueg.de",
        "subject": f"Neue JobRadar Schul-Anmeldung: {payload.get('name','')}",
        **payload,
    }
    try:
        req = _ur.Request(webhook, data=_j.dumps(data).encode("utf-8"), headers={"Content-Type": "application/json"}, method="POST")
        _ur.urlopen(req, timeout=10).read(256)
    except Exception:
        # Registration must never fail because the notification hook is unavailable.
        pass


@app.get("/register", response_class=HTMLResponse)
def school_register_form(request: Request):
    init_db()
    return HTMLResponse("""<!doctype html><html lang='de'><head><meta charset='utf-8'>
<meta name='viewport' content='width=device-width,initial-scale=1'><title>Schule anmelden · JobRadar</title>
<style>
:root{color-scheme:light;--ink:#172033;--muted:#64748b;--line:#dbe3ef;--brand:#2563eb;--bg:#f8fafc}
*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,Segoe UI,Arial,sans-serif;background:var(--bg);color:var(--ink)}
.hero{background:linear-gradient(135deg,#0f172a,#1e3a8a);color:white;padding:44px 0}.wrap{max-width:860px;margin:0 auto;padding:0 20px}
.badge{display:inline-flex;border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:6px 10px;color:#dbeafe;font-size:12px;font-weight:700}
h1{font-size:clamp(32px,5vw,52px);line-height:1.02;margin:18px 0 12px;letter-spacing:-.04em}p{line-height:1.6}.muted{color:var(--muted)}
.card{background:white;border:1px solid var(--line);border-radius:18px;padding:24px;margin:24px auto;box-shadow:0 12px 28px rgba(15,23,42,.06)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.wide{grid-column:1/-1}label{display:block;font-size:13px;font-weight:700;color:#334155}
input,select,textarea{width:100%;box-sizing:border-box;border:1px solid #dbe3ef;border-radius:12px;padding:11px 12px;font:inherit;margin-top:6px;background:#fff}textarea{resize:vertical}
button{background:#2563eb;color:#fff;border:0;border-radius:12px;padding:12px 18px;font-weight:800;cursor:pointer}.note{background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:14px;color:#1e40af}
@media(max-width:720px){.grid{grid-template-columns:1fr}.wide{grid-column:auto}}
</style></head><body><header class='hero'><div class='wrap'><span class='badge'>JobRadar · Schul-Anmeldung</span><h1>Arbeitsmarkt-Radar fuer Ihre Weiterbildung</h1><p>Reichen Sie Ihre Schule ein. Wir pruefen den Pilotzugang und melden uns innerhalb von 24 Stunden.</p></div></header>
<main class='wrap'><section class='card'><h2>Schule anmelden</h2><p class='muted'>Keine Teilnehmerdaten erforderlich. Wir benoetigen nur Kontaktdaten fuer die Pilot-Abstimmung.</p>
<form method='post' action='/register' class='grid'>
<label>Schulname<input name='name' required maxlength='160' autocomplete='organization'></label>
<label>Ansprechpartner<input name='contact_person' required maxlength='160' autocomplete='name'></label>
<label>E-Mail<input name='email' type='email' required maxlength='180' autocomplete='email'></label>
<label>Plan<select name='plan'><option value='pilot'>Pilot</option><option value='basic'>Basic</option><option value='pro'>Pro</option></select></label>
<label class='wide'>Nachricht<textarea name='message' rows='5' maxlength='2000' placeholder='Welche Kurse / Standorte / Zielrollen sind fuer Sie relevant?'></textarea></label>
<div class='wide note'>Nach dem Absenden speichern wir die Anfrage intern und kontaktieren Sie unter der angegebenen E-Mail-Adresse.</div>
<div class='wide' style='text-align:right'><button>Absenden</button></div>
</form></section></main></body></html>""")


@app.post("/register", response_class=HTMLResponse)
def school_register_submit(
    name: str = Form(...), contact_person: str = Form(...), email: str = Form(...),
    plan: str = Form("pilot"), message: str = Form(""),
):
    init_db()
    clean_name = name.strip()
    clean_contact = contact_person.strip()
    clean_email = email.strip().lower()
    clean_plan = plan.strip().lower()
    if clean_plan not in {"pilot", "basic", "pro"}:
        clean_plan = "pilot"
    if not clean_name or not clean_contact or "@" not in clean_email:
        raise HTTPException(400, "valid school, contact person and email required")
    reg_id = exec_sql(
        """INSERT INTO school_registrations(name,contact_person,email,plan,message,created_at,status)
           VALUES(?,?,?,?,?,?, 'pending')""",
        (clean_name[:160], clean_contact[:160], clean_email[:180], clean_plan, message.strip()[:2000], now()),
    )
    _registration_notify({
        "registration_id": reg_id,
        "name": clean_name[:160],
        "contact_person": clean_contact[:160],
        "email": clean_email[:180],
        "plan": clean_plan,
        "message": message.strip()[:2000],
        "admin_url": f"{PUBLIC_BASE_URL}/admin/registrations",
    })
    return HTMLResponse("""<!doctype html><html lang='de'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
<title>Danke · JobRadar</title><style>body{margin:0;font-family:system-ui,Segoe UI,Arial,sans-serif;background:#f8fafc;color:#172033}.wrap{max-width:720px;margin:80px auto;padding:0 20px}.card{background:white;border:1px solid #dbe3ef;border-radius:18px;padding:32px;box-shadow:0 12px 28px rgba(15,23,42,.06)}.ok{display:inline-flex;background:#dcfce7;color:#166534;border-radius:999px;padding:6px 10px;font-weight:800;font-size:12px}a{color:#2563eb}</style></head>
<body><main class='wrap'><section class='card'><span class='ok'>Anfrage erhalten</span><h1>Vielen Dank.</h1><p>Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p><p><a href='/'>Zurueck zur Startseite</a></p></section></main></body></html>""")


@app.get("/admin/registrations", response_class=HTMLResponse)
def admin_registrations_page(request: Request):
    init_db()
    registrations = rows("SELECT * FROM school_registrations ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END, created_at DESC")
    def row(r: dict[str, Any]) -> str:
        actions = ""
        if str(r.get("status") or "pending") == "pending":
            actions = (
                f"<form method='post' action='/admin/registrations/{r['id']}/approve' style='display:inline'><button class='primary small'>Schule anlegen</button></form> "
                f"<form method='post' action='/admin/registrations/{r['id']}/reject' style='display:inline'><button class='small' style='background:#64748b'>Ablehnen</button></form>"
            )
        else:
            actions = "<span class='muted'>abgeschlossen</span>"
        return (
            f"<tr><td><b>{e(r['name'])}</b><br><span>{e(r.get('created_at',''))}</span></td>"
            f"<td>{e(r['contact_person'])}<br><span>{e(r['email'])}</span></td>"
            f"<td>{e(r.get('plan','pilot'))}</td><td>{registration_status_badge(r.get('status'))}</td>"
            f"<td>{e(r.get('message',''))}</td><td>{actions}</td></tr>"
        )
    body = "".join(row(r) for r in registrations) or "<tr><td colspan='6'>Noch keine Anmeldungen.</td></tr>"
    html_doc = f"""<!doctype html><html><head><meta charset='utf-8'><title>Schul-Anmeldungen</title>{admin_style()}</head><body>
{admin_nav()}<main class='wrap'><h1>Schul-Anmeldungen</h1><p class='muted'>Anfragen aus der oeffentlichen /register-Form. Approve legt eine Schule als Lead an; Kurse/Suchprofile werden danach in der Schul-Detailseite gepflegt.</p>
<section class='card'><table><thead><tr><th>Schule</th><th>Kontakt</th><th>Plan</th><th>Status</th><th>Nachricht</th><th>Aktion</th></tr></thead><tbody>{body}</tbody></table></section></main></body></html>"""
    return HTMLResponse(html_doc)


@app.post("/admin/registrations/{registration_id}/approve")
def admin_registration_approve(registration_id: int):
    init_db()
    reg = one("SELECT * FROM school_registrations WHERE id=?", (registration_id,))
    if not reg:
        raise HTTPException(404, "registration not found")
    if reg.get("status") == "approved":
        existing = one("SELECT id FROM schools WHERE name=?", (reg["name"],))
        return Response(status_code=303, headers={"Location": f"/admin/schools/{existing['id']}" if existing else "/admin/registrations"})
    existing = one("SELECT id FROM schools WHERE name=?", (reg["name"].strip(),))
    note = f"Registration #{registration_id}; Ansprechpartner: {reg['contact_person']}; Plan: {reg.get('plan') or 'pilot'}; Nachricht: {reg.get('message') or ''}"
    if existing:
        school_id = int(existing["id"])
        exec_sql("UPDATE schools SET contact_email=COALESCE(NULLIF(contact_email,''),?), note=CASE WHEN COALESCE(note,'')='' THEN ? ELSE note END, updated_at=? WHERE id=?", (reg["email"], note[:1000], now(), school_id))
    else:
        school_id = exec_sql(
            """INSERT INTO schools(name,website,contact_email,status,note,created_at,updated_at,portal_plan,portal_price_eur)
               VALUES(?,?,?,?,?,?,?,?,?)""",
            (reg["name"].strip(), "", reg["email"].strip(), "lead", note[:1000], now(), now(), f"{str(reg.get('plan') or 'pilot').title()} Portal", 49),
        )
    exec_sql("UPDATE school_registrations SET status='approved' WHERE id=?", (registration_id,))
    return Response(status_code=303, headers={"Location": f"/admin/schools/{school_id}"})


@app.post("/admin/registrations/{registration_id}/reject")
def admin_registration_reject(registration_id: int):
    init_db()
    if not one("SELECT id FROM school_registrations WHERE id=?", (registration_id,)):
        raise HTTPException(404, "registration not found")
    exec_sql("UPDATE school_registrations SET status='rejected' WHERE id=?", (registration_id,))
    return Response(status_code=303, headers={"Location": "/admin/registrations"})


@app.get("/admin/schools", response_class=HTMLResponse)
def admin_schools_page(request: Request):
    init_db()
    schools = rows("""SELECT s.*,
                       COUNT(DISTINCT c.id) AS course_count,
                       COUNT(DISTINCT sp.id) AS profile_count
                    FROM schools s
                    LEFT JOIN courses c ON c.school_id=s.id AND c.status<>'archived'
                    LEFT JOIN search_profiles sp ON sp.course_id=c.id
                    GROUP BY s.id
                    ORDER BY CASE s.status WHEN 'active' THEN 0 WHEN 'lead' THEN 1 ELSE 2 END, s.name""")
    def row(school: dict[str, Any]) -> str:
        portal = "aktiv" if int(school.get("portal_enabled") or 0) else "aus"
        price = school.get("portal_price_eur") or ""
        return (
            f"<tr><td><b>{e(school['name'])}</b><br><span>{e(school.get('website',''))}</span></td>"
            f"<td>{e(school.get('contact_email',''))}</td><td>{e(school.get('status',''))}</td>"
            f"<td>{school.get('course_count',0)} / {school.get('profile_count',0)}</td>"
            f"<td>{portal}<br><span>{e(school.get('portal_plan',''))} · {e(price)} EUR</span></td>"
            f"<td><a class='btn small' href='/admin/schools/{school['id']}'>Bearbeiten</a></td></tr>"
        )
    body = "".join(row(s) for s in schools) or "<tr><td colspan='6'>Noch keine Schulen.</td></tr>"
    html_doc = f"""<!doctype html><html><head><meta charset='utf-8'><title>Schulen</title>{admin_style()}</head><body>
{admin_nav()}<main class='wrap'><h1>Schulen</h1><p class='muted'>Neue Schulen ohne SSH/SQLite anlegen, Portal aktivieren und Kurse/Suchprofile pflegen.</p>
<section class='card'><h2>Neue Schule</h2><form method='post' action='/admin/schools' class='grid2'>
<label>Schulname<input name='name' required></label><label>Website<input name='website' placeholder='https://...'></label>
<label>Kontakt E-Mail<input name='contact_email' type='email'></label><label>Status<select name='status'><option>lead</option><option selected>active</option><option>risk</option><option>archived</option></select></label>
<label>Portal Plan<input name='portal_plan' value='Pilot Portal'></label><label>Preis EUR<input name='portal_price_eur' type='number' step='0.01' value='49'></label>
<label class='wide'>Notiz<textarea name='note' rows='3'></textarea></label><label><input type='checkbox' name='portal_enabled' value='1' checked> Portal aktivieren + Token erzeugen</label>
<div class='actions wide'><button class='primary'>Schule anlegen</button></div></form></section>
<section class='card'><h2>Bestehende Schulen</h2><table><thead><tr><th>Schule</th><th>Email</th><th>Status</th><th>Kurse/Profile</th><th>Portal</th><th></th></tr></thead><tbody>{body}</tbody></table></section>
</main></body></html>"""
    return HTMLResponse(html_doc)


@app.post("/admin/schools")
def admin_create_school(
    name: str = Form(...), website: str = Form(""), contact_email: str = Form(""),
    status: str = Form("active"), note: str = Form(""), portal_plan: str = Form("Pilot Portal"),
    portal_price_eur: float = Form(49), portal_enabled: str | None = Form(default=None),
):
    init_db()
    clean_name = name.strip()
    if not clean_name:
        raise HTTPException(400, "school name required")
    token = new_portal_token() if portal_enabled else ""
    sid = exec_sql(
        """INSERT INTO schools(name,website,contact_email,status,note,created_at,updated_at,portal_token,portal_enabled,portal_plan,portal_price_eur)
           VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
        (clean_name, website.strip(), contact_email.strip(), status.strip(), note.strip(), now(), now(), token, 1 if portal_enabled else 0, portal_plan.strip(), portal_price_eur),
    )
    return Response(status_code=303, headers={"Location": f"/admin/schools/{sid}"})


@app.get("/admin/schools/{school_id}", response_class=HTMLResponse)
def admin_school_detail(school_id: int, request: Request):
    init_db()
    school = one("SELECT * FROM schools WHERE id=?", (school_id,))
    if not school:
        raise HTTPException(404, "school not found")
    courses = rows("""SELECT c.*, sp.id AS profile_id, sp.access_mode, sp.target_titles, sp.skills, sp.location_rules,
                            sp.language_rules, sp.exclude_titles, sp.source_queries, sp.coach_note, sp.active AS profile_active
                     FROM courses c LEFT JOIN search_profiles sp ON sp.course_id=c.id
                     WHERE c.school_id=? ORDER BY CASE c.status WHEN 'archived' THEN 1 ELSE 0 END, c.name""", (school_id,))
    portal_url = ""
    if school.get("portal_token"):
        portal_url = "https://kibrueg.de/school/" + str(school["portal_token"])
    def course_card(c: dict[str, Any]) -> str:
        checked = "checked" if int(c.get("profile_active") or 0) else ""
        return f"""<section class='mini'><h3>{e(c['name'])}</h3><form method='post' action='/admin/courses/{c['id']}' class='grid2'>
<input type='hidden' name='school_id' value='{school_id}'><label>Kursname<input name='name' value='{e(c['name'])}' required></label><label>Status<select name='status'>{status_options(c.get('status'))}</select></label>
<label>Funding<input name='funding' value='{e(c.get('funding',''))}'></label><label>Remote<input name='remote' value='{e(c.get('remote',''))}'></label>
<label>Fit Score<input name='fit_score' type='number' min='0' max='100' value='{e(c.get('fit_score',0))}'></label>
<div class='actions'><button>Kurs speichern</button></div></form>
<form method='post' action='/admin/profiles/{c.get('profile_id') or 0}' class='grid2 profile'>
<input type='hidden' name='course_id' value='{c['id']}'><label class='wide'>Target titles<textarea name='target_titles' rows='4'>{e(c.get('target_titles',''))}</textarea></label>
<label class='wide'>Skills<textarea name='skills' rows='3'>{e(c.get('skills',''))}</textarea></label>
<label>Location rules<textarea name='location_rules' rows='3'>{e(c.get('location_rules',''))}</textarea></label><label>Language rules<textarea name='language_rules' rows='3'>{e(c.get('language_rules',''))}</textarea></label>
<label>Exclude titles<textarea name='exclude_titles' rows='3'>{e(c.get('exclude_titles',''))}</textarea></label><label>Source queries<textarea name='source_queries' rows='4'>{e(c.get('source_queries',''))}</textarea></label>
<label class='wide'>Coach note<textarea name='coach_note' rows='3'>{e(c.get('coach_note',''))}</textarea></label><label><input type='checkbox' name='active' value='1' {checked}> Suchprofil aktiv</label>
<div class='actions wide'><button>Suchprofil speichern</button></div></form></section>"""
    course_blocks = "".join(course_card(c) for c in courses) or "<p class='muted'>Noch keine Kurse.</p>"
    portal_anchor = ("<a href=\"" + e(portal_url) + "\" target=\"_blank\">" + e(portal_url) + "</a>") if portal_url else "noch kein Token"
    html_doc = f"""<!doctype html><html><head><meta charset='utf-8'><title>{e(school['name'])}</title>{admin_style()}</head><body>
{admin_nav()}<main class='wrap'><p><a href='/admin/schools'>← Schulen</a></p><h1>{e(school['name'])}</h1>
<section class='card'><h2>Schule bearbeiten</h2><form method='post' action='/admin/schools/{school_id}' class='grid2'>
<label>Schulname<input name='name' value='{e(school['name'])}' required></label><label>Website<input name='website' value='{e(school.get('website',''))}'></label>
<label>Kontakt E-Mail<input name='contact_email' type='email' value='{e(school.get('contact_email',''))}'></label><label>Status<select name='status'>{status_options(school.get('status'))}</select></label>
<label>Portal Plan<input name='portal_plan' value='{e(school.get('portal_plan','Pilot Portal'))}'></label><label>Preis EUR<input name='portal_price_eur' type='number' step='0.01' value='{e(school.get('portal_price_eur') or 49)}'></label>
<label>Portal valid until<input name='portal_valid_until' value='{e(school.get('portal_valid_until',''))}'></label><label><input type='checkbox' name='portal_enabled' value='1' {'checked' if int(school.get('portal_enabled') or 0) else ''}> Portal aktiv</label>
<label class='wide'>Portal note<textarea name='portal_note' rows='2'>{e(school.get('portal_note',''))}</textarea></label><label class='wide'>Interne Notiz<textarea name='note' rows='3'>{e(school.get('note',''))}</textarea></label>
<div class='actions wide'><button class='primary'>Schule speichern</button></div></form>
<div class='portalbox'><b>Portal-Link:</b> {portal_anchor}
<form method='post' action='/admin/schools/{school_id}/token' style='display:inline'><button class='small'>Token erzeugen/aktivieren</button></form></div></section>
<section class='card'><h2>Neuen Kurs + Suchprofil anlegen</h2><form method='post' action='/admin/courses' class='grid2'>
<input type='hidden' name='school_id' value='{school_id}'><label>Kursname<input name='name' required></label><label>Funding<input name='funding' placeholder='AZAV / Bildungsgutschein'></label>
<label>Remote<input name='remote' value='Remote DE/EU bevorzugt'></label><label>Fit Score<input name='fit_score' type='number' min='0' max='100' value='80'></label>
<label class='wide'>Target titles<textarea name='target_titles' rows='4' placeholder='AI Automation Specialist\nn8n Automation Builder'></textarea></label><label class='wide'>Skills<textarea name='skills' rows='3'></textarea></label>
<label>Location rules<textarea name='location_rules' rows='3'>Remote Germany / EU preferred</textarea></label><label>Language rules<textarea name='language_rules' rows='3'>German/English, junior or entry-level</textarea></label>
<label>Exclude titles<textarea name='exclude_titles' rows='3'>Senior, Lead, Manager, pure sales, on-site only</textarea></label><label>Source queries<textarea name='source_queries' rows='4'></textarea></label>
<label class='wide'>Coach note<textarea name='coach_note' rows='3'></textarea></label><div class='actions wide'><button class='primary'>Kurs + Suchprofil anlegen</button></div></form></section>
<section class='card'><h2>Kurse & Suchprofile</h2>{course_blocks}</section></main></body></html>"""
    return HTMLResponse(html_doc)


@app.post("/admin/schools/{school_id}")
def admin_update_school(
    school_id: int, name: str = Form(...), website: str = Form(""), contact_email: str = Form(""), status: str = Form("active"),
    note: str = Form(""), portal_plan: str = Form("Pilot Portal"), portal_price_eur: float = Form(49), portal_valid_until: str = Form(""),
    portal_note: str = Form(""), portal_enabled: str | None = Form(default=None),
):
    if not one("SELECT id FROM schools WHERE id=?", (school_id,)):
        raise HTTPException(404, "school not found")
    exec_sql("""UPDATE schools SET name=?,website=?,contact_email=?,status=?,note=?,portal_enabled=?,portal_plan=?,portal_price_eur=?,portal_valid_until=?,portal_note=?,updated_at=? WHERE id=?""",
             (name.strip(), website.strip(), contact_email.strip(), status.strip(), note.strip(), 1 if portal_enabled else 0, portal_plan.strip(), portal_price_eur, portal_valid_until.strip(), portal_note.strip(), now(), school_id))
    exec_sql("UPDATE courses SET provider=?,updated_at=? WHERE school_id=?", (name.strip(), now(), school_id))
    return Response(status_code=303, headers={"Location": f"/admin/schools/{school_id}"})


@app.post("/admin/schools/{school_id}/token")
def admin_school_token(school_id: int):
    school = one("SELECT id,portal_token FROM schools WHERE id=?", (school_id,))
    if not school:
        raise HTTPException(404, "school not found")
    token = school.get("portal_token") or new_portal_token()
    exec_sql("UPDATE schools SET portal_token=?,portal_enabled=1,updated_at=? WHERE id=?", (token, now(), school_id))
    return Response(status_code=303, headers={"Location": f"/admin/schools/{school_id}"})


@app.post("/admin/courses")
def admin_create_course(
    school_id: int = Form(...), name: str = Form(...), funding: str = Form(""), remote: str = Form(""), fit_score: int = Form(80),
    target_titles: str = Form(""), skills: str = Form(""), location_rules: str = Form(""), language_rules: str = Form(""),
    exclude_titles: str = Form(""), source_queries: str = Form(""), coach_note: str = Form(""),
):
    school = one("SELECT * FROM schools WHERE id=?", (school_id,))
    if not school or not name.strip():
        raise HTTPException(400, "valid school and course name required")
    cid = exec_sql("INSERT INTO courses(name,school_id,provider,funding,remote,fit_score,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
                   (name.strip(), school_id, school["name"], funding.strip(), remote.strip(), int(fit_score or 0), "active", now(), now()))
    exec_sql("""INSERT INTO search_profiles(course_id,access_mode,target_titles,skills,location_rules,language_rules,exclude_titles,source_queries,coach_note,active,updated_at)
               VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
             (cid, "Internal admin only", target_titles.strip(), skills.strip(), location_rules.strip(), language_rules.strip(), exclude_titles.strip(), source_queries.strip(), coach_note.strip(), 1, now()))
    return Response(status_code=303, headers={"Location": f"/admin/schools/{school_id}"})


@app.post("/admin/courses/{course_id}")
def admin_update_course(course_id: int, school_id: int = Form(...), name: str = Form(...), funding: str = Form(""), remote: str = Form(""), fit_score: int = Form(0), status: str = Form("active")):
    school = one("SELECT * FROM schools WHERE id=?", (school_id,))
    if not school or not one("SELECT id FROM courses WHERE id=?", (course_id,)):
        raise HTTPException(404, "school or course not found")
    exec_sql("UPDATE courses SET name=?,school_id=?,provider=?,funding=?,remote=?,fit_score=?,status=?,updated_at=? WHERE id=?",
             (name.strip(), school_id, school["name"], funding.strip(), remote.strip(), int(fit_score or 0), status.strip(), now(), course_id))
    return Response(status_code=303, headers={"Location": f"/admin/schools/{school_id}"})


@app.post("/admin/profiles/{profile_id}")
def admin_update_profile(profile_id: int, course_id: int = Form(...), target_titles: str = Form(""), skills: str = Form(""), location_rules: str = Form(""), language_rules: str = Form(""), exclude_titles: str = Form(""), source_queries: str = Form(""), coach_note: str = Form(""), active: str | None = Form(default=None)):
    course = one("SELECT c.*, s.id AS school_id FROM courses c LEFT JOIN schools s ON s.id=c.school_id WHERE c.id=?", (course_id,))
    if not course:
        raise HTTPException(404, "course not found")
    existing = one("SELECT id FROM search_profiles WHERE id=?", (profile_id,)) if profile_id else None
    if existing:
        exec_sql("""UPDATE search_profiles SET target_titles=?,skills=?,location_rules=?,language_rules=?,exclude_titles=?,source_queries=?,coach_note=?,active=?,updated_at=? WHERE id=?""",
                 (target_titles.strip(), skills.strip(), location_rules.strip(), language_rules.strip(), exclude_titles.strip(), source_queries.strip(), coach_note.strip(), 1 if active else 0, now(), profile_id))
    else:
        exec_sql("""INSERT INTO search_profiles(course_id,access_mode,target_titles,skills,location_rules,language_rules,exclude_titles,source_queries,coach_note,active,updated_at)
                   VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
                 (course_id, "Internal admin only", target_titles.strip(), skills.strip(), location_rules.strip(), language_rules.strip(), exclude_titles.strip(), source_queries.strip(), coach_note.strip(), 1 if active else 0, now()))
    return Response(status_code=303, headers={"Location": f"/admin/schools/{course.get('school_id') or ''}"})


@app.get("/admin/api/schools/{school_id}/portal-token")
def get_or_create_school_portal_token(school_id: int) -> dict[str, Any]:
    init_db()
    school = one("SELECT id,name,portal_token,portal_enabled FROM schools WHERE id=?", (school_id,))
    if not school:
        raise HTTPException(404, "school not found")
    token = school.get("portal_token") or new_portal_token()
    exec_sql("UPDATE schools SET portal_token=?,portal_enabled=1,updated_at=? WHERE id=?", (token, now(), school_id))
    return {"ok": True, "school_id": school_id, "school": school["name"], "portal_path": f"/school/{token}"}


_SPA_SCHOOL_PATHS = {"login", "dashboard", "jobs", "profile", "reports"}


@app.get("/school/{token}", response_class=HTMLResponse, include_in_schema=False)
def school_portal(token: str) -> HTMLResponse:
    if token in _SPA_SCHOOL_PATHS:
        idx = FRONTEND_DIST / "index.html"
        if idx.exists():
            return HTMLResponse(idx.read_text(encoding="utf-8"), headers={"Cache-Control": "no-cache", "X-Robots-Tag": "noindex"})
        return HTMLResponse("<!doctype html><html><body>App not built</body></html>", status_code=503)
    try:
        data = school_portal_data(token)
    except HTTPException as exc:
        if exc.status_code == 404:
            return HTMLResponse(
                "<!doctype html><html lang='de'><head><meta charset='utf-8'><meta name='robots' content='noindex,nofollow'><title>Portal nicht gefunden</title></head><body><h1>Portal nicht gefunden</h1></body></html>",
                status_code=404,
                headers=portal_headers(),
            )
        raise
    return HTMLResponse(render_school_portal_html(data, token), headers=portal_headers())


@app.get("/school/{token}/report.json", include_in_schema=False)
def school_portal_report_json(token: str) -> Response:
    data = school_portal_data(token)
    return Response(json.dumps(data, ensure_ascii=False, indent=2), media_type="application/json", headers=portal_headers())


@app.get("/school/{token}/report.csv", include_in_schema=False)
def school_portal_report_csv(token: str) -> Response:
    data = school_portal_data(token)
    out = io.StringIO()
    writer = csv.writer(out, delimiter=";")
    writer.writerow(["school", data["school"]["name"], "generated_at", data["generated_at"]])
    writer.writerow(["type", "course", "status", "score", "details"])
    for c in data["courses"]:
        writer.writerow(["course", c["name"], c["status"], c["fit_score"], f"funding={c['funding']} remote={c['remote']}"])
    for l in data["leads"]:
        writer.writerow(["approved_match", l["course_name"], l["status"], l["score"], l["title"]])
    for r in data["reports"]:
        writer.writerow(["report", r.get("report_type"), r.get("status"), "", f"{r.get('period_start')} - {r.get('period_end')}"])
    headers = portal_headers() | {"Content-Disposition": f"attachment; filename={safe_report_name(data['school']['name'])}_portal_report.csv"}
    return Response(out.getvalue(), media_type="text/csv; charset=utf-8", headers=headers)


@app.get("/school/{token}/report.html", response_class=HTMLResponse, include_in_schema=False)
def school_portal_report_html(token: str) -> HTMLResponse:
    data = school_portal_data(token)
    return HTMLResponse(render_school_portal_html(data, token), headers=portal_headers())


@app.get("/api/reports/school/{school_id}")
def api_school_report(school_id: int) -> dict[str, Any]:
    return school_report_data(school_id)


@app.get("/download/school/{school_id}.json")
def download_school_json(school_id: int) -> FileResponse:
    data = school_report_data(school_id)
    path = REPORT_DIR / f"{safe_report_name(data['school']['name'])}_report.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return FileResponse(path, filename=path.name, media_type="application/json")


@app.get("/download/school/{school_id}.csv")
def download_school_csv(school_id: int) -> FileResponse:
    data = school_report_data(school_id)
    path = REPORT_DIR / f"{safe_report_name(data['school']['name'])}_courses_leads.csv"
    with path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(["school", data["school"]["name"], "generated_at", data["generated_at"]])
        writer.writerow([])
        writer.writerow(["type", "course", "status", "score", "details"])
        for c in data["courses"]:
            writer.writerow(["course", c["name"], c["status"], c["fit_score"], f"funding={c['funding']} remote={c['remote']}"])
        for l in data["leads"]:
            writer.writerow(["lead", l["course_name"], l["status"], l["score"], l["title"]])
        for d in data["documents"]:
            writer.writerow(["document", d["course_name"], d["status"], "", d["original_name"]])
    return FileResponse(path, filename=path.name, media_type="text/csv")


@app.get("/download/school/{school_id}.html")
def download_school_html(school_id: int) -> FileResponse:
    data = school_report_data(school_id)
    school = data["school"]
    stats = data["stats"]

    def e(v: Any) -> str:
        return html.escape(str(v or ""))

    course_rows = "".join(f"<tr><td>{e(c['name'])}</td><td>{e(c['funding'])}</td><td>{e(c['remote'])}</td><td>{e(c['status'])}</td><td>{e(c['fit_score'])}</td></tr>" for c in data["courses"])
    lead_rows = "".join(f"<tr><td>{e(l['title'])}</td><td>{e(l['course_name'])}</td><td>{e(l['status'])}</td><td>{e(l['score'])}</td><td>{e(l['missing_evidence'])}</td></tr>" for l in data["leads"])
    doc_rows = "".join(f"<tr><td>{e(d['original_name'])}</td><td>{e(d['course_name'])}</td><td>{e(d['doc_type'])}</td><td>{e(d['status'])}</td></tr>" for d in data["documents"])
    profile_blocks = "".join(f"<section><h3>{e(p['course_name'])}</h3><p><b>Target professions:</b><br>{e(p['target_titles']).replace(chr(10), '<br>')}</p><p><b>Keywords/skills:</b><br>{e(p['skills'])}</p><p><b>Exclusions:</b><br>{e(p['exclude_titles'])}</p><p><b>Source queries:</b><br>{e(p['source_queries']).replace(chr(10), '<br>')}</p></section>" for p in data["profiles"])
    body = f"""<!doctype html><html><head><meta charset='utf-8'><title>JobRadar Report - {e(school['name'])}</title><style>body{{font-family:Arial,sans-serif;margin:32px;color:#172033}}h1{{margin-bottom:0}}.muted{{color:#667}}.kpis{{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0}}.kpi{{border:1px solid #ccd;padding:12px;border-radius:10px}}table{{width:100%;border-collapse:collapse;margin:14px 0}}td,th{{border:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}}th{{background:#eef3ff}}section{{border:1px solid #ddd;border-radius:10px;padding:12px;margin:12px 0}}</style></head><body><h1>JobRadar School Report</h1><p class='muted'>{e(school['name'])} · generated {e(data['generated_at'])}</p><div class='kpis'><div class='kpi'><b>{stats['active_courses']}</b><br>Active courses</div><div class='kpi'><b>{stats['leads']}</b><br>Matched leads</div><div class='kpi'><b>{stats['documents']}</b><br>Documents</div><div class='kpi'><b>{stats['avg_score']}</b><br>Avg score</div></div><h2>Courses</h2><table><tr><th>Course</th><th>Funding</th><th>Remote</th><th>Status</th><th>Fit</th></tr>{course_rows}</table><h2>Matched leads</h2><table><tr><th>Lead</th><th>Course</th><th>Status</th><th>Score</th><th>Missing evidence</th></tr>{lead_rows}</table><h2>Search profiles</h2>{profile_blocks}<h2>Documents</h2><table><tr><th>File</th><th>Course</th><th>Type</th><th>Status</th></tr>{doc_rows}</table></body></html>"""
    path = REPORT_DIR / f"{safe_report_name(school['name'])}_report.html"
    path.write_text(body, encoding="utf-8")
    return FileResponse(path, filename=path.name, media_type="text/html")


@app.get("/download/all-schools.csv")
def download_all_schools_csv() -> FileResponse:
    init_db()
    stats = rows(
        """
        SELECT s.name AS school, s.status,
               COUNT(DISTINCT CASE WHEN c.status<>'archived' THEN c.id END) AS active_courses,
               COUNT(DISTINCT c.id) AS total_courses,
               COUNT(DISTINCT l.id) AS leads,
               COUNT(DISTINCT d.id) AS documents,
               ROUND(COALESCE(AVG(l.score),0),1) AS avg_score
        FROM schools s
        LEFT JOIN courses c ON c.school_id=s.id
        LEFT JOIN leads l ON l.course_id=c.id
        LEFT JOIN documents d ON d.course_id=c.id
        GROUP BY s.id, s.name, s.status
        ORDER BY s.name
        """
    )
    path = REPORT_DIR / "JobRadar_all_schools_stats.csv"
    with path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=["school", "status", "active_courses", "total_courses", "leads", "documents", "avg_score"], delimiter=";")
        writer.writeheader()
        writer.writerows(stats)
    return FileResponse(path, filename=path.name, media_type="text/csv")


@app.get("/api/n8n/search-tasks")
def n8n_search_tasks() -> dict[str, Any]:
    """Read-only config endpoint for a single n8n test workflow.

    n8n should call this first, then process one/few source_queries and POST results
    back to /api/n8n/leads. This avoids duplicating all workflows.
    """
    init_db()
    tasks = rows(
        """
        SELECT sp.id AS profile_id, sp.course_id, c.name AS course_name,
               COALESCE(s.name,c.provider) AS school_name,
               sp.target_titles, sp.skills, sp.location_rules, sp.language_rules,
               sp.exclude_titles, sp.source_queries, sp.coach_note
        FROM search_profiles sp
        JOIN courses c ON c.id=sp.course_id
        LEFT JOIN schools s ON s.id=c.school_id
        WHERE sp.active=1 AND c.status<>'archived'
        ORDER BY school_name, course_name
        """
    )
    return {"ok": True, "mode": "test", "tasks": tasks, "count": len(tasks)}


def ensure_n8n_metric_tables() -> None:
    init_db()
    with db() as con:
        con.executescript(
            """
            CREATE TABLE IF NOT EXISTS source_runs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              workflow_run_id INTEGER DEFAULT 0,
              source_name TEXT NOT NULL,
              source_type TEXT DEFAULT 'source',
              status TEXT DEFAULT 'completed',
              raw_items INTEGER DEFAULT 0,
              normalized_items INTEGER DEFAULT 0,
              duplicate_items INTEGER DEFAULT 0,
              relevant_items INTEGER DEFAULT 0,
              failed_items INTEGER DEFAULT 0,
              success_rate REAL DEFAULT 100,
              quality_score REAL DEFAULT 0,
              risk_level TEXT DEFAULT 'low',
              started_at TEXT NOT NULL,
              finished_at TEXT NOT NULL,
              error_message TEXT DEFAULT ''
            );
            CREATE TABLE IF NOT EXISTS cost_events (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              tool_name TEXT NOT NULL,
              tool_type TEXT DEFAULT 'tool',
              source_name TEXT DEFAULT '',
              workflow_run_id INTEGER DEFAULT 0,
              units REAL DEFAULT 0,
              unit_type TEXT DEFAULT 'request',
              unit_cost REAL DEFAULT 0,
              estimated_cost REAL DEFAULT 0,
              created_at TEXT NOT NULL
            );
            """
        )
        con.commit()


def _as_items(data: dict[str, Any]) -> list[dict[str, Any]]:
    items = data.get("items")
    if items is None:
        items = [data]
    if not isinstance(items, list):
        raise HTTPException(400, "items must be a list")
    return [item for item in items if isinstance(item, dict)]


@app.get("/api/n8n/status")
def n8n_status() -> dict[str, Any]:
    ensure_n8n_metric_tables()
    summary = one(
        """
        SELECT
          (SELECT COUNT(*) FROM workflow_runs) workflow_runs,
          (SELECT COUNT(*) FROM source_runs) source_runs,
          (SELECT COUNT(*) FROM cost_events) cost_events,
          (SELECT COUNT(*) FROM leads) leads
        """
    ) or {}
    latest = rows("SELECT * FROM workflow_runs ORDER BY created_at DESC LIMIT 5")
    return {"ok": True, "summary": summary, "latest_runs": latest}


@app.post("/api/n8n/workflow-runs")
async def n8n_workflow_runs(request: Request) -> dict[str, Any]:
    ensure_n8n_metric_tables()
    data = await request.json()
    run_id = exec_sql(
        "INSERT INTO workflow_runs(workflow_name,run_mode,status,input_count,output_count,note,created_at) VALUES(?,?,?,?,?,?,?)",
        (
            (data.get("workflow_name") or "JobRadar n8n workflow").strip(),
            (data.get("run_mode") or "test").strip(),
            (data.get("status") or "completed").strip(),
            int(data.get("input_count") or 0),
            int(data.get("output_count") or 0),
            (data.get("note") or "Imported from n8n.").strip(),
            data.get("created_at") or now(),
        ),
    )
    return {"ok": True, "run_id": run_id}


@app.post("/api/n8n/source-runs")
async def n8n_source_runs(request: Request) -> dict[str, Any]:
    ensure_n8n_metric_tables()
    data = await request.json()
    inserted = 0
    for item in _as_items(data):
        source_name = (item.get("source_name") or item.get("source") or "n8n source").strip()
        if not source_name:
            continue
        raw_items = int(item.get("raw_items") or item.get("raw") or 0)
        relevant_items = int(item.get("relevant_items") or item.get("relevant") or 0)
        failed_items = int(item.get("failed_items") or item.get("failed") or 0)
        success_rate = float(item.get("success_rate") or (100 if failed_items == 0 else max(0, 100 - failed_items * 10)))
        exec_sql(
            """INSERT INTO source_runs(workflow_run_id,source_name,source_type,status,raw_items,normalized_items,duplicate_items,relevant_items,failed_items,success_rate,quality_score,risk_level,started_at,finished_at,error_message)
               VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                int(item.get("workflow_run_id") or data.get("workflow_run_id") or 0),
                source_name,
                (item.get("source_type") or "job_source").strip(),
                (item.get("status") or "completed").strip(),
                raw_items,
                int(item.get("normalized_items") or item.get("normalized") or raw_items),
                int(item.get("duplicate_items") or item.get("duplicates") or 0),
                relevant_items,
                failed_items,
                success_rate,
                float(item.get("quality_score") or item.get("quality") or 0),
                (item.get("risk_level") or "low").strip(),
                item.get("started_at") or now(),
                item.get("finished_at") or now(),
                (item.get("error_message") or "").strip(),
            ),
        )
        inserted += 1
    return {"ok": True, "inserted": inserted}


@app.post("/api/n8n/cost-events")
async def n8n_cost_events(request: Request) -> dict[str, Any]:
    ensure_n8n_metric_tables()
    data = await request.json()
    inserted = 0
    total_cost = 0.0
    for item in _as_items(data):
        tool_name = (item.get("tool_name") or item.get("tool") or "n8n tool").strip()
        if not tool_name:
            continue
        units = float(item.get("units") or 0)
        unit_cost = float(item.get("unit_cost") or 0)
        estimated_cost = float(item.get("estimated_cost") or item.get("cost") or (units * unit_cost))
        exec_sql(
            "INSERT INTO cost_events(tool_name,tool_type,source_name,workflow_run_id,units,unit_type,unit_cost,estimated_cost,created_at) VALUES(?,?,?,?,?,?,?,?,?)",
            (
                tool_name,
                (item.get("tool_type") or "api").strip(),
                (item.get("source_name") or item.get("source") or "").strip(),
                int(item.get("workflow_run_id") or data.get("workflow_run_id") or 0),
                units,
                (item.get("unit_type") or "request").strip(),
                unit_cost,
                estimated_cost,
                item.get("created_at") or now(),
            ),
        )
        inserted += 1
        total_cost += estimated_cost
    return {"ok": True, "inserted": inserted, "estimated_cost": round(total_cost, 6)}


@app.post("/api/n8n/leads")
async def n8n_ingest_leads(request: Request) -> dict[str, Any]:
    """Ingest normalized test leads from one n8n workflow.

    Expected payload:
    {"workflow_name":"JobRadar Test", "items":[{"course_id":1,"title":"...","provider":"...","status":"Candidate","score":80,"source_url":"...","why_fit":"..."}]}
    """
    data = await request.json()
    workflow_name = (data.get("workflow_name") or "JobRadar n8n test workflow").strip()
    items = data.get("items") or []
    if not isinstance(items, list):
        raise HTTPException(400, "items must be a list")
    inserted = 0
    skipped = 0
    for item in items:
        course_id = int(item.get("course_id") or 0)
        title = (item.get("title") or "").strip()
        if not course_id or not title or not one("SELECT id FROM courses WHERE id=?", (course_id,)):
            skipped += 1
            continue
        provider = (item.get("provider") or item.get("company") or "n8n test source").strip()
        status = (item.get("status") or "Candidate").strip()
        score = int(item.get("score") or 0)
        source_url = (item.get("source_url") or item.get("url") or "").strip()
        why_fit = (item.get("why_fit") or item.get("summary") or "Imported from n8n test workflow.").strip()
        missing = (item.get("missing_evidence") or "Needs human QA/citation check.").strip()
        risks = (item.get("risks") or "Test import; verify before client report.").strip()
        exec_sql(
            """INSERT INTO leads(course_id,title,provider,status,score,cost,why_fit,missing_evidence,risks,sources,email_draft,updated_at)
               VALUES(?,?,?,?,?,?,?,?,?,?,?,?)""",
            (course_id, title, provider, status, score, "n8n", why_fit, missing, risks, source_url, "", now()),
        )
        inserted += 1
    run_id = exec_sql(
        "INSERT INTO workflow_runs(workflow_name,run_mode,status,input_count,output_count,note,created_at) VALUES(?,?,?,?,?,?,?)",
        (workflow_name, data.get("run_mode", "test"), "completed", len(items), inserted, f"skipped={skipped}", now()),
    )
    return {"ok": True, "inserted": inserted, "skipped": skipped, "run_id": run_id}


@app.get("/api/n8n/runs")
def n8n_runs() -> dict[str, Any]:
    init_db()
    return {"ok": True, "runs": rows("SELECT * FROM workflow_runs ORDER BY created_at DESC LIMIT 50")}


@app.get("/download/db")
def download_db() -> FileResponse:
    init_db()
    return FileResponse(DB_PATH, filename="jobradar.sqlite3")


from ceo_metrics import register_ceo_routes
register_ceo_routes(app, DB_PATH, REPORT_DIR, init_db)


# ── QA Review Interface ───────────────────────────────────────────────────────

_QA_CSS = """
<style>
body{font-family:system-ui,sans-serif;margin:0;background:#f8fafc;color:#1e293b}
.header{background:#0f172a;color:#fff;padding:16px 24px;display:flex;align-items:center;gap:12px}
.header h1{margin:0;font-size:18px;font-weight:600}
.badge{background:#334155;color:#94a3b8;padding:3px 10px;border-radius:99px;font-size:12px}
.container{max-width:1200px;margin:24px auto;padding:0 20px}
.stats{display:flex;gap:12px;margin-bottom:20px}
.stat{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px 20px;flex:1;text-align:center}
.stat-n{font-size:28px;font-weight:700;color:#0f172a}
.stat-l{font-size:12px;color:#64748b;margin-top:2px}
table{width:100%;background:#fff;border-radius:12px;border:1px solid #e2e8f0;border-collapse:collapse;overflow:hidden}
th{background:#f1f5f9;padding:10px 14px;text-align:left;font-size:12px;font-weight:600;color:#475569;border-bottom:1px solid #e2e8f0}
td{padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;vertical-align:top}
tr:last-child td{border-bottom:none}
.score{display:inline-block;padding:2px 8px;border-radius:6px;font-weight:700;font-size:12px}
.s-high{background:#dcfce7;color:#166534}
.s-mid{background:#fef9c3;color:#854d0e}
.s-low{background:#fee2e2;color:#991b1b}
.btn{display:inline-block;padding:5px 12px;border-radius:6px;border:none;cursor:pointer;font-size:12px;font-weight:600}
.btn-approve{background:#22c55e;color:#fff}
.btn-reject{background:#ef4444;color:#fff}
.btn-approve:hover{background:#16a34a}
.btn-reject:hover{background:#dc2626}
form{display:inline}
.reason{font-size:11px;color:#64748b;margin-top:4px}
select{font-size:12px;padding:3px 6px;border:1px solid #cbd5e1;border-radius:6px;margin-left:4px}
.empty{text-align:center;padding:48px;color:#94a3b8}
a.back{color:#94a3b8;text-decoration:none;font-size:13px}
a.back:hover{color:#fff}
</style>
"""

_REJECT_REASONS = [
    "too_senior", "too_junior", "wrong_language", "location_mismatch",
    "wrong_domain", "expired", "duplicate", "low_quality_listing",
    "requires_degree", "requires_experience", "salary_mismatch", "other",
]

@app.get("/qa", response_class=HTMLResponse, include_in_schema=False)
def qa_index():
    try:
        pending = pg_rows(
            "SELECT id, school, course, job_title, company, location, work_mode, "
            "fit_score, fit_reason, matched_skills, source_url, created_at "
            "FROM v_qa_needs_review LIMIT 100"
        )
        approved = pg_rows("SELECT COUNT(*) AS n FROM job_matches WHERE status='approved'")
        rejected = pg_rows("SELECT COUNT(*) AS n FROM job_matches WHERE status='rejected'")
        n_app = approved[0]["n"] if approved else 0
        n_rej = rejected[0]["n"] if rejected else 0
    except Exception as exc:
        return HTMLResponse(f"<pre>Postgres not available: {exc}</pre>", status_code=503)

    def score_cls(s):
        if s >= 75: return "s-high"
        if s >= 55: return "s-mid"
        return "s-low"

    rows_html = ""
    for r in pending:
        skills = ", ".join(json.loads(r["matched_skills"]) if isinstance(r["matched_skills"], str) else (r["matched_skills"] or []))
        rid = r["id"]
        reason_opts = "".join(f'<option value="{x}">{x}</option>' for x in _REJECT_REASONS)
        rows_html += f"""
        <tr>
          <td><b>{html.escape(r['job_title'] or '')}</b><br>
              <span style="color:#64748b">{html.escape(r['company'] or '')} · {html.escape(r['location'] or '')}</span>
              {'<br><a href="' + html.escape(r['source_url']) + '" target="_blank" style="font-size:11px;color:#3b82f6">Stellenanzeige</a>' if r.get('source_url') else ''}
          </td>
          <td style="white-space:nowrap">{html.escape(r['course'] or '')}</td>
          <td><span class="score {score_cls(r['fit_score'] or 0)}">{r['fit_score']}</span></td>
          <td style="font-size:12px;max-width:200px">{html.escape(r['fit_reason'] or '')}<br>
              <span style="color:#22c55e">+ {html.escape(skills)}</span></td>
          <td>
            <form method="post" action="/api/qa/{rid}/approve">
              <button class="btn btn-approve" type="submit">Approve</button>
            </form>
            <form method="post" action="/api/qa/{rid}/reject" style="margin-top:4px">
              <select name="reason">{reason_opts}</select>
              <button class="btn btn-reject" type="submit">Reject</button>
            </form>
          </td>
        </tr>"""

    empty = '<tr><td colspan="5" class="empty">Keine offenen Reviews — alle Stellen bearbeitet.</td></tr>' if not pending else ""

    return HTMLResponse(f"""<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">
<title>JobRadar QA</title>{_QA_CSS}</head><body>
<div class="header">
  <div>
    <h1>&#127919; JobRadar QA Review</h1>
    <a class="back" href="/admin">&#8592; Admin Dashboard</a>
  </div>
  <span class="badge">{len(pending)} offen</span>
</div>
<div class="container">
  <div class="stats">
    <div class="stat"><div class="stat-n">{len(pending)}</div><div class="stat-l">Offen (fit &ge;55)</div></div>
    <div class="stat"><div class="stat-n" style="color:#22c55e">{n_app}</div><div class="stat-l">Approved</div></div>
    <div class="stat"><div class="stat-n" style="color:#ef4444">{n_rej}</div><div class="stat-l">Rejected</div></div>
  </div>
  <table>
    <thead><tr><th>Stelle</th><th>Kurs</th><th>Score</th><th>Matching</th><th>Aktion</th></tr></thead>
    <tbody>{rows_html}{empty}</tbody>
  </table>
</div></body></html>""")


@app.post("/api/qa/{match_id}/approve", include_in_schema=False)
def qa_approve(match_id: str):
    try:
        pg_exec(
            "UPDATE job_matches SET status='approved', reviewed=true WHERE id=%s",
            (match_id,)
        )
    except Exception as exc:
        raise HTTPException(500, str(exc))
    from fastapi.responses import RedirectResponse
    return RedirectResponse("/qa", status_code=303)


@app.post("/api/qa/{match_id}/reject", include_in_schema=False)
async def qa_reject(match_id: str, request: Request):
    form = await request.form()
    reason = form.get("reason", "other")
    if reason not in _REJECT_REASONS:
        reason = "other"
    try:
        pg_exec(
            "UPDATE job_matches SET status='rejected', reviewed=true, reject_reason=%s WHERE id=%s",
            (reason, match_id)
        )
    except Exception as exc:
        raise HTTPException(500, str(exc))
    from fastapi.responses import RedirectResponse
    return RedirectResponse("/qa", status_code=303)


@app.post("/api/school/login")
async def school_login(request: Request):
    body = await request.json()
    email = (body.get("email") or "").strip().lower()
    password = (body.get("password") or "").strip()
    if not email:
        raise HTTPException(400, "email required")
    school = one(
        """SELECT id,name,contact_email,portal_token,portal_enabled,portal_plan,portal_password
             FROM schools WHERE lower(contact_email)=? AND status<>'archived'""",
        (email,),
    )
    if not school or not school.get("portal_enabled"):
        raise HTTPException(401, "Kein aktives Portal fuer diese E-Mail-Adresse")
    stored_hash = school.get("portal_password") or ""
    if stored_hash:
        if not password or not pwd_context.verify(password, stored_hash):
            raise HTTPException(401, "Passwort falsch")
    return {
        "token": school["portal_token"],
        "school_name": school["name"],
        "plan": school.get("portal_plan") or "Pilot",
    }


@app.post("/api/schools/{school_id}/set-password")
async def set_school_password(school_id: int, request: Request):
    data = await request.json()
    plain = (data.get("password") or "").strip()
    if not plain:
        exec_sql("UPDATE schools SET portal_password='',updated_at=? WHERE id=?", (now(), school_id))
        return {"ok": True, "message": "Passwort entfernt"}
    if len(plain) < 6:
        raise HTTPException(400, "Passwort muss mindestens 6 Zeichen haben")
    hashed = pwd_context.hash(plain)
    exec_sql("UPDATE schools SET portal_password=?,updated_at=? WHERE id=?", (hashed, now(), school_id))
    return {"ok": True, "message": "Passwort gesetzt"}


@app.get("/api/school/me")
async def school_me(request: Request):
    school_id = int(request.state.school["id"])
    s = one("SELECT id,name,contact_email,portal_plan,search_profiles FROM schools WHERE id=?", (school_id,))
    if s:
        return dict(s)
    return dict(request.state.school)


@app.post("/api/school/profile")
async def school_profile_update(request: Request):
    school_id = int(request.state.school["id"])
    body = await request.json()
    sp = body.get("search_profiles", "")
    exec_sql("UPDATE schools SET search_profiles=? WHERE id=?", (sp, school_id))
    return {"ok": True}


@app.get("/api/school/dashboard")
async def school_dashboard(request: Request):
    school_id = int(request.state.school["id"])
    total = (one("SELECT COUNT(*) AS c FROM job_assignments WHERE school_id=?", (school_id,)) or {}).get("c", 0)
    week = (one(
        """SELECT COUNT(*) AS c FROM job_assignments ja JOIN leads l ON l.id=ja.lead_id
             WHERE ja.school_id=? AND l.updated_at >= datetime('now','-7 days')""",
        (school_id,),
    ) or {}).get("c", 0)
    pending = (one(
        """SELECT COUNT(*) AS c FROM job_assignments ja JOIN leads l ON l.id=ja.lead_id
             WHERE ja.school_id=? AND COALESCE(l.school_status,'new')='new'""",
        (school_id,),
    ) or {}).get("c", 0)
    avg_row = one(
        "SELECT ROUND(AVG(l.score),1) AS a FROM job_assignments ja JOIN leads l ON l.id=ja.lead_id WHERE ja.school_id=? AND l.score>0",
        (school_id,),
    )
    recent = rows(
        """SELECT l.id,l.title,l.provider,l.score,COALESCE(l.school_status,'new') AS school_status,l.updated_at
             FROM job_assignments ja JOIN leads l ON l.id=ja.lead_id
             WHERE ja.school_id=? ORDER BY l.updated_at DESC LIMIT 5""",
        (school_id,),
    )
    return {
        "kpi": {
            "total": total,
            "week": week,
            "pending": pending,
            "avg_score": avg_row["a"] if avg_row else 0,
        },
        "recent_leads": recent,
    }


@app.get("/api/school/jobs")
async def school_jobs(
    request: Request,
    status: str = "all",
    q: str = "",
    page: int = 1,
    per_page: int = 20,
):
    school_id = int(request.state.school["id"])
    where = "ja.school_id=?"
    params: list = [school_id]
    if status != "all":
        where += " AND COALESCE(l.school_status,'new')=?"
        params.append(status)
    if q:
        where += " AND (l.title LIKE ? OR l.provider LIKE ?)"
        params.extend([f"%{q}%", f"%{q}%"])
    total = (one(
        f"SELECT COUNT(*) AS c FROM job_assignments ja JOIN leads l ON l.id=ja.lead_id WHERE {where}",
        tuple(params),
    ) or {}).get("c", 0)
    offset = (page - 1) * per_page
    items = rows(
        f"""SELECT l.id,l.title,l.provider,l.score,COALESCE(l.school_status,'new') AS school_status,
                   l.why_fit,l.updated_at,l.sources
              FROM job_assignments ja JOIN leads l ON l.id=ja.lead_id
             WHERE {where}
             ORDER BY l.updated_at DESC LIMIT ? OFFSET ?""",
        tuple(params) + (per_page, offset),
    )
    return {"total": total, "page": page, "per_page": per_page, "items": items}


@app.get("/api/school/jobs/{lead_id}")
async def school_job_detail(request: Request, lead_id: int):
    school_id = int(request.state.school["id"])
    lead = one(
        """SELECT l.id,l.title,l.provider,l.score,COALESCE(l.school_status,'new') AS school_status,
                  l.why_fit,l.missing_evidence,l.risks,l.sources,l.school_note,l.updated_at
             FROM job_assignments ja JOIN leads l ON l.id=ja.lead_id
            WHERE ja.school_id=? AND l.id=?""",
        (school_id, lead_id),
    )
    if not lead:
        raise HTTPException(404, "not found")
    return lead


@app.post("/api/school/jobs/{lead_id}/status")
async def school_job_status(request: Request, lead_id: int):
    school_id = int(request.state.school["id"])
    body = await request.json()
    status = body.get("status", "")
    note = body.get("note", "")
    if status not in ("new", "saved", "dismissed"):
        raise HTTPException(400, "status must be new|saved|dismissed")
    if not one("SELECT 1 AS x FROM job_assignments WHERE school_id=? AND lead_id=?", (school_id, lead_id)):
        raise HTTPException(404, "not found")
    exec_sql(
        "UPDATE leads SET school_status=?, school_note=?, updated_at=? WHERE id=?",
        (status, note, now(), lead_id),
    )
    return {"ok": True}


@app.get("/{full_path:path}", include_in_schema=False)
def serve_react_app(full_path: str):
    """Serve React SPA routes after all API/download routes are registered.

    API, download, uploads and OpenAPI paths intentionally stay backend-owned.
    """
    backend_prefixes = ("api/", "download/", "uploads/", "docs", "redoc", "openapi.json")
    if full_path.startswith(backend_prefixes):
        raise HTTPException(status_code=404, detail="Not found")

    react_index = FRONTEND_DIST / "index.html"
    if react_index.exists():
        return FileResponse(react_index)

    raise HTTPException(status_code=404, detail="Frontend build not found. Run sync_frontend_from_react.bat first.")


# ???????????????????????????????????????????????????????????????????????????????
# SCHOOL PORTAL API  /api/school/*
# ???????????????????????????????????????????????????????????????????????????????

