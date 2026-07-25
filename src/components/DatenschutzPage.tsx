import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { goLanding } from '@/App';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

const sections = [
  {
    title: 'Verantwortlicher',
    body: 'Angaben folgen vor Veroeffentlichung.',
  },
  {
    title: 'Hosting und Server-Logs',
    body: 'Beim Betrieb koennen technisch notwendige Server-Logdaten verarbeitet werden, z. B. IP-Adresse, Zeitpunkt, abgerufene Seite und technische Fehlermeldungen. Diese dienen ausschliesslich dem Betrieb, der Sicherheit und der Fehleranalyse und werden nach begrenzter Zeit automatisch geloescht.',
  },
  {
    title: 'Kontaktaufnahme',
    body: 'Wenn Kontaktfunktionen spaeter aktiviert werden, werden die eingegebenen Daten nur zur Bearbeitung der Anfrage genutzt. Eine Speicherung erfolgt nur, soweit und solange es fuer die Bearbeitung erforderlich ist.',
  },
  {
    title: 'Rechtsgrundlagen der Verarbeitung',
    body: 'Je nach Funktion kommen insbesondere Art. 6 Abs. 1 lit. b (Vertragserfuellung), lit. f (berechtigtes Interesse) oder lit. a (Einwilligung) DSGVO in Betracht. Finale Rechtsgrundlagen werden vor Veroeffentlichung geprueft.',
  },
  {
    title: 'Speicherdauer',
    body: 'Personenbezogene Daten werden nur so lange gespeichert, wie es fuer den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorschreiben. Danach werden sie geloescht oder anonymisiert.',
  },
  {
    title: 'Empfaenger / Auftragsverarbeiter',
    body: 'Angaben folgen vor Veroeffentlichung. Auftragsverarbeiter (z. B. Hosting-Provider) werden vor Produktivstart vertraglich nach Art. 28 DSGVO eingebunden.',
  },
  {
    title: 'Betroffenenrechte',
    body: 'Auskunft, Berichtigung, Loeschung, Einschraenkung, Widerspruch und Datenuebertragbarkeit werden vor Produktivstart sauber dokumentiert. Betroffene koennen sich jederzeit fuer ihre Rechte an den Verantwortlichen wenden.',
  },
  {
    title: 'Beschwerderecht bei einer Aufsichtsbehoerde',
    body: 'Betroffene haben das Recht, sich bei einer zustaendigen Datenschutz-Aufsichtsbehoerde zu beschweren. Die zustaendige Stelle wird vor Veroeffentlichung ergaenzt.',
  },
  {
    title: 'Cookies',
    body: 'Derzeit werden keine nicht notwendigen Cookies gesetzt. Ein Cookie-Banner ist daher im aktuellen Stand nicht vorgesehen. Technisch notwendige Cookies koennen fuer Betrieb und Sicherheit erforderlich sein.',
  },
  {
    title: 'Tracking / Analytics',
    body: 'Aktuell sind keine Marketing-Cookies, kein Google Analytics, kein Meta Pixel und kein Drittanbieter-Tracking vorgesehen. Bei Aktivierung von Analyse-, Marketing- oder Drittanbieter-Cookies wird vorab ein Consent-Mechanismus ergaenzt.',
  },
  {
    title: 'Drittanbieter-Dienste',
    body: 'Drittanbieter-Dienste werden erst nach finaler Pruefung ergaenzt. Aktuell werden keine externen Widgets, Karten, Videos oder Chat-Tools eingebunden.',
  },
  {
    title: 'Sicherheit / TLS',
    body: 'Die Uebertragung erfolgt verschluesselt (TLS). Weitere technische und organisatorische Massnahmen werden vor Produktivstart dokumentiert.',
  },
  {
    title: 'Aenderungen dieser Datenschutzerklaerung',
    body: 'Diese Datenschutzerklaerung kann angepasst werden, um gesetzliche oder technische Aenderungen abzubilden. Die jeweils aktuelle Version ist auf dieser Seite abrufbar.',
  },
];

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <PublicHeader />
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
            {sections.map((s) => (
              <section key={s.title} className="rounded-2xl border border-ink-200 bg-white p-5">
                <h2 className="font-display text-lg font-semibold text-ink-900">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.body}</p>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-accent-200 bg-accent-50/60 p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">Privacy-friendly Default</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">JobRadar soll standardmaessig ohne Marketing-Tracking, ohne externe Werbe-Pixel und ohne unnoetige Drittanbieter-Widgets funktionieren. Ein Cookie-Banner ist nur erforderlich, wenn nicht notwendige Cookies oder Tracking spaeter aktiviert werden.</p>
          </section>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
