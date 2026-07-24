import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { goBarrierefreiheit, goImpressum, goKontakt, goLanding } from '@/App';

const privacyPoints = [
  ['Verantwortlicher', 'Angaben folgen vor Veroeffentlichung.'],
  ['Hosting / Server-Logs', 'Beim Betrieb koennen technisch notwendige Server-Logdaten verarbeitet werden, z. B. IP-Adresse, Zeitpunkt, abgerufene Seite und technische Fehlermeldungen.'],
  ['Kontaktaufnahme', 'Wenn Kontaktfunktionen spaeter aktiviert werden, werden die eingegebenen Daten nur zur Bearbeitung der Anfrage genutzt.'],
  ['Cookies', 'Aktuell sind keine Marketing-Cookies vorgesehen. Technisch notwendige Cookies koennen fuer Betrieb und Sicherheit erforderlich sein.'],
  ['Tracking', 'Kein Google Analytics, kein Meta Pixel und kein Drittanbieter-Tracking standardmaessig.'],
  ['Rechtsgrundlagen DSGVO', 'Je nach Funktion kommen insbesondere Art. 6 Abs. 1 lit. b, f oder a DSGVO in Betracht. Finale Rechtsgrundlagen werden vor Veroeffentlichung geprueft.'],
  ['Betroffenenrechte', 'Auskunft, Berichtigung, Loeschung, Einschraenkung, Widerspruch und Datenuebertragbarkeit werden vor Produktivstart sauber dokumentiert.'],
];

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <main id="main-content" className="mx-auto max-w-4xl px-5 sm:px-8 py-12 md:py-16">
        <button onClick={goLanding} className="btn-ghost mb-8">
          <ArrowLeft className="h-4 w-4" />
          Zurueck zur Uebersicht
        </button>

        <section className="card p-7 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">DSGVO / Datenschutz</p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Datenschutzerklaerung</h1>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 mb-8">
            Diese Datenschutzerklaerung ist ein Arbeitsstand und ersetzt keine finale rechtliche Pruefung. Vor Veroeffentlichung muessen Verantwortlicher, Hosting, Kontaktwege und konkrete Verarbeitungsvorgaenge final ergaenzt werden.
          </div>

          <div className="grid gap-4">
            {privacyPoints.map(([title, text]) => (
              <section key={title} className="rounded-2xl border border-ink-200 bg-white p-5">
                <h2 className="font-display text-lg font-semibold text-ink-900">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{text}</p>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-accent-200 bg-accent-50/60 p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">Privacy-friendly Default</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">JobRadar soll standardmaessig ohne Marketing-Tracking, ohne externe Werbe-Pixel und ohne unnoetige Drittanbieter-Widgets funktionieren. Ein Cookie-Banner ist nur erforderlich, wenn nicht notwendige Cookies oder Tracking spaeter aktiviert werden.</p>
          </section>

          <div className="mt-10 flex flex-wrap gap-3 border-t border-ink-200 pt-6">
            <button onClick={goImpressum} className="btn-secondary">Impressum</button>
            <button onClick={goBarrierefreiheit} className="btn-secondary">Barrierefreiheit</button>
            <button onClick={goKontakt} className="btn-secondary">Kontakt</button>
          </div>
        </section>
      </main>
    </div>
  );
}
