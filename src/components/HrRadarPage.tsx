import {
  AlertCircle,
  ArrowRight,
  BellRing,
  Building2,
  Check,
  ClipboardCheck,
  FileSearch,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { goKontakt, goLanding } from '@/App';
import PublicFooter from '@/components/PublicFooter';
import HrRadarComparisonCarousel from '@/components/HrRadarComparisonCarousel';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Quellen definieren',
    text: 'Relevante öffentliche Vergaben, Register und Bekanntmachungen nach Branche, Region und Suchfokus strukturieren.',
  },
  {
    icon: Radar,
    number: '02',
    title: 'Signale erfassen',
    text: 'Hinweise auf Wachstum, Standortprojekte, Umstrukturierungen oder externe Personalbedarfe werden als Rechercheansatz sichtbar.',
  },
  {
    icon: BellRing,
    number: '03',
    title: 'Priorisieren & prüfen',
    text: 'Signale werden mit Kontext, Quelle und Relevanz versehen – kein Blackbox-Lead, sondern eine nachvollziehbare Arbeitsliste.',
  },
  {
    icon: ClipboardCheck,
    number: '04',
    title: 'Mandats-Report vorbereiten',
    text: 'Für die Ansprache bleibt ein klarer Recherchepfad: Was ist passiert, warum ist es relevant und was sollte geprüft werden?',
  },
];

const benefits = [
  { icon: Users, title: 'Headhunter', text: 'Mehr Zeit für Hypothesen, Marktgespräche und passende Erstansprache statt verteilter Einzelsuche.' },
  { icon: Target, title: 'Executive Search', text: 'Strategische Trigger als Gesprächsanlass – ergänzend zu Netzwerk, Research und Mandatswissen.' },
  { icon: Building2, title: 'Direktvermittlung', text: 'Öffentlich sichtbare Veränderungen früh als Anlass für eine passende, fundierte Erstansprache einordnen.' },
  { icon: ShieldCheck, title: 'Qualitätssicherung', text: 'Jedes Signal bleibt mit Quelle und Einschätzung dokumentiert; die finale Einordnung bleibt beim Menschen.' },
];

const signalExamples = [
  'Neue Standort-, Bau- oder Digitalisierungsprojekte',
  'Beschaffungen mit Betriebs-, Service- oder Skalierungsbezug',
  'Öffentliche Veränderungen mit möglichem Personal- oder Partnerbedarf',
];

export default function HrRadarPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-ink-50 text-ink-900">
      <header className="sticky top-0 z-40 border-b border-ink-200/60 glass" role="banner">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <button onClick={goLanding} className="group flex items-center gap-2.5 text-left" aria-label="Zur JobRadar Weiterbildung Startseite">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white transition-transform group-hover:scale-105">
              <Radar className="h-5 w-5" />
            </span>
            <span className="font-display text-[17px] font-semibold tracking-tight">
              Mandat <span className="font-normal text-ink-500">Radar</span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={goLanding} className="btn-ghost hidden sm:inline-flex">JobRadar Weiterbildung</button>
            <button onClick={goKontakt} className="btn-primary">Interesse melden <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <main id="main-content" role="main">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-60" />
          <div className="absolute -right-40 -top-40 h-[470px] w-[470px] rounded-full bg-brand-100/50 blur-3xl" />
          <div className="absolute -bottom-44 -left-32 h-[410px] w-[410px] rounded-full bg-accent-100/35 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/85 px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-soft animate-fade-up">
                <Sparkles className="h-3.5 w-3.5" />
                Pre-Mandate Intelligence · Pilotkonzept
              </span>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink-900 text-balance sm:text-5xl md:text-6xl animate-fade-up" style={{ animationDelay: '60ms' }}>
                Neue Mandate werden <span className="text-brand-700">vor</span> der öffentlichen Suche sichtbar.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-600 animate-fade-up" style={{ animationDelay: '120ms' }}>
                Mandat Radar macht öffentliche Veränderungssignale für Personalberatungen, Direktvermittlung und Executive Search recherchierbar – bevor daraus eine sichtbar ausgeschriebene Vakanz wird.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: '180ms' }}>
                <button onClick={goKontakt} className="btn-primary px-5 py-3 text-base">Pilot anfragen <ArrowRight className="h-4.5 w-4.5" /></button>
                <a href="#so-funktioniert-es" className="btn-secondary px-5 py-3 text-base">So funktioniert es</a>
              </div>
              <p className="mt-5 text-sm text-ink-500">Kein Ersatz für Research und Beziehungsarbeit – ein strukturierter Frühindikator für bessere Recherchefragen.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            <article className="card border-rose-200/70 p-7">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><AlertCircle className="h-5 w-5" /></span>
                <h2 className="font-display text-xl font-semibold">Wenn Mandatsgewinnung erst bei der Vakanz beginnt</h2>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink-700">
                <li className="flex gap-3"><span className="font-semibold text-rose-500">×</span> Der Markt wird erst sichtbar, wenn Wettbewerb bereits öffentlich ist.</li>
                <li className="flex gap-3"><span className="font-semibold text-rose-500">×</span> Research startet wiederholt bei verstreuten Quellen und unpriorisierten Treffern.</li>
                <li className="flex gap-3"><span className="font-semibold text-rose-500">×</span> Der Anlass für eine gute Erstansprache bleibt häufig unscharf.</li>
              </ul>
            </article>
            <article className="card border-accent-200/70 p-7">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-600"><Radar className="h-5 w-5" /></span>
                <h2 className="font-display text-xl font-semibold">Mit Mandat Radar als Research-Schicht</h2>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink-700">
                <li className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" /> Öffentliche Signale werden nach Region, Branche und Mandatsfokus strukturiert.</li>
                <li className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" /> Jede Spur bleibt mit Quelle, Kontext und nächster Prüfungsfrage nachvollziehbar.</li>
                <li className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" /> Das Research-Team entscheidet weiterhin, was ein valider Ansatz ist.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="label">Nutzenvergleich</span>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">Research-Zeit und Kapazitätswert – transparent statt mit Fantasie-KPIs</h2>
            <p className="mt-3 leading-relaxed text-ink-600">Wie bei JobRadar zeigt der Vergleich Annahmen, Formel und Ergebnis. Die Werte sind eine veränderbare Beispielrechnung, keine Kundenstatistik oder Einspargarantie.</p>
          </div>
          <HrRadarComparisonCarousel />
        </section>

        <section id="so-funktioniert-es" className="border-y border-ink-200/60 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="label">Research-Workflow</span>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">Vier Schritte vom öffentlichen Signal zur fundierten Recherche</h2>
              <p className="mt-4 leading-relaxed text-ink-600">Die Zahlen stehen für den Prozess – nicht für erfundene Erfolgsquoten oder historische Kundendaten.</p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <article key={step.number} className="card-soft p-6 transition-shadow hover:shadow-lift animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100"><step.icon className="h-5.5 w-5.5" /></span>
                    <span className="font-display text-2xl font-semibold text-ink-200">{step.number}</span>
                  </div>
                  <h3 className="mt-5 font-semibold text-ink-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="label">Pilotansicht · Beispielstruktur</span>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">Ein Cockpit für Rechercheprioritäten – keine Blackbox.</h2>
          </div>
          <div className="card mx-auto mt-10 max-w-5xl p-2 shadow-lift">
            <div className="flex items-center gap-2 rounded-t-xl border-b border-ink-200 bg-ink-50 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-rose-300" /><span className="h-3 w-3 rounded-full bg-amber-300" /><span className="h-3 w-3 rounded-full bg-accent-300" />
              <span className="ml-3 font-mono text-xs text-ink-400">kibrueg.de/mandat-radar · Konzeptansicht</span>
            </div>
            <div className="grid gap-4 rounded-b-xl bg-white p-5 md:grid-cols-3">
              <div className="md:col-span-2 rounded-xl border border-ink-200/70 p-5">
                <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Aktuelle Research-Signale</p><p className="mt-1 text-sm text-ink-600">Beispielhafte Kategorien zur manuellen Prüfung</p></div><FileSearch className="h-5 w-5 text-brand-600" /></div>
                <div className="mt-5 space-y-3">
                  {signalExamples.map((signal, index) => <div key={signal} className="flex items-start gap-3 rounded-lg border border-ink-100 bg-ink-50/60 px-3.5 py-3 text-sm"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{index + 1}</span><span className="text-ink-700">{signal}</span></div>)}
                </div>
              </div>
              <aside className="rounded-xl border border-ink-200/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Was sichtbar wird</p>
                <div className="mt-5 space-y-4">
                  <div><p className="font-display text-3xl font-semibold text-brand-700">3</p><p className="mt-1 text-sm text-ink-600">Signalcluster im Beispiel</p></div>
                  <div><p className="font-display text-3xl font-semibold text-brand-700">1</p><p className="mt-1 text-sm text-ink-600">gemeinsame Research-Queue</p></div>
                  <div><p className="font-display text-3xl font-semibold text-brand-700">100%</p><p className="mt-1 text-sm text-ink-600">Quelle & Kontext zur Prüfung</p></div>
                </div>
              </aside>
            </div>
          </div>
          <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-relaxed text-ink-500">Die Cockpit-Karte zeigt die geplante Arbeitslogik, keine Live-Daten oder Kundensignale. Datenquellen, Scoring und Prüfregeln werden im Pilot gemeinsam definiert.</p>
        </section>

        <section className="border-y border-ink-200/60 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="mx-auto max-w-2xl text-center"><h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Was der Ansatz für verschiedene Teams bringt</h2></div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit, index) => <article key={benefit.title} className="card-soft p-6 transition-shadow hover:shadow-lift animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-white"><benefit.icon className="h-5.5 w-5.5" /></span><h3 className="mt-5 font-semibold">{benefit.title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-600">{benefit.text}</p></article>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8">
          <div className="card relative mx-auto max-w-3xl overflow-hidden p-8 md:p-12">
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-brand-300 via-cyanx-300 to-accent-300" />
            <p className="font-display text-2xl font-medium leading-snug tracking-tight text-ink-900 md:text-3xl">„Wir suchen nicht die Vakanz. Wir finden das Unternehmen davor.“</p>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-ink-600">Für Personalberatungen, Direktvermittlung und Executive Search: Interesse an einem transparent abgegrenzten Pilot? Einfach melden.</p>
            <button onClick={goKontakt} className="btn-primary mt-7 px-5 py-3 text-base">Interesse am Mandat-Radar-Pilot <ArrowRight className="h-4.5 w-4.5" /></button>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
