import { ArrowLeft, Radar } from 'lucide-react';
import { goKontakt, goLanding } from '@/App';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

const sections = [
  {
    title: 'Angaben gemäß § 5 DDG',
    body: 'Kirill Brüggemann\nKollatzstraße 2\n14059 Berlin\nDeutschland',
  },
  {
    title: 'Kontakt',
    body: 'E-Mail: kontakt@kibrueg.de\nWeb: kibrueg.de',
  },
  {
    title: 'Umsatzsteuer',
    body: 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung). Eine Umsatzsteuer-ID liegt nicht vor.',
  },
  {
    title: 'Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV',
    body: 'Kirill Brüggemann\nKollatzstraße 2\n14059 Berlin',
  },
  {
    title: 'EU-Streitschlichtung',
    body: 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/\n\nZur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir nicht verpflichtet und nicht bereit.',
  },
  {
    title: 'Haftung für Inhalte',
    body: 'Die Inhalte dieser Seite wurden mit Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen wir keine Gewähr. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte nach den allgemeinen Gesetzen verantwortlich.',
  },
];

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <PublicHeader />
      <main id="main-content" className="mx-auto max-w-4xl px-5 sm:px-8 py-12 md:py-16">
        <button onClick={goLanding} className="btn-ghost mb-8">
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Übersicht
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

          <div className="space-y-8 text-ink-700 leading-relaxed">
            {sections.map((s) => (
              <section key={s.title}>
                <h2 className="font-display text-xl font-semibold text-ink-900 mb-3">{s.title}</h2>
                <p className="whitespace-pre-line">{s.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3 border-t border-ink-200 pt-6">
            <button onClick={goKontakt} className="btn-secondary">Kontaktseite öffnen</button>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
