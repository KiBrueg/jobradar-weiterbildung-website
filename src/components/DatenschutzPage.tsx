import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { goLanding } from '@/App';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

const sections = [
  {
    title: 'Verantwortlicher',
    body: 'Kirill Brüggemann\nKollatzstraße 2\n14059 Berlin\nDeutschland\n\nE-Mail: kontakt@kibrueg.de\nWeb: kibrueg.de',
  },
  {
    title: 'Welche Daten werden verarbeitet?',
    body: 'Im Rahmen des B2B-Pilotbetriebs werden folgende Daten verarbeitet:\n\n• Kontaktdaten von Bildungseinrichtungen (Name der Einrichtung, Kontakt-E-Mail)\n• Kurs- und Profilinformationen (Kursname, Themenfeld, Suchbegriffe)\n• Technische Server-Logs (IP-Adresse, Zeitstempel, aufgerufene Ressourcen, HTTP-Status)\n\nKeine Endnutzer-Daten, keine Teilnehmerdaten, kein Tracking.',
  },
  {
    title: 'Zweck und Rechtsgrundlage der Verarbeitung',
    body: 'Die Verarbeitung erfolgt ausschließlich zum Betrieb des JobRadar-Matching-Services:\n\n• Kontaktdaten: Zweck Vertragsanbahnung und -erfüllung — Rechtsgrundlage Art. 6 Abs. 1 lit. b DSGVO\n• Server-Logs: Zweck Betrieb, Sicherheit und Fehleranalyse — Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)',
  },
  {
    title: 'Hosting',
    body: 'Der Dienst wird auf einem Virtual Private Server von Hetzner Online GmbH (Industriestr. 25, 91710 Gunzenhausen) gehostet. Der Serverstandort befindet sich in der EU (Deutschland). Mit Hetzner besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO.',
  },
  {
    title: 'KI-Verarbeitung (OpenRouter)',
    body: 'Zur Analyse von Stellenausschreibungen wird OpenRouter Inc. (USA) als KI-Anbieter eingesetzt. Dabei werden ausschließlich öffentliche Stellenbeschreibungen übermittelt — keine personenbezogenen Daten von Kursteilnehmern oder Schulkontakten. Die Übertragung erfolgt verschlüsselt (TLS). Mit OpenRouter besteht eine Datenverarbeitungsvereinbarung.',
  },
  {
    title: 'Speicherdauer',
    body: 'Server-Logs werden nach spätestens 30 Tagen automatisch gelöscht. Kontakt- und Kursprofile werden für die Dauer des Pilotprojekts gespeichert und auf Anfrage jederzeit gelöscht. Nach Beendigung der Geschäftsbeziehung werden personenbezogene Daten gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.',
  },
  {
    title: 'Cookies und Tracking',
    body: 'Es werden keine Marketing-Cookies, kein Google Analytics, kein Meta Pixel und kein Drittanbieter-Tracking eingesetzt. Technisch notwendige Cookies (z. B. Session) können für den sicheren Betrieb erforderlich sein. Ein Cookie-Banner ist daher nicht vorgesehen.',
  },
  {
    title: 'Übertragungssicherheit',
    body: "Alle Verbindungen werden über TLS (HTTPS) verschlüsselt übertragen. Zertifikate werden automatisch über Let's Encrypt ausgestellt und erneuert.",
  },
  {
    title: 'Ihre Rechte als Betroffene Person',
    body: 'Sie haben das Recht auf:\n• Auskunft über gespeicherte Daten (Art. 15 DSGVO)\n• Berichtigung unrichtiger Daten (Art. 16 DSGVO)\n• Löschung (Art. 17 DSGVO)\n• Einschränkung der Verarbeitung (Art. 18 DSGVO)\n• Datenübertragbarkeit (Art. 20 DSGVO)\n• Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)\n\nZur Ausübung dieser Rechte wenden Sie sich an: kontakt@kibrueg.de',
  },
  {
    title: 'Beschwerderecht bei einer Aufsichtsbehörde',
    body: 'Sie haben das Recht, sich bei der zuständigen Datenschutz-Aufsichtsbehörde zu beschweren:\n\nBerliner Beauftragte für Datenschutz und Informationsfreiheit\nMajakowskiring 14–16, 13156 Berlin\nTelefon: +49 30 13889-0\nE-Mail: mailbox@datenschutz-berlin.de\nWeb: datenschutz-berlin.de',
  },
  {
    title: 'Änderungen dieser Datenschutzerklärung',
    body: 'Diese Datenschutzerklärung wird bei wesentlichen Änderungen am Dienst oder der Rechtslage aktualisiert. Die jeweils aktuelle Fassung ist auf dieser Seite abrufbar. Stand: Juli 2026.',
  },
];

export default function DatenschutzPage() {
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
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">DSGVO / Datenschutz</p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Datenschutzerklärung</h1>
            </div>
          </div>

          <div className="grid gap-4">
            {sections.map((s) => (
              <section key={s.title} className="rounded-2xl border border-ink-200 bg-white p-5">
                <h2 className="font-display text-lg font-semibold text-ink-900">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-600 whitespace-pre-line">{s.body}</p>
              </section>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
