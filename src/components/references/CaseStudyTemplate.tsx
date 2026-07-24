import { FileText } from 'lucide-react';
import { PlaceholderBanner } from './ui';

const fields = [
  { label: 'Ausgangslage', value: 'Weiterbildungsträger mit Data/BI-Kursen benötigt wöchentlichen Arbeitsmarktnachweis pro Kurs.' },
  { label: 'Suchprofil', value: 'Junior Data Analyst, BI Analyst, Reporting Analyst — Remote + DACH, German B1+/English C1.' },
  { label: 'Quellen', value: '4 Job-APIs + manuelle Ergänzung (Flow 4 Job APIs).' },
  { label: 'Rohstellen geprüft', value: 'Beispielwert: 180' },
  { label: 'Dubletten entfernt', value: 'Beispielwert: 42' },
  { label: 'Top-Empfehlungen', value: 'Beispielwert: 10' },
  { label: 'Nutzen für Coaching', value: 'Weniger manuelle Recherche, gezielte Vorbereitung auf realistische Zielberufe.' },
  { label: 'Freigegebene Kundenstimme', value: 'Noch nicht freigegeben — wird nach Pilotlauf ergänzt.' },
];

export default function CaseStudyTemplate() {
  return (
    <div className="card p-6 md:p-8 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-ink-600">
          <FileText className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <PlaceholderBanner>Template — noch nicht veroeffentlicht</PlaceholderBanner>
          <h3 className="mt-2 font-display text-lg font-semibold text-ink-900">
            Data Analyst Weiterbildung — Arbeitsmarkt-Radar Pilot
          </h3>
        </div>
      </div>

      <dl className="divide-y divide-ink-100">
        {fields.map((f) => (
          <div key={f.label} className="grid sm:grid-cols-3 gap-1 sm:gap-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wider text-ink-500">{f.label}</dt>
            <dd className="sm:col-span-2 text-sm text-ink-700">{f.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 text-xs text-ink-500 leading-relaxed">
        Zahlen und Aussagen werden erst nach einem echten Pilotlauf veroeffentlicht.
      </p>
    </div>
  );
}
