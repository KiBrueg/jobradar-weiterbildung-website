import { useEffect, useState, useCallback } from "react";
import { schoolFetch } from "@/hooks/useSchoolAuth";

interface Lead {
  id: number;
  title: string;
  provider: string;
  score: number;
  school_status: string;
  why_fit: string;
  updated_at: string;
}

interface JobsResponse {
  total: number;
  page: number;
  per_page: number;
  items: Lead[];
}

const STATUS_LABELS: Record<string, string> = {
  all: "Alle",
  new: "Neu",
  saved: "Gespeichert",
  dismissed: "Abgelehnt",
};

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 75
      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      : score >= 50
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {score}%
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "saved"
      ? "bg-blue-100 text-blue-700"
      : status === "dismissed"
      ? "bg-gray-100 text-gray-500"
      : "bg-amber-50 text-amber-700";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function SchoolJobsPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [updating, setUpdating] = useState(false);

  const perPage = 20;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      status,
      q,
      page: String(page),
      per_page: String(perPage),
    });
    schoolFetch(`/api/school/jobs?${params}`)
      .then((r) => r.json() as Promise<JobsResponse>)
      .then((d) => {
        setItems(d.items);
        setTotal(d.total);
      })
      .finally(() => setLoading(false));
  }, [status, q, page]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQ(qInput);
    setPage(1);
  }

  async function updateStatus(leadId: number, newStatus: string) {
    setUpdating(true);
    await schoolFetch(`/api/school/jobs/${leadId}/status`, {
      method: "POST",
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(false);
    if (selected?.id === leadId) {
      setSelected((s) => s ? { ...s, school_status: newStatus } : null);
    }
    load();
  }

  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stellen</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {total} passende Vakanzen gefunden
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Suchen…"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Suchen
          </button>
        </form>

        <div className="flex gap-1">
          {Object.keys(STATUS_LABELS).map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                status === s
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {/* Table */}
        <div className={`flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${selected ? "hidden lg:block" : ""}`}>
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Laden…</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Keine Ergebnisse</div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Stelle</th>
                    <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Anbieter</th>
                    <th className="px-4 py-3 text-center font-medium">Score</th>
                    <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {items.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => setSelected(l)}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40 ${
                        selected?.id === l.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 max-w-xs truncate">
                        {l.title}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell text-xs">
                        {l.provider}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ScoreBadge score={l.score} />
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <StatusPill status={l.school_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-400">
                    Seite {page} / {pages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40
                                 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      ←
                    </button>
                    <button
                      disabled={page >= pages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40
                                 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-full lg:w-96 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4 self-start">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">
                  {selected.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selected.provider}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2">
              <ScoreBadge score={selected.score} />
              <StatusPill status={selected.school_status} />
            </div>

            {selected.why_fit && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Warum passend
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {selected.why_fit}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
              <button
                disabled={updating || selected.school_status === "saved"}
                onClick={() => updateStatus(selected.id, "saved")}
                className="flex-1 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                Speichern
              </button>
              <button
                disabled={updating || selected.school_status === "dismissed"}
                onClick={() => updateStatus(selected.id, "dismissed")}
                className="flex-1 py-2 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                Ablehnen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
