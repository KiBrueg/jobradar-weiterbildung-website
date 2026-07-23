import { useState } from 'react';
import { Radar, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';
import { goAdmin, goLanding, goReferenzen } from '@/App';
import { useToast } from '@/components/Toast';
import { PageSection, SectionHeading, IconCard, PlaceholderBanner } from '@/components/references/ui';
import FeedbackStatusCard from '@/components/references/FeedbackStatusCard';
import FutureReviewSources from '@/components/references/FutureReviewSources';
import FeedbackFormMockup from '@/components/references/FeedbackFormMockup';
import CaseStudyTemplate from '@/components/references/CaseStudyTemplate';

export default function ReferencesPage() {
  const { toast } = useToast();
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 overflow-x-hidden">
      <header className="sticky top-0 z-40 glass border-b border-ink-200/60">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex h-16 items-center justify-between">
            <button onClick={goLanding} className="flex items-center gap-2.5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white transition-transform group-hover:scale-105">
                <Radar className="h-5 w-5" />
              </span>
              <span className="font-display text-[17px] font-semibold tracking-tight">
                JobRadar <span className="text-ink-500 font-normal">Weiterbildung</span>
              </span>
            </button>
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
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-700 shadow-soft animate-fade-up">
              <Sparkles className="h-3.5 w-3.5" />
              Pilotphase
            </span>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-ink-900 text-balance leading-[1.05] animate-fade-up">
              Feedback transparent vorbereiten — <span className="text-brand-700">ohne Fake Reviews</span>
            </h1>
            <p className="mt-6 text-lg text-ink-600 leading-relaxed max-w-2xl animate-fade-up">
              JobRadar Weiterbildung befindet sich in der Pilotphase. Diese Seite ist vorbereitet, um spaeter echte Kundenstimmen sauber einzubinden.
            </p>
          </div>
        </div>
      </section>
      <PageSection>
        <SectionHeading eyebrow="Status" title="Aktueller Stand" subtitle="Diese Seite ist bewusst ohne Bewertungen vorbereitet." />
        <FeedbackStatusCard />
      </PageSection>
    </div>
  );
}
