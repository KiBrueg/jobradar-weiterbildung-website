import { useState } from 'react';
import { Send, Info } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function FeedbackFormMockup() {
  const { toast } = useToast();
  const [org, setOrg] = useState('');
  const [role, setRole] = useState('');
  const [course, setCourse] = useState('');
  const [helpful, setHelpful] = useState('');
  const [improve, setImprove] = useState('');
  const [anon, setAnon] = useState<'Ja' | 'Nein' | 'Noch offen'>('Noch offen');
  const [consent, setConsent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Demo: Feedback wurde lokal vorgemerkt.', 'success');
    setOrg(''); setRole(''); setCourse(''); setHelpful(''); setImprove('');
    setAnon('Noch offen'); setConsent(false);
  };

  return (
    <form onSubmit={submit} className="card p-6 md:p-8 max-w-2xl">
      <h3 className="font-display text-xl font-semibold text-ink-900 mb-1">Feedback vorbereiten</h3>
      <p className="text-sm text-ink-500 mb-6">Dieses Formular ist eine Demo zur Vorbereitung. Es sendet aktuell keine Daten an einen Server.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Organisation</label>
          <input className="input" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Einrichtung, Schule" />
        </div>
        <div>
          <label className="label">Rolle</label>
          <input className="input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Coach, Koordination, Leitung" />
        </div>
      </div>

      <div className="mt-4">
        <label className="label">Kursprofil</label>
        <input className="input" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="z.B. Data Analyst Weiterbildung" />
      </div>

      <div className="mt-4">
        <label className="label">Was war hilfreich?</label>
        <textarea className="textarea" value={helpful} onChange={(e) => setHelpful(e.target.value)} placeholder="z.B. laufende Reports, Zeitersparnis bei Recherche" />
      </div>

      <div className="mt-4">
        <label className="label">Was sollte verbessert werden?</label>
        <textarea className="textarea" value={improve} onChange={(e) => setImprove(e.target.value)} placeholder="z.B. mehr Quellen, bessere Filter" />
      </div>

      <div className="mt-4">
        <label className="label">Darf die Aussage anonymisiert publiziert werden?</label>
        <div className="flex flex-wrap gap-2">
          {(['Ja', 'Nein', 'Noch offen'] as const).map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => setAnon(opt)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                anon === opt ? 'bg-ink-900 text-white' : 'bg-white border border-ink-200 text-ink-600 hover:bg-ink-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-5 flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
        />
        <span className="text-sm text-ink-600 leading-relaxed">
          Ich bestätige, dass diese Aussage nach Freigabe publiziert werden darf.
        </span>
      </label>

      <button type="submit" className="btn-primary mt-6 w-full sm:w-auto">
        <Send className="h-4 w-4" />
        Feedback lokal vormerken
      </button>

      <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-ink-50 border border-ink-200 p-3.5">
        <Info className="h-4 w-4 text-ink-400 shrink-0 mt-0.5" />
        <p className="text-xs text-ink-500 leading-relaxed">
          Demo-Formular: Daten bleiben nur im Browser. Keine Weitergabe, keine Speicherung auf einem Server.
        </p>
      </div>
    </form>
  );
}
