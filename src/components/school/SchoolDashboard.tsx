import { useEffect, useState } from "react";
import { schoolFetch } from "@/hooks/useSchoolAuth";

interface KPI { total: number; week: number; pending: number; avg_score: number; quota_used: number; quota_limit: number }
interface Lead { id: number; title: string; provider: string; score: number; school_status: string; sources: string; updated_at: string }
interface Report { id: number; report_type: string; period_start: string; period_end: string; status: string; created_at: string }
interface DashboardData { kpi: KPI; recent_leads: Lead[] }

function scoreColorClass(s: number) {
  if (s >= 75) return "text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
  if (s >= 50) return "text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400";
  return "text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
}

function KPICard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

const REPORT_ORDER = ["Gesamtbericht", "Jahresbericht", "Monatsbericht", "Wochenbericht", "Tagesbericht"] as const;
const REPORT_ICONS: Record<string, string> = {
  Gesamtbericht: "📊", Jahresbericht: "📅", Monatsbericht: "📆", Wochenbericht: "📋", Tagesbericht: "📄",
};

function ReportAccordion({ reports, onDelete }: { reports: Report[]; onDelete: (id: number) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [downloading, setDownloading] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const downloadById = async (id: number) => {
    setDownloading(id);
    try {
      const r = await schoolFetch(`/api/school/reports/${id}/download`);
      if (!r.ok) return;
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  };

  const deleteById = async (id: number) => {
    if (!confirm("Report löschen?")) return;
    setDeleting(id);
    try {
      const r = await schoolFetch(`/api/school/reports/${id}`, { method: "DELETE" });
      if (r.ok) onDelete(id);
    } finally {
      setDeleting(null);
    }
  };
  const grouped = new Map<string, Report[]>();
  for (const t of REPORT_ORDER) grouped.set(t, []);
  for (const r of reports) {
    const bucket = grouped.get(r.report_type) ?? [];
    bucket.push(r);
    if (!grouped.has(r.report_type)) grouped.set(r.report_type, bucket);
  }

  const toggle = (t: string) => setOpen((p) => ({ ...p, [t]: !p[t] }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Erstellte Reports</h3>
        <p className="text-xs text-gray-400 mt-0.5">{reports.length} Reports insgesamt</p>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {[...grouped.entries()].map(([type, items]) => {
          if (items.length === 0) return null;
          const isOpen = open[type] ?? false;
          return (
            <div key={type}>
              <button
                onClick={() => toggle(type)}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                  <span>{REPORT_ICONS[type] ?? "📄"}</span>
                  <span>{type}</span>
                  <span className="text-xs font-normal text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">{items.length}</span>
                </span>
                <span className={`text-gray-400 text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
              </button>
              {isOpen && (
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-gray-700/30">
                    <tr>
                      <th className="px-5 py-2 text-left font-medium pl-12">Zeitraum</th>
                      <th className="px-5 py-2 text-left font-medium hidden md:table-cell">Erstellt</th>
                      <th className="px-5 py-2 text-center font-medium w-28"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {items.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                        <td className="px-5 py-2.5 text-gray-500 dark:text-gray-400 pl-12">{r.period_start} – {r.period_end}</td>
                        <td className="px-5 py-2.5 text-gray-400 hidden md:table-cell text-xs">{r.created_at?.slice(0, 16)}</td>
                        <td className="px-5 py-2.5 text-center space-x-2">
                          <button onClick={() => downloadById(r.id)} disabled={downloading === r.id} className="text-blue-600 hover:underline dark:text-blue-400 text-xs disabled:opacity-50">{downloading === r.id ? "…" : "PDF"}</button>
                          <button onClick={() => deleteById(r.id)} disabled={deleting === r.id} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs disabled:opacity-50">{deleting === r.id ? "…" : "✕"}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PERIODS = [
  { value: "day", label: "Tag" },
  { value: "week", label: "Woche" },
  { value: "month", label: "Monat" },
  { value: "year", label: "Jahr" },
  { value: "all", label: "Gesamt" },
] as const;

export default function SchoolDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    schoolFetch("/api/school/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error("Fehler beim Laden");
        return r.json() as Promise<DashboardData>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
    schoolFetch("/api/school/reports")
      .then((r) => r.ok ? r.json() : { reports: [] })
      .then((d: { reports: Report[] }) => setReports(d.reports));
  }, []);

  const downloadReport = async (period: string) => {
    setGenerating(true);
    try {
      const r = await schoolFetch(`/api/school/report.pdf?period=${period}`);
      if (!r.ok) throw new Error("Fehler");
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jobradar-${period}-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      const updated = await schoolFetch("/api/school/reports").then((r2) => r2.json());
      setReports(updated.reports);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="text-gray-400 text-sm py-8 text-center">Laden…</div>;
  if (error) return <div className="text-red-500 text-sm py-8 text-center">{error}</div>;

  const kpi = data?.kpi;
  const leads = data?.recent_leads ?? [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Übersicht Ihrer gematchten Stellen</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Stellen gesamt" value={kpi?.total ?? 0} />
        <KPICard label="Letzte 7 Tage" value={kpi?.week ?? 0} sub="neu eingegangen" />
        <KPICard label="Ausstehend" value={kpi?.pending ?? 0} sub="noch nicht bewertet" />
        <KPICard label="Ø Fit-Score" value={kpi?.avg_score ? `${kpi.avg_score}%` : "–"} />
      </div>

      {/* Reports toolbar */}
      {kpi && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <a href="/school/jobs" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
              {kpi.quota_used} Stellen zugewiesen →
            </a>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 mr-1">PDF-Report:</span>
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  disabled={generating}
                  onClick={() => downloadReport(p.value)}
                  className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 transition-colors"
                >
                  {p.label}
                </button>
              ))}
              {generating && <span className="text-xs text-gray-400 ml-1">PDF…</span>}
            </div>
          </div>
        </div>
      )}

      {reports.length > 0 && (
        <ReportAccordion reports={reports} onDelete={(id) => setReports((prev) => prev.filter((r) => r.id !== id))} />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Letzte Stellen</h3>
          <a href="/school/jobs" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
            Alle anzeigen →
          </a>
        </div>

        {leads.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">
            Noch keine Stellen zugewiesen.{" "}
            <a href="/school/profile" className="text-blue-600 hover:underline">Profil konfigurieren →</a>
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Stelle</th>
                <th className="px-5 py-3 text-left font-medium hidden md:table-cell">Anbieter</th>
                <th className="px-5 py-3 text-center font-medium">Score</th>
                <th className="px-5 py-3 text-left font-medium hidden lg:table-cell">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {leads.map((l) => (
                <tr
                  key={l.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
                  onClick={() => (window.location.href = `/school/jobs/${l.id}`)}
                >
                  <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">
                    {l.sources ? (
                      <a href={l.sources} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-600 dark:text-blue-400 hover:underline">{l.title}</a>
                    ) : l.title}
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">{l.provider}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${scoreColorClass(l.score)}`}>
                      {l.score}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 hidden lg:table-cell text-xs">
                    {l.updated_at?.slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
