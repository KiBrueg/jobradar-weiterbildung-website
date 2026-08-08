import { useEffect, useState } from "react";
import { schoolFetch } from "@/hooks/useSchoolAuth";

interface KPI { total: number; week: number; pending: number; avg_score: number; quota_used: number; quota_limit: number }
interface Lead { id: number; title: string; provider: string; score: number; school_status: string; updated_at: string }
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

export default function SchoolDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    schoolFetch("/api/school/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error("Fehler beim Laden");
        return r.json() as Promise<DashboardData>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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

      {/* Quota bar */}
      {kpi && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Kontingent: {kpi.quota_used} / {kpi.quota_limit} Stellen
            </p>
            <a
              href="/api/school/report.pdf"
              className="text-xs text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1"
            >
              ↓ PDF-Report
            </a>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                kpi.quota_used / kpi.quota_limit >= 0.9
                  ? "bg-red-500"
                  : kpi.quota_used / kpi.quota_limit >= 0.7
                  ? "bg-yellow-400"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(100, Math.round(kpi.quota_used / kpi.quota_limit * 100))}%` }}
            />
          </div>
          {kpi.quota_used >= kpi.quota_limit && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Kontingent ausgeschöpft — neue Stellen werden erst nach Erweiterung zugewiesen.
            </p>
          )}
        </div>
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
                  <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{l.title}</td>
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
