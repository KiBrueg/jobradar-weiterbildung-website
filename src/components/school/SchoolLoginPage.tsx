import { useState, FormEvent } from "react";
import { saveSchoolUser } from "@/hooks/useSchoolAuth";

interface Props {
  onLogin: () => void;
}

export default function SchoolLoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/school/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { detail?: string }).detail || "Anmeldung fehlgeschlagen");
        return;
      }
      const data = await res.json() as { token: string; school_name: string; plan: string };
      saveSchoolUser({ token: data.token, schoolName: data.school_name, plan: data.plan });
      onLogin();
    } catch {
      setError("Verbindungsfehler — bitte erneut versuchen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">JobRadar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Schulportal — Anmeldung</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kontakt@meineschule.de"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Nur erforderlich, wenn ein Passwort gesetzt wurde.</p>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20
                            border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                         text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Bitte warten…" : "Zum Portal →"}
            </button>
          </form>

          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-6">
            Noch kein Zugang?{" "}
            <a href="/#kontakt" className="text-blue-600 hover:underline">
              Jetzt anfragen
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
