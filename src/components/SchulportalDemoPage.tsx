import { ArrowLeft, LayoutDashboard, Star, Clock, CheckCircle2, AlertCircle, BookOpen, ArrowRight, LogIn } from 'lucide-react';
import { goLanding, goKontakt, goSchool } from '@/App';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

const KPIS = [
  { label: 'Stellen gesamt', value: '394', sub: 'diese Woche' },
  { label: 'Letzte 7 Tage', value: '87', sub: 'neu eingegangen' },
  { label: 'In Bewertung', value: '12', sub: 'noch offen' },
  { label: 'Ø Fit-Score', value: '74%', sub: 'dieser Kurs' },
];

const DEMO_LEADS = [
  { title: 'Junior Data Analyst (m/w/d)', company: 'Digitalagentur Nord GmbH', score: 91, status: 'approved', date: '2026-08-06' },
  { title: 'Werkstudent KI-Automatisierung', company: 'TechStart Berlin UG', score: 88, status: 'approved', date: '2026-08-05' },
  { title: 'Process Automation Specialist', company: 'Logistik Partner AG', score: 84, status: 'pending', date: '2026-08-05' },
  { title: 'Data Science Trainee', company: 'InsureTech Solutions GmbH', score: 82, status: 'approved', date: '2026-08-04' },
  { title: 'KI-Assistent im Kundenservice', company: 'Retailkonzern Mitte', score: 79, status: 'pending', date: '2026-08-04' },
  { title: 'Automatisierungsbeauftragter (Teilzeit)', company: 'Handwerk Digital eG', score: 76, status: 'approved', date: '2026-08-03' },
  { title: 'Junior ML Engineer', company: 'HealthData AG', score: 74, status: 'pending', date: '2026-08-03' },
  { title: 'Content Automation Manager', company: 'Medienagentur Ost GmbH', score: 71, status: 'approved', date: '2026-08-02' },
];

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 85 ? 'bg-accent-600 text-white' :
    score >= 70 ? 'bg-brand-600 text-white' :
    'bg-ink-200 text-ink-700';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}`}>
      <Star className="h-3 w-3" />
      {score}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
      <CheckCircle2 className="h-3 w-3" /> Freigegeben
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
      <AlertCircle className="h-3 w-3" /> In Bewertung
    </span>
  );
}

export default function SchulportalDemoPage() {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <PublicHeader />
      <main id="main-content" className="mx-auto max-w-5xl px-5 sm:px-8 py-12 md:py-16">
        <button onClick={goLanding} className="btn-ghost mb-8">
          <ArrowLeft className="h-4 w-4" />
          Zur Startseite
        </button>

        {/* Demo banner */}
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
          <span className="text-xl shrink-0">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Demo-Ansicht</p>
            <p className="text-amber-700 text-sm mt-0.5">
              Dies ist eine <strong>fiktive Vorschau</strong> des Schulportals — keine echten Daten. Im Pilotbetrieb erhält jede Schule einen eigenen Zugang mit kursbezogenen Stellen und Freigabe-Funktion.
            </p>
          </div>
        </div>

        {/* Portal header */}
        <div className="card p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <LayoutDashboard className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Schulportal (Demo)</p>
              <h2 className="font-display text-lg font-semibold text-ink-900">AZAV Academy Berlin</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <BookOpen className="h-3.5 w-3.5 text-ink-400" />
            <span className="text-sm text-ink-600">KI-Grundlagen &amp; Automatisierung · 12 Wochen</span>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {KPIS.map((k) => (
            <div key={k.label} className="card p-5">
              <p className="text-xs text-ink-500 font-medium">{k.label}</p>
              <p className="text-3xl font-bold text-ink-900 mt-1">{k.value}</p>
              {k.sub && <p className="text-xs text-ink-400 mt-1">{k.sub}</p>}
            </div>
          ))}
        </div>

        {/* Leads table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-ink-100 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold text-ink-900">Aktuelle Stellen</h3>
              <p className="text-xs text-ink-400 mt-0.5 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Zeitraum: 01.08.–06.08.2026 · {DEMO_LEADS.length} Treffer
              </p>
            </div>
            <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
              Demo · {DEMO_LEADS.length} Stellen
            </span>
          </div>

          <div className="divide-y divide-ink-100">
            {DEMO_LEADS.map((lead, i) => (
              <div key={i} className="px-6 py-4 hover:bg-ink-50/50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-ink-900 text-sm">{lead.title}</span>
                      <ScoreBadge score={lead.score} />
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5">{lead.company}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={lead.status} />
                    <span className="text-xs text-ink-400 hidden sm:block">
                      {new Date(lead.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-ink-100 bg-ink-50/40 text-xs text-ink-400 text-center">
            Im echten Portal: direkte Links, Coach-Notizen, Freigabe-Funktion, CSV-Export und wöchentliche Benachrichtigungen.
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink-900">Zugang zur echten Version anfragen</h3>
            <p className="mt-1 text-sm text-ink-600 max-w-md">
              Im Pilot richtet jede Schule ein eigenes Kurs­profil ein und sieht nur die eigenen Treffer — mit Freigabe-Funktion und wöchentlichem Report.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button onClick={goKontakt} className="btn-primary px-5 py-2.5">
              Pilot anfragen
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={goSchool} className="btn-ghost px-4 py-2.5 flex items-center gap-2 text-ink-500 text-sm">
              <LogIn className="h-4 w-4" />
              Bereits Zugang?
            </button>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
