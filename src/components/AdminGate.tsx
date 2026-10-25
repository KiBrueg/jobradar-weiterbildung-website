import { useState } from 'react';
import { Radar, Lock } from 'lucide-react';

const SESSION_KEY = 'jr_admin_auth';
const PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? '';

export function isAdminAuthed(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(isAdminAuthed);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  if (authed) return <>{children}</>;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
    } else {
      setError(true);
      setInput('');
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm text-center">
        <div className="flex justify-center mb-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-900 text-white">
            <Radar className="h-6 w-6" />
          </span>
        </div>
        <h1 className="font-display text-xl font-semibold text-ink-900 mb-1">Admin-Bereich</h1>
        <p className="text-sm text-ink-500 mb-6">Bitte Passwort eingeben</p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="password"
              value={input}
              onChange={e => { setInput(e.target.value); setError(false); }}
              placeholder="Passwort"
              autoFocus
              className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-sm outline-none transition
                ${error
                  ? 'border-red-400 bg-red-50 text-red-700 placeholder-red-300'
                  : 'border-ink-200 bg-white text-ink-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
                }`}
            />
          </div>
          {error && <p className="text-xs text-red-600">Falsches Passwort</p>}
          <button type="submit" className="btn-primary py-2.5">
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
}
