import { ArrowLeft, Eye, Keyboard, MonitorSmartphone, Volume2 } from 'lucide-react';
import { goLanding } from '@/App';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

const checks = [
  { icon: Keyboard, title: 'Tastaturbedienbarkeit', text: 'Navigation, Buttons und wichtige Bereiche sollen ohne Maus erreichbar sein.' },
  { icon: Eye, title: 'Screenreader-Struktur', text: 'Semantische Landmarken, sinnvolle Gliederung und beschreibende Texte zu KPIs und Reports.' },
  { icon: MonitorSmartphone, title: 'Kontrast und Responsive UI', text: 'Lesbare Kontraste, sichtbare Fokus-Stile und nutzbare Darstellung auf Desktop und Mobile.' },
  { icon: Volume2, title: 'Reduzierte Bewegung', text: 'Animationen respektieren prefers-reduced-motion und sollen keine Kerninformation transportieren.' },
];

const openItems = [
  'Tastaturtest aller interaktiven Elemente.',
  'Screenreader-Test: Landing Page, Referenzen und Admin-Dashboard.',
  'Kontrastcheck aller Status-Badges und Diagramme.',
  'Textalternativen zu Charts, KPI-Karten und Reports finalisieren.',
  'Formulare mit Labels, Fehlertexten und Datenschutz-Hinweisen testen.',
];

export default function BarrierefreiheitPage() {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <PublicHeader />
      <main id="main-content" className="mx-auto max-w-4xl px-5 sm:px-8 py-12 md:py-16">
        <button onClick={goLanding} className="btn-ghost mb-8">
          <ArrowLeft className="h-4 w-4" />
          Zur Startseite
        </button>

        <section className="card p-7 md:p-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Accessibility / BITV Orientierung</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mt-2">Barrierefreiheit — Arbeitsstand</h1>
            <p className="mt-4 text-ink-600 leading-relaxed">Diese Seite dokumentiert den Arbeitsstand zur Barrierefreiheit von JobRadar Weiterbildung. Die finale Kontrolle erfolgt vor dem produktiven Betrieb.</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 mb-8">
            Arbeitsstand: Orientierung an WCAG 2.1/2.2 AA und BITV 2.0. Diese Seite wird vor Publikation final kontrolliert und aktualisiert.
          </div>

          <section className="rounded-2xl border border-ink-200 bg-white p-5 mb-6">
            <h2 className="font-display text-xl font-semibold text-ink-900 mb-2">Stand der Vereinbarkeit mit den Anforderungen</h2>
            <p className="text-sm leading-relaxed text-ink-600">Diese Website orientiert sich an den Richtlinien WCAG 2.1/2.2 AA sowie an der BITV 2.0. Eine komplette Konformität ist nicht getestet und wird nicht behauptet. Bewusst wird auf Aussagen wie "komplett barrierefrei" oder "100% WCAG compliant" verzichtet.</p>
          </section>

          <div className="grid sm:grid-cols-2 gap-4">
            {checks.map((item) => (
              <section key={item.title} className="card-soft p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 mb-3">
                  <item.icon className="h-5 w-5" />
                </span>
                <h2 className="font-display text-lg font-semibold text-ink-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.text}</p>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-ink-200 bg-white p-5">
            <h2 className="font-display text-xl font-semibold text-ink-900">Nicht barrierefreie Inhalte / offene Punkte</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-600">
              {openItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-2xl border border-accent-200 bg-accent-50/60 p-5">
            <h2 className="font-display text-xl font-semibold text-ink-900">Feedback und Kontakt</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">Kontakt wird vor Publikation eingebunden. Hinweise zur Bedienbarkeit sind danach per Kontaktseite meldbar.</p>
          </section>

          <section className="mt-6 rounded-2xl border border-ink-200 bg-white p-5">
            <h2 className="font-display text-xl font-semibold text-ink-900">Durchsetzungsverfahren / zentrale Stelle</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">Angaben zur Durchsetzungsstelle folgen vor Publikation.</p>
          </section>

          <section className="mt-6 rounded-2xl border border-ink-200 bg-white p-5">
            <h2 className="font-display text-xl font-semibold text-ink-900">Erstellungsdatum / letzte Aktualisierung</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">Diese Seite ist ein Arbeitsstand und wird vor Publikation final kontrolliert. Datum der finalen Version wird aktualisiert.</p>
          </section>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
