import { ArrowLeft, Search, MapPin, Monitor, Star, Calendar } from 'lucide-react';
import { goLanding } from '@/App';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

const SEARCH_PROFILE = {
  school: 'AZAV Academy Berlin',
  course: 'KI-Grundlagen & Automatisierung (12 Wochen)',
  keywords: ['KI', 'Machine Learning', 'Automatisierung', 'Python', 'n8n', 'Data Analyst', 'LLM'],
  location: 'Berlin / Remote',
  workMode: ['Remote', 'Hybrid'],
  minScore: 60,
};

const DEMO_LEADS = [
  {
    title: 'Junior Data Analyst (m/w/d)',
    company: 'Digitalagentur Nord GmbH',
    score: 91,
    workMode: 'Hybrid',
    location: 'Berlin',
    date: '2026-08-06',
    whyFit: 'Python und SQL im Einsatz, Einstiegsniveau, passt zum Kursprofil KI-Grundlagen.',
  },
  {
    title: 'Werkstudent KI-Automatisierung',
    company: 'TechStart Berlin UG',
    score: 88,
    workMode: 'Remote',
    location: 'Remote',
    date: '2026-08-05',
    whyFit: 'n8n und Make.com explizit gefordert — direkter Match mit Kursinhalt.',
  },
  {
    title: 'Process Automation Specialist',
    company: 'Logistik Partner AG',
    score: 84,
    workMode: 'Hybrid',
    location: 'Berlin',
    date: '2026-08-05',
    whyFit: 'RPA und Workflow-Kenntnisse gefordert, Quereinsteiger willkommen.',
  },
  {
    title: 'Data Science Trainee',
    company: 'InsureTech Solutions GmbH',
    score: 82,
    workMode: 'Remote',
    location: 'Remote',
    date: '2026-08-04',
    whyFit: 'Machine Learning Grundlagen, kein Vorstudium erforderlich.',
  },
  {
    title: 'KI-Assistent im Kundenservice',
    company: 'Retailkonzern Mitte',
    score: 79,
    workMode: 'Hybrid',
    location: 'Berlin',
    date: '2026-08-04',
    whyFit: 'Chatbot-Pflege und Prompt-Anpassung, Einstiegsposition.',
  },
  {
    title: 'Automatisierungsbeauftragter (Teilzeit)',
    company: 'Handwerk Digital eG',
    score: 76,
    workMode: 'Remote',
    location: 'Remote',
    date: '2026-08-03',
    whyFit: 'Digitalisierung Handwerksbetriebe, Python-Grundlagen ausreichend.',
  },
  {
    title: 'Junior ML Engineer',
    company: 'HealthData AG',
    score: 74,
    workMode: 'Hybrid',
    location: 'Berlin',
    date: '2026-08-03',
    whyFit: 'TensorFlow-Grundlagen + Python, Quereinsteiger mit Schulungsnachweis bevorzugt.',
  },
  {
    title: 'Content Automation Manager',
    company: 'Medienagentur Ost GmbH',
    score: 71,
    workMode: 'Remote',
    location: 'Remote',
    date: '2026-08-02',
    whyFit: 'KI-Tools im Redaktionsalltag, kein Tech-Hintergrund notwendig.',
  },
  {
    title: 'Sachbearbeiter Digitalisierung',
    company: 'Kammerbetrieb Berlin',
    score: 68,
    workMode: 'Hybrid',
    location: 'Berlin',
    date: '2026-08-02',
    whyFit: 'Excel-Automatisierung und einfache Skripte, Teilqualifikation anerkannt.',
  },
  {
    title: 'IT-Koordinator Automatisierung',
    company: 'Verwaltungsgesellschaft Nord',
    score: 63,
    workMode: 'Hybrid',
    location: 'Berlin',
    date: '2026-08-01',
    whyFit: 'Keine Programmierkenntnisse erforderlich, Schwerpunkt No-Code-Tools.',
  },
];

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 85 ? 'bg-accent-600 text-white' :
    score >= 70 ? 'bg-brand-600 text-white' :
    'bg-ink-200 text-ink-700';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${color}`}>
      <Star className="h-3 w-3" />
      {score}
    </span>
  );
}

export default function BeispielReportPage() {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <PublicHeader />
      <main id="main-content" className="mx-auto max-w-5xl px-5 sm:px-8 py-12 md:py-16">
        <button onClick={goLanding} className="btn-ghost mb-8">
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Übersicht
        </button>

        {/* Demo banner */}
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
          <span className="text-xl shrink-0">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Demo-Ansicht</p>
            <p className="text-amber-700 text-sm mt-0.5">
              Diese Liste zeigt <strong>fiktive Beispiel-Stellen</strong> — keine echten Vakanzen. Ein echter Report enthält reale Fundstellen aus 2.200+ überwachten Quellen, angepasst an das Kursprofil Ihrer Einrichtung.
            </p>
          </div>
        </div>

        {/* Search profile */}
        <div className="card p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Search className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Suchprofil (Beispiel)</p>
              <h2 className="font-display text-lg font-semibold text-ink-900">{SEARCH_PROFILE.school}</h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-ink-400 mb-1">Kurs</p>
              <p className="font-medium text-ink-800">{SEARCH_PROFILE.course}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400 mb-1">Standort / Modus</p>
              <p className="font-medium text-ink-800 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-ink-400" />
                {SEARCH_PROFILE.location}
                <Monitor className="h-3.5 w-3.5 text-ink-400 ml-2" />
                {SEARCH_PROFILE.workMode.join(', ')}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-400 mb-1">Schlagworte</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {SEARCH_PROFILE.keywords.map((k) => (
                  <span key={k} className="rounded-full bg-brand-50 border border-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">{k}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-ink-400 mb-1">Mindest-Score</p>
              <p className="font-medium text-ink-800">{SEARCH_PROFILE.minScore} / 100</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-ink-100 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold text-ink-900">Gefundene Stellen</h3>
              <p className="text-xs text-ink-400 mt-0.5">Zeitraum: 06.08.2026 — 01.08.2026 · {DEMO_LEADS.length} Treffer</p>
            </div>
            <span className="rounded-full bg-accent-50 border border-accent-200 px-3 py-1 text-xs font-semibold text-accent-700">
              Demo · {DEMO_LEADS.length} Stellen
            </span>
          </div>

          <div className="divide-y divide-ink-100">
            {DEMO_LEADS.map((lead, i) => (
              <div key={i} className="px-6 py-4 hover:bg-ink-50/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-ink-900 text-sm">{lead.title}</span>
                      <ScoreBadge score={lead.score} />
                      <span className="text-xs text-ink-400 bg-ink-100 rounded-full px-2 py-0.5">{lead.workMode}</span>
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5">{lead.company} · {lead.location}</p>
                    <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">{lead.whyFit}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 text-xs text-ink-400 whitespace-nowrap">
                    <Calendar className="h-3 w-3" />
                    {new Date(lead.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-ink-100 bg-ink-50/40 text-xs text-ink-400 text-center">
            In einem echten Report: direkte Links zu den Stellenanzeigen, Export als CSV/PDF, Freigabe-Funktion für Coaches.
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
