import { useState } from 'react';
import { Radar, ArrowRight, Sparkles } from 'lucide-react';
import { goAdmin, goReferenzen } from '@/App';
import { useToast } from '@/components/Toast';

export default function LandingPage() {
  const { toast } = useToast();
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 overflow-x-hidden">
      <header className="sticky top-0 z-40 glass border-b border-ink-200/60">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-2.5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white transition-transform group-hover:scale-105">
                <Radar className="h-5 w-5" />
              </span>
              <span className="font-display text-[17px] font-semibold tracking-tight">JobRadar <span className="text-ink-500 font-normal">Weiterbildung</span></span>
            </a>
            <div className="flex items-center gap-2">
              <button onClick={() => goAdmin()} className="btn-primary">
                Admin oeffnen
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-ink-600 shadow-soft animate-fade-up">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              Kursbezogener Arbeitsmarkt-Radar fuer Bildungstraeger
            </span>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-ink-900 text-balance leading-[1.05] animate-fade-up">
              Arbeitsmarkt-Radar fuer <span className="text-brand-700">Weiterbildungskurse</span>
            </h1>
            <p className="mt-6 text-lg text-ink-600 leading-relaxed max-w-2xl animate-fade-up">
              JobRadar verbindet Kursprofile mit realistischen Zielberufen, passenden Stellen und woechentlichen Reports.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up">
              <button onClick={() => goAdmin()} className="btn-primary text-base px-5 py-3">
                Admin Demo oeffnen
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
              <button onClick={() => goReferenzen()} className="btn-secondary text-base px-5 py-3">
                Referenzen ansehen
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
