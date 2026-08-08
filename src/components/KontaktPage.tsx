import { ArrowLeft, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { goLanding, goDatenschutz } from '@/App';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <PublicHeader />
      <main id="main-content" className="mx-auto max-w-4xl px-5 sm:px-8 py-12 md:py-16">
        <button onClick={goLanding} className="btn-ghost mb-8">
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Übersicht
        </button>

        <section className="card p-7 md:p-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Kontakt / Pilot</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mt-2">Kontakt</h1>
            <p className="mt-4 text-ink-600 leading-relaxed max-w-2xl">
              Für Pilotgespräche, Fragen zum Produkt oder zur Integration in Ihren Kursplan — schreiben Sie uns direkt an.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <div className="card-soft p-5">
              <Mail className="h-6 w-6 text-brand-700 mb-3" />
              <h2 className="font-display text-lg font-semibold">E-Mail</h2>
              <p className="mt-2 text-sm text-ink-600">
                <a href="mailto:kontakt@kibrueg.de" className="text-brand-700 font-medium hover:underline">
                  kontakt@kibrueg.de
                </a>
              </p>
            </div>
            <div className="card-soft p-5">
              <MessageSquare className="h-6 w-6 text-brand-700 mb-3" />
              <h2 className="font-display text-lg font-semibold">Pilotgespräch</h2>
              <p className="mt-2 text-sm text-ink-600">
                Kostenloses Erstgespräch — wir richten ein erstes Kursprofil gemeinsam ein.
              </p>
            </div>
            <div className="card-soft p-5">
              <ShieldCheck className="h-6 w-6 text-brand-700 mb-3" />
              <h2 className="font-display text-lg font-semibold">Datenschutz</h2>
              <p className="mt-2 text-sm text-ink-600">
                Ihre Anfrage wird vertraulich behandelt. Keine Weitergabe an Dritte.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-200 bg-white p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold text-ink-900 mb-1">Pilotanfrage senden</h2>
            <p className="text-sm text-ink-500 mb-4">
              Schreiben Sie uns per E-Mail — wir melden uns in der Regel innerhalb von 24 Stunden.
            </p>
            <p className="text-base font-semibold text-ink-900 select-all">kontakt@kibrueg.de</p>
            <p className="mt-4 text-xs text-ink-400">
              Datenschutzhinweis: Ihre Anfrage wird ausschließlich zur Bearbeitung und Kontaktaufnahme genutzt. Weitere Informationen in unserer{' '}
              <button
                onClick={goDatenschutz}
                className="underline hover:text-ink-700 transition-colors"
              >
                Datenschutzerklärung
              </button>.
            </p>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
