import { ArrowLeft, Radar } from 'lucide-react';
import { goDatenschutz, goKontakt, goLanding } from '@/App';

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <main id="main-content" className="mx-auto max-w-4xl px-5 sm:px-8 py-12 md:py-16">
        <button onClick={goLanding} className="btn-ghost mb-8">
          <ArrowLeft className="h-4 w-4" />
          Zurueck zur Uebersicht
        </button>

        <section className="card p-7 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-white">
              <Radar className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Rechtliche Angaben</p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Impressum</h1>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 mb-8">
            Diese Seite ist ein Arbeitsstand. Rechtliche Angaben werden vor Veroeffentlichung final geprueft und ergaenzt. Es werden keine erfundenen Adressen, USt-IDs oder Registerdaten verwendet.
          </div>

          <div className="space-y-8 text-ink-700 leading-relaxed">
            <section>
              <h2 className="font-display text-xl font-semibold text-ink-900 mb-3">Angaben gemaess § 5 DDG / TMG</h2>
              <p>Angaben folgen vor Veroeffentlichung.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-ink-900 mb-3">Verantwortlich fuer den Inhalt</h2>
              <p>Angaben folgen vor Veroeffentlichung.</p>
              <p className="mt-2 text-sm text-ink-500">Hinweis: Diese Projektseite nutzt bewusst keine Platzhalter-Adresse, die als echte Anbieterinformation missverstanden werden koennte.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-ink-900 mb-3">Kontakt</h2>
              <p>Kontaktadresse wird vor Veroeffentlichung ergaenzt.</p>
              <button onClick={goKontakt} className="btn-secondary mt-4">Kontaktseite oeffnen</button>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-ink-900 mb-3">Haftung und Projektstatus</h2>
              <p>JobRadar Weiterbildung befindet sich im MVP-/Pilotstatus. Inhalte, Leistungsbeschreibungen und rechtliche Angaben werden vor einer oeffentlichen produktiven Nutzung final geprueft.</p>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 border-t border-ink-200 pt-6">
            <button onClick={goDatenschutz} className="btn-secondary">Datenschutz</button>
            <button onClick={goKontakt} className="btn-secondary">Kontakt</button>
          </div>
        </section>
      </main>
    </div>
  );
}
