import { useState } from 'react';
import { CheckCircle2, Send, Info } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function FeedbackFormMockup() {
  const { toast } = useToast();
  const [org, setOrg] = useState('');
  const [role, setRole] = useState('');
  const [course, setCourse] = useState('');
  const [helpful, setHelpful] = useState('');
  const [improve, setImprove] = useState('');
  const [anon, setAnon] = useState<'Ja' | 'Nein' | 'Spaeter entscheiden'>('Spaeter entscheiden');
  const [consent, setConsent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Demo: Feedback wurde lokal vorgemerkt.', 'success');
    setOrg(''); setRole(''); setCourse(''); setHelpful(''); setImprove('');
    setAnon('Spaeter entscheiden'); setConsent(false);
  };

  return (
    <form onSubmit={submit} className="card p-6 md:p-8 max-w-2xl">
      <h3 className="font-display text-xl font-semibold text-ink-900 mb-1">Feedback vorbereiten</h3>
      <p className="text-sm text-ink-500 mb-6">Dieses Formular ist eine Demo fuer spaetere Pilotprojekte.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="label">Organisation</label><input className="input" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Bildungstraeger, Schule" /></div>
        <div><label className="label">Rolle</label><input className="input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Coach, Koordination, Leitung" /></div>
      </div>
      <div className="mt-4"><label className="label">Kursprofil</label><input className="input" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="z.B. Data Analyst Weiterbildung" /></div>
      <div className="mt-4"><label className="label">Was war hilfreich?</label><textarea className="textarea" value={helpful} onChange={(e) => setHelpful(e.target.value)} /></div>
      <div className="mt-4"><label className="label">Was sollte verbessert werden?</label><textarea className="textarea" value={improve} onChange={(e) => setImprove(e.target.value)} /></div>
      <button type="submit" className="btn-primary mt-6 w-full sm:w-auto"><Send className="h-4 w-4" /> Feedback lokal vormerken</button>
    </form>
  );
}
