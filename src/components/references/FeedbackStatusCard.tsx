import { CheckCircle2, Info, ShieldCheck } from 'lucide-react';

const checklist = [
  'Noch keine veroeffentlichten Kundenbewertungen',
  'Pilot-Feedback wird nach Freigabe ergaenzt',
  'Keine erfundenen Google Reviews',
  'Referenzen nur mit Zustimmung',
  'Kundenstimmen koennen anonymisiert dargestellt werden',
];

export default function FeedbackStatusCard() {
  return (
    <div className="card p-7 md:p-9 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100"><ShieldCheck className="h-6 w-6" /></span>
        <div>
          <h3 className="font-display text-xl font-semibold text-ink-900">Aktueller Stand</h3>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">In Vorbereitung</span>
        </div>
      </div>
      <ul className="space-y-3">
        {checklist.map((c) => (
          <li key={c} className="flex items-start gap-3 text-sm text-ink-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-600"><CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} /></span>
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
