"""
sync_jobs.py — pull recent KI/AI/Automatisierung jobs from Postgres jobradar
into the SQLite school portal DB as leads, and assign them to all enabled schools.

Run:  python3 sync_jobs.py [--days N]
Env:  POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB_JOBRADAR, POSTGRES_USER, POSTGRES_PASSWORD
Container: docker exec jobradar-admin python3 /app/sync_jobs.py
"""
import os
import sqlite3
import argparse
from datetime import datetime, timezone
from pathlib import Path

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary", "-q"])
    import psycopg2
    import psycopg2.extras

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "jobradar.sqlite3"

KEYWORDS = [
    "KI", "AI", "Künstliche Intelligenz", "Artificial Intelligence",
    "Automatisierung", "Automation", "n8n", "Make.com", "Zapier",
    "Data Analyst", "Data Engineer", "Data Scientist", "Machine Learning",
    "Python", "Workflow", "RPA", "Process Automation", "LLM",
    "ChatBot", "NLP", "Digitalisierung",
]


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def get_pg_dsn() -> str:
    host = os.environ.get("POSTGRES_HOST", "postgres")
    port = os.environ.get("POSTGRES_PORT", "5432")
    dbname = os.environ.get("POSTGRES_DB_JOBRADAR", "jobradar")
    user = os.environ.get("POSTGRES_USER", "hub")
    password = os.environ.get("POSTGRES_PASSWORD", "")
    return f"host={host} port={port} dbname={dbname} user={user} password={password}"


def build_pg_query(days: int) -> tuple:
    kw_clauses = " OR ".join(["LOWER(job_title) LIKE %s"] * len(KEYWORDS))
    params = [f"%{kw.lower()}%" for kw in KEYWORDS]
    sql = f"""
        SELECT
            j.id::text        AS job_id,
            job_title         AS title,
            COALESCE(c.name, j.company_id) AS provider,
            COALESCE(j.location, '')       AS location,
            COALESCE(j.work_mode::text, '') AS work_mode,
            COALESCE(j.summary, '')        AS why_fit,
            j.source_url                   AS sources,
            j.created_at
        FROM jobs j
        LEFT JOIN companies c ON c.company_id = j.company_id
        WHERE ({kw_clauses})
          AND j.created_at >= NOW() - INTERVAL '{days} days'
        ORDER BY j.created_at DESC
        LIMIT 500
    """
    return sql, params


def sync(days: int = 30) -> dict:
    pg = psycopg2.connect(get_pg_dsn())
    pg.cursor_factory = psycopg2.extras.RealDictCursor
    cur = pg.cursor()
    sql, params = build_pg_query(days)
    cur.execute(sql, params)
    pg_rows = cur.fetchall()
    pg.close()

    if not pg_rows:
        return {"fetched": 0, "inserted": 0, "assigned": 0}

    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row

    cols = {r[1] for r in con.execute("PRAGMA table_info(leads)")}
    if "jobradar_job_id" not in cols:
        con.execute("ALTER TABLE leads ADD COLUMN jobradar_job_id TEXT DEFAULT ''")

    existing = {r[0] for r in con.execute("SELECT jobradar_job_id FROM leads WHERE jobradar_job_id != ''")}

    inserted = 0
    new_lead_ids = []
    for row in pg_rows:
        jid = row["job_id"]
        if jid in existing:
            continue
        title_lower = (row["title"] or "").lower()
        hits = sum(1 for k in KEYWORDS if k.lower() in title_lower)
        score = min(95, 50 + hits * 8)

        cur2 = con.execute(
            """INSERT INTO leads(title, provider, status, score, why_fit, sources, jobradar_job_id, updated_at)
               VALUES(?,?,?,?,?,?,?,?)""",
            (
                row["title"] or "",
                row["provider"] or "",
                "New",
                score,
                (row["why_fit"] or "").strip()[:500],
                row["sources"] or "",
                jid,
                now(),
            ),
        )
        new_lead_ids.append(cur2.lastrowid)
        inserted += 1

    con.commit()

    enabled_schools = [r[0] for r in con.execute("SELECT id FROM schools WHERE portal_enabled=1")]
    assigned = 0
    for sid in enabled_schools:
        existing_assignments = {r[0] for r in con.execute(
            "SELECT lead_id FROM job_assignments WHERE school_id=?", (sid,)
        )}
        new_pairs = [(lid, sid) for lid in new_lead_ids if lid not in existing_assignments]
        if new_pairs:
            con.executemany("INSERT INTO job_assignments(lead_id, school_id) VALUES(?,?)", new_pairs)
            assigned += len(new_pairs)

    con.commit()
    con.close()

    return {"fetched": len(pg_rows), "inserted": inserted, "assigned": assigned}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--days", type=int, default=30)
    args = parser.parse_args()

    result = sync(days=args.days)
    print(f"Sync: fetched={result['fetched']}, inserted={result['inserted']}, assigned={result['assigned']}")
