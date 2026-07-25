import { ArrowLeft, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { goLanding } from '@/App';
import { useToast } from '@/components/Toast';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default function KontaktPage() {
  const { toast } = useToast();
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <PublicHeader />
      <main id="main-content" className="mx-auto max-w-4xl px-5 sm:px-8 py-12 md:py-16">
        <button onClick={goLanding} className="btn-ghost mb-8">
          <ArrowLeft className="h-4 w-4" />
          Zurueck zur Uebersicht
        </button>

        <section className="card p-7 md:p-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Kontakt / Pilot</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mt-2">Kontakt</h1>
            <p className="mt-4 text-ink-600 leading-relaxed">Kontaktmoeglichkeiten fuer Pilotgespraeche, Rueckfragen und spaetere Projektanfragen werden hier vorbereitet.</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 mb-8">
            Diese Kontaktseite ist ein Arbeitsstand. Eine finale Kontaktadresse wird vor Veroeffentlichung ergaenzt. Das Formular ist eine Demo und sendet aktuell keine Daten.
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="card-soft p-5">
              <Mail className="h-6 w-6 text-brand-700 mb-3" />
              <h2 className="font-display text-lg font-semibold">E-Mail</h2>
              <p className="mt-2 text-sm text-ink-600">Kontaktadresse wird vor Veroeffentlichung ergaenzt.</p>
            </div>
            <div className="card-soft p-5">
              <MessageSquare className="h-6 w-6 text-brand-700 mb-3" />
              <h2 className="font-display text-lg font-semibold">Pilotgespraech</h2>
              <p className="mt-2 text-sm text-ink-600">Fuer erste Kursprofile, Reports und Feedbackrunden vorbereitet.</p>
            </div>
            <div className="card-soft p-5">
              <ShieldCheck className="h-6 w-6 text-brand-700 mb-3" />
              <h2 className="font-display text-lg font-semibold">Datenschutz</h2>
              <p className="mt-2 text-sm text-ink-600">Keine Teilnehmerdaten fuer eine erste Demo notwendig.</p>
            </div>
          </div>

          <section className="rounded-2xl border border-ink-200 bg-white p-5 mb-8">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-2">Datenschutzhinweis fuer Kontaktaufnahme</h2>
            <p className="text-sm leading-relaxed text-ink-600">Dieses Formular ist eine Demo und sendet aktuell keine Daten. Bei Aktivierung einer echten Kontaktmoeglichkeit werden die uebermittelten Daten ausschliesslich zur Bearbeitung der Anfrage genutzt. Zweck, Speicherdauer und Empfaenger werden vorab dokumentiert.</p>
          </section>

          <form
            className="rounded-2xl border border-ink-200 bg-white p-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast('Demo-Formular: Es wurden keine Daten gesendet.', 'info');
            }}
          >
            <div>
              <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Demo-Formular — sendet noch keine Daten</p>
              <h2 className="font-display text-xl font-semibold text-ink-900 mt-4">Projektanfrage vorbereiten</h2>
            </div>
            <label className="block text-sm font-semibold text-ink-700">
              Name / Organisation
              <input className="mt-1 w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-300" placeholder="Angaben optional" />
            </label>
            <label className="block text-sm font-semibold text-ink-700">
              Anliegen
              <textarea className="mt-1 min-h-28 w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-300" placeholder="z. B. Pilot fuer einen Data-Analytics-Kurs" />
            </label>
            <p className="text-xs text-ink-500">Hinweis: In dieser Demo wird nichts uebertragen. Vor Aktivierung eines echten Formulars werden Datenschutz, Zweck, Speicherdauer und Empfaenger dokumentiert.</p>
            <button type="submit" className="btn-primary">Demo-Anfrage testen</button>
          </form>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
