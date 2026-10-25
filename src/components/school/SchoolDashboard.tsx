import { useEffect, useState } from "react";
import { schoolFetch } from "@/hooks/useSchoolAuth";

interface KPI { total: number; week: number; pending: number; avg_score: number }
interface Lead { id: number; title: string; provider: string; score: number; school_status: string; updated_at: string }

function scoreColor(s: number) {
  if (s >= 75) return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
  if (s >= 50) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400";
  return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
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
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    schoolFetch("/api/school/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error("Fehler beim Laden");
        return r.json();
      })
      .then((d) => {
        setKpi(d.kpi);
        setLeads(d.recent_leads || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-sm">Laden?</div>;
  if (error) return <div className="text-red-500 text-sm">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">?bersicht Ihrer gematchten Stellen</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Stellen gesamt" value={kpi?.total ?? 0} />
        <KPICard label="Letzte 7 Tage" value={kpi?.week ?? 0} sub="neu eingegangen" />
        <KPICard label="Ausstehend" value={kpi?.pending ?? 0} sub="noch nicht bewertet" />
        <KPICard label="? Fit-Score" value={kpi?.avg_score ? `${kpi.avg_score}%` : "?"} />
      </div>

      {/* Recent leads */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Letzte Stellen</h3>
          <a href="/school/jobs" className="text-sm text-blue-600 hover:underline">Alle anzeigen ?</a>
        </div>
        {leads.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Noch keine Stellen zugewiesen.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-5 py-3 text-left">Stelle</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Anbieter</th>
                <th className="px-5 py-3 text-center">Score</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => window.location.href = `/school/jobs/${l.id}`}>
                  <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{l.title}</td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{l.provider}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${scoreColor(l.score)}`}>
                      {l.score}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 hidden lg:table-cell">
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
