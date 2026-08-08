import { useEffect, useState, FormEvent } from "react";
import { schoolFetch, getSchoolUser } from "@/hooks/useSchoolAuth";

interface SchoolInfo {
  id: number;
  name: string;
  contact_email: string;
  portal_plan: string;
  search_profiles: string | null;
}

interface Profile {
  keywords: string[];
  location: string;
  work_mode: string;
}

function parseProfiles(raw: string | null): Profile {
  if (!raw) return { keywords: [], location: "", work_mode: "remote" };
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p)) return p[0] ?? { keywords: [], location: "", work_mode: "remote" };
    return p;
  } catch {
    return { keywords: [], location: "", work_mode: "remote" };
  }
}

export default function SchoolProfilePage() {
  const user = getSchoolUser();
  const [info, setInfo] = useState<SchoolInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Profile form state
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("remote");

  useEffect(() => {
    schoolFetch("/api/school/me")
      .then((r) => r.json() as Promise<SchoolInfo>)
      .then((d) => {
        setInfo(d);
        const p = parseProfiles(d.search_profiles);
        setKeywords(p.keywords.join(", "));
        setLocation(p.location);
        setWorkMode(p.work_mode || "remote");
      })
      .catch(() => setError("Profil konnte nicht geladen werden"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const profile = {
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      location,
      work_mode: workMode,
    };
    const res = await schoolFetch("/api/school/profile", {
      method: "POST",
      body: JSON.stringify({ search_profiles: JSON.stringify([profile]) }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError("Speichern fehlgeschlagen");
    }
  }

  if (loading) return <div className="text-gray-400 text-sm py-8 text-center">Laden…</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profil</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Schulinformationen und Sucheinstellungen
        </p>
      </div>

      {/* School info card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Schuldaten</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex gap-4">
            <dt className="w-32 text-gray-500 dark:text-gray-400 shrink-0">Name</dt>
            <dd className="text-gray-900 dark:text-white font-medium">{info?.name ?? user?.schoolName}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-32 text-gray-500 dark:text-gray-400 shrink-0">E-Mail</dt>
            <dd className="text-gray-700 dark:text-gray-300">{info?.contact_email || "—"}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-32 text-gray-500 dark:text-gray-400 shrink-0">Tarif</dt>
            <dd>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {info?.portal_plan ?? user?.plan}
              </span>
            </dd>
          </div>
        </dl>
        <p className="text-xs text-gray-400 mt-4">
          Um Ihre Schuldaten zu ändern, kontaktieren Sie uns unter{" "}
          <a href="mailto:kontakt@kibrueg.de" className="text-blue-600 hover:underline">
            kontakt@kibrueg.de
          </a>
        </p>
      </div>

      {/* Search profile form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Suchprofil</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Definieren Sie, nach welchen Stellen wir für Sie suchen sollen.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Keywords (kommagetrennt)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="KI, Automatisierung, n8n, Python, Data Analyst"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Stellentitel und Anforderungen werden nach diesen Begriffen durchsucht.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Region / Standort
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Deutschland, Berlin, Bayern, …"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Arbeitsmodell
            </label>
            <div className="flex gap-2">
              {[
                { value: "remote", label: "Remote" },
                { value: "hybrid", label: "Hybrid" },
                { value: "onsite", label: "Vor Ort" },
                { value: "all", label: "Alle" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setWorkMode(opt.value)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    workMode === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          {saved && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              ✓ Gespeichert
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                       text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? "Speichern…" : "Suchprofil speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}
