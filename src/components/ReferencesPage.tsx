import { useState } from 'react';
import {
  Radar,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
  ShieldX,
  FileCheck,
  FileBarChart,
  ClipboardCheck,
  Quote,
} from 'lucide-react';
import { goKontakt, goLanding, goReferenzen, goSchool } from '@/App';
import { useToast } from '@/components/Toast';
import PublicFooter from '@/components/PublicFooter';
import { PageSection, SectionHeading, PlaceholderBanner } from '@/components/references/ui';
import FeedbackStatusCard from '@/components/references/FeedbackStatusCard';
import FutureReviewSources from '@/components/references/FutureReviewSources';
import FeedbackFormMockup from '@/components/references/FeedbackFormMockup';
import CaseStudyTemplate from '@/components/references/CaseStudyTemplate';

const navItems = [
  { label: 'Loesung', route: 'landing' as const },
  { label: 'Fuer Bildungstraeger', route: 'landing' as const },
  { label: 'Ablauf', route: 'landing' as const },
  { label: 'Referenzen', route: 'referenzen' as const },
  { label: 'Schulportal', route: 'school' as const },
];

const categories = [
  { icon: Clock, title: 'Zeitersparnis fuer Coaches', desc: 'Wie stark reduziert JobRadar manuelle Recherchezeit pro Kursprofil?' },
  { icon: Target, title: 'Relevanz der gefundenen Stellen', desc: 'Wie passgenau sind die empfohlenen Stellen zum Kursprofil?' },
  { icon: ShieldX, title: 'Qualitaet der Ausschluesse / Red Flags', desc: 'Wie zuverlaessig werden ungeeignete Stellen herausgefiltert?' },
  { icon: FileCheck, title: 'Nutzen fuer Arbeitsmarktnachweis', desc: 'Wie gut lassen sich Reports fuer AZAW-/Bildungsgutschein-Nachweise verwenden?' },
  { icon: FileBarChart, title: 'Verstaendlichkeit der Reports', desc: 'Sind die woechentlichen Reports fuer Coaches und Leitung schnell erfassbar?' },
  { icon: ClipboardCheck, title: 'Umsetzbarkeit im Bewerbungscoaching', desc: 'Wie gut lassen sich Empfehlungen in konkrete Bewerbungsziele uebersetzen?' },
];

const placeholders = [
  { role: 'Career Coach eines Bildungsträgers', initials: 'CB', quote: 'Hier wird später eine freigegebene Aussage zur Zeitersparnis und besseren Vorbereitung im Coaching stehen.' },
  { role: 'Kurskoordination Data & BI', initials: 'DK', quote: 'Hier wird später Feedback zur Qualität der Kursprofile, Suchbegriffe und Ausschlüsse ergänzt.' },
  { role: 'Leitung Bildungsberatung', initials: 'LB', quote: 'Hier wird später eine freigegebene Einschätzung zum Nutzen der Arbeitsmarkt-Reports stehen.' },
];

export default function ReferencesPage() {
  const { toast } = useToast();
  const [mobileNav, setMobileNav] = useState(false);

  const navItem = (n: (typeof navItems)[number]) => {
    setMobileNav(false);
    if (n.route === 'landing') goLanding();
    else if (n.route === 'referenzen') goReferenzen();
    else if (n.route === 'school') goSchool();
  };

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-ink-200/60">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex h-16 items-center justify-between">
            <button onClick={goLanding} className="flex items-center gap-2.5 group" aria-label="JobRadar Weiterbildung Startseite">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white transition-transform group-hover:scale-105">
                <Radar className="h-5 w-5" />
              </span>
              <span className="font-display text-[17px] font-semibold tracking-tight">
                JobRadar <span className="text-ink-500 font-normal">Weiterbildung</span>
              </span>
            </button>
            <nav className="hidden md:flex items-center gap-7" aria-label="Hauptnavigation">
              {navItems.map((n) => (
                <button key={n.label} onClick={() => navItem(n)} className="nav-link" aria-current={n.route === 'referenzen' ? 'page' : undefined}>
                  {n.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <button onClick={() => goSchool()} className="btn-primary">
                Schulportal
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMobileNav((v) => !v)}
                className="md:hidden btn-ghost px-2"
                aria-label={mobileNav ? 'Menue schliessen' : 'Menue oeffnen'}
                aria-expanded={mobileNav}
                aria-controls="mobile-nav-references"
              >
                <span className="text-xl leading-none">{mobileNav ? '\u00d7' : '\u2630'}</span>
              </button>
            </div>
          </div>
          {mobileNav && (
            <nav id="mobile-nav-references" className="md:hidden pb-4 flex flex-col gap-1 animate-fade-in" aria-label="Mobile Navigation">
              {navItems.map((n) => (
                <button
                  key={n.label}
                  onClick={() => navItem(n)}
                  className="text-left px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-100"
                  aria-current={n.route === 'referenzen' ? 'page' : undefined}
                >
                  {n.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main id="main-content" role="main">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            background:
              'linear-gradient(135deg, var(--color-brand-100) 0%, transparent 40%, var(--color-accent-100) 100%)',
            transform: 'perspective(1200px) rotateX(2deg)',
          }}
        />
        <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-accent-100/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-700 shadow-soft animate-fade-up">
              <Sparkles className="h-3.5 w-3.5" />
              Pilotphase
            </span>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-ink-900 text-balance leading-[1.05] animate-fade-up" style={{ animationDelay: '60ms' }}>
              Feedback transparent vorbereiten — <span className="text-brand-700">ohne Fake Reviews</span>
            </h1>
            <p className="mt-6 text-lg text-ink-600 leading-relaxed max-w-2xl animate-fade-up" style={{ animationDelay: '120ms' }}>
              JobRadar Weiterbildung befindet sich in der Pilotphase. Diese Seite ist vorbereitet, um spaeter echte Kundenstimmen, Google-Bewertungen oder Projekt-Feedback sauber und nachvollziehbar einzubinden.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: '180ms' }}>
              <button onClick={() => goKontakt()} className="btn-primary text-base px-5 py-3">
                Pilotgespraech anfragen
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
              <button onClick={() => document.getElementById('fallstudie')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary text-base px-5 py-3">
                Beispiel-Szenarien ansehen
              </button>
            </div>
            <p className="mt-5 text-sm text-ink-500 animate-fade-up" style={{ animationDelay: '240ms' }}>
              Transparenz ist wichtiger als kuenstliche 5-Sterne-Optik.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Current status */}
      <PageSection>
        <SectionHeading
          eyebrow="Status"
          title="Aktueller Stand"
          subtitle="Diese Seite ist bewusst ohne Bewertungen vorbereitet. Sobald echte Pilotprojekte abgeschlossen sind, werden freigegebene Aussagen ergaenzt."
        />
        <FeedbackStatusCard />
      </PageSection>

      {/* SECTION 3: Future review sources */}
      <section className="bg-white border-y border-ink-200/60">
        <PageSection>
          <SectionHeading
            eyebrow="Nachweise"
            title="Welche Nachweise spaeter eingebunden werden koennen"
            subtitle="Vier Quellen, aus denen nach Pilotabschluss echte Referenzen entstehen koennen."
          />
          <FutureReviewSources />
        </PageSection>
      </section>

      {/* SECTION 4: Feedback categories */}
      <PageSection>
        <SectionHeading
          eyebrow="Messung"
          title="Welche Rueckmeldungen wir spaeter messen"
          subtitle="Keine Testimonials, sondern Kategorien, in denen Pilot-Feedback spaeter strukturiert erfasst wird."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c, i) => (
            <div key={c.title} className="card-soft p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 text-ink-600 mb-3">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-ink-900 text-sm">{c.title}</h3>
              <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </PageSection>

      {/* SECTION 5: Placeholder testimonials */}
      <section className="bg-white border-y border-ink-200/60">
        <PageSection>
          <SectionHeading
            eyebrow="Layout"
            title="So werden Kundenstimmen spaeter aussehen"
            subtitle="Jede Karte ist klar als Platzhalter markiert — keine echte Kundenstimme."
          />
          <div className="grid md:grid-cols-3 gap-5">
            {placeholders.map((p, i) => (
              <div key={p.role} className="card-soft p-6 flex flex-col animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-100 text-ink-500 font-display text-sm font-semibold">
                    {p.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{p.role}</p>
                    <PlaceholderBanner>Beispiel-Platzhalter</PlaceholderBanner>
                  </div>
                </div>
                <Quote className="h-6 w-6 text-brand-200 mb-2" />
                <p className="text-sm text-ink-600 italic leading-relaxed flex-1">"{p.quote}"</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-ink-500">
            Nach Pilotprojekten koennen echte Aussagen mit Freigabe anonymisiert oder namentlich ergaenzt werden.
          </p>
        </PageSection>
      </section>

      {/* SECTION 6: Feedback form */}
      <PageSection id="feedback">
        <SectionHeading
          eyebrow="Formular"
          title="Feedback vorbereiten"
          subtitle="Demo-Formular fuer spaetere Pilotprojekte. Daten bleiben nur im Browser."
        />
        <FeedbackFormMockup />
      </PageSection>

      {/* SECTION 7: Case study template */}
      <section id="fallstudie" className="bg-white border-y border-ink-200/60">
        <PageSection>
          <SectionHeading
            eyebrow="Template"
            title="So koennte eine spaetere Case Study aussehen"
            subtitle="Struktur ist vorbereitet — Zahlen und Aussagen werden erst nach einem echten Pilotlauf veroeffentlicht."
          />
          <CaseStudyTemplate />
        </PageSection>
      </section>

      {/* SECTION 8: CTA — light, premium, no solid color block */}
      <PageSection>
        <div className="card p-8 md:p-12 text-center max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-300 via-cyanx-300 to-accent-300 rounded-t-2xl" />
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-ink-900 text-balance">
            Erstes Pilotprojekt starten?
          </h2>
          <p className="mt-4 text-ink-600 leading-relaxed max-w-xl mx-auto">
            Wenn Sie JobRadar Weiterbildung testen moechten, kann ein erstes Kursprofil als Pilot vorbereitet werden — mit transparentem Report und optionaler Feedbackfreigabe.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => goKontakt()} className="btn-primary text-base px-5 py-3">
              Pilot anfragen
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
            <button onClick={() => goSchool()} className="btn-secondary text-base px-5 py-3">
              Schulportal ansehen
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </PageSection>

      </main>
      <PublicFooter />
    </div>
  );
}
