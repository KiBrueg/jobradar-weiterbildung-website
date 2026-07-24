import { useState } from 'react';
import {
  Radar,
  ArrowRight,
  ArrowUpRight,
  Check,
  X,
  School,
  BookOpen,
  Search,
  FileBarChart,
  Users,
  LineChart,
  ShieldCheck,
  GraduationCap,
  Building2,
  Sparkles,
  Quote,
} from 'lucide-react';
import { goAdmin, goBarrierefreiheit, goDatenschutz, goImpressum, goKontakt, goReferenzen } from '@/App';
import { useToast } from '@/components/Toast';

const navItems = [
  { label: 'Loesung', href: '#loesung', action: 'scroll' as const },
  { label: 'Fuer Bildungstraeger', href: '#bildungstraeger', action: 'scroll' as const },
  { label: 'Ablauf', href: '#ablauf', action: 'scroll' as const },
  { label: 'Referenzen', href: '', action: 'referenzen' as const },
  { label: 'Admin Demo', href: '#preview', action: 'scroll' as const },
];

const problems = [
  'Zu viele Jobportale',
  'Zu viele manuelle Suchen',
  'Keine einheitlichen Kursprofile',
  'Schwer nachweisbare Arbeitsmarktrelevanz',
  'Coaches verlieren Zeit mit Recherche',
];

const solutions = [
  'Zentrale Kursprofile',
  'Wiederverwendbare Such-Workflows',
  'Matching pro Kurs',
  'Reports pro Schule/Kurs',
  'Menschliche QA statt Blackbox',
];

const steps = [
  { icon: School, title: 'Schule anlegen', desc: 'Anbieter erfassen, Kontakt und AZAV-Status hinterlegen.' },
  { icon: BookOpen, title: 'Kurse definieren', desc: 'Kursprofile mit Thema, Status und Dokumenten anlegen.' },
  { icon: Search, title: 'Suchprofil pflegen', desc: 'Zielberufe, Skills, Ausschluesse und Quellen festlegen.' },
  { icon: FileBarChart, title: 'Leads & Reports pruefen', desc: 'Gefundene Stellen pruefen, freigeben und exportieren.' },
];

const flow = ['School', 'Courses', 'Search Profile', 'Job Leads', 'Reports'];

const benefits = [
  { icon: Users, title: 'Fuer Coaches', desc: 'Weniger Recherche, bessere Vorbereitung auf Beratungsgespraeche.' },
  { icon: LineChart, title: 'Fuer Management', desc: 'Reports und Nachweise pro Kurs und Schule, jederzeit exportierbar.' },
  { icon: Building2, title: 'Fuer Schulen', desc: 'Skalierbare Kurs- und Arbeitsmarktanalyse ueber alle Standorte.' },
  { icon: GraduationCap, title: 'Fuer Teilnehmende', desc: 'Realistischere Bewerbungsziele, passgenau zum Kursprofil.' },
];

const kpis = [
  { label: 'Schulen', value: '5', icon: School },
  { label: 'Kurse', value: '12', icon: BookOpen },
  { label: 'Suchprofile', value: '9', icon: Search },
  { label: 'Gefundene Leads', value: '184', icon: Radar },
  { label: 'QA offen', value: '17', icon: ShieldCheck },
];

export default function LandingPage() {
  const { toast } = useToast();
  const [mobileNav, setMobileNav] = useState(false);

  const scrollTo = (href: string) => {
    setMobileNav(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };
  const navAction = (n: (typeof navItems)[number]) => {
    if (n.action === 'referenzen') {
      setMobileNav(false);
      goReferenzen();
    } else {
      scrollTo(n.href);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-ink-200/60" role="banner">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-2.5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white transition-transform group-hover:scale-105">
                <Radar className="h-5 w-5" />
              </span>
              <span className="font-display text-[17px] font-semibold tracking-tight">JobRadar <span className="text-ink-500 font-normal">Weiterbildung</span></span>
            </a>
            <nav className="hidden md:flex items-center gap-7" aria-label="Hauptnavigation">
              {navItems.map((n) => (
                <button key={n.label} onClick={() => navAction(n)} className="nav-link">
                  {n.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <button onClick={() => goAdmin()} className="btn-primary">
                Admin oeffnen
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMobileNav((v) => !v)}
                className="md:hidden btn-ghost px-2"
                aria-label="Menü"
                aria-expanded={mobileNav}
                aria-controls="mobile-nav"
              >
                <span className="text-xl leading-none">{mobileNav ? '\u00d7' : '\u2630'}</span>
              </button>
            </div>
          </div>
          {mobileNav && (
            <nav id="mobile-nav" className="md:hidden pb-4 flex flex-col gap-1 animate-fade-in" aria-label="Mobile Navigation">
              {navItems.map((n) => (
                <button key={n.label} onClick={() => navAction(n)} className="text-left px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-100">
                  {n.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle background — Hermes-style: faint imagery visible at an angle */}
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1600')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: 'perspective(1200px) rotateX(2deg)',
          }}
        />
        <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-accent-100/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-ink-600 shadow-soft animate-fade-up">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              Kursbezogener Arbeitsmarkt-Radar fuer Bildungstraeger
            </span>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-ink-900 text-balance leading-[1.05] animate-fade-up" style={{ animationDelay: '60ms' }}>
              Arbeitsmarkt-Radar fuer <span className="text-brand-700">Weiterbildungskurse</span>
            </h1>
            <p className="mt-6 text-lg text-ink-600 leading-relaxed max-w-2xl animate-fade-up" style={{ animationDelay: '120ms' }}>
              JobRadar verbindet Kursprofile mit realistischen Zielberufen, passenden Stellen und woechentlichen Reports — damit Coaches mehr Zeit fuer Beratung haben.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: '180ms' }}>
              <button onClick={() => goAdmin()} className="btn-primary text-base px-5 py-3">
                Admin Demo oeffnen
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
              <button onClick={() => toast('Beispiel-Report wird vorbereitet.', 'info')} className="btn-secondary text-base px-5 py-3">
                Beispiel-Report ansehen
              </button>
            </div>
            <p className="mt-5 text-sm text-ink-500 animate-fade-up" style={{ animationDelay: '240ms' }}>
              Fuer AZAV-/Bildungsgutschein-nahe Kursplanung, Coaching und Arbeitsmarktnachweis.
            </p>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section id="loesung" className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          <div className="card p-7 border-rose-200/60">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <X className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-semibold text-ink-900">Typisches Problem</h2>
            </div>
            <ul className="space-y-3">
              {problems.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-ink-700">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-500">
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-7 border-accent-200/60">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                <Radar className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-semibold text-ink-900">JobRadar Loesung</h2>
            </div>
            <ul className="space-y-3">
              {solutions.map((s) => (
                <li key={s} className="flex items-start gap-3 text-sm text-ink-700">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-600">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="ablauf" className="relative bg-white border-y border-ink-200/60">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">So funktioniert JobRadar</h2>
            <p className="mt-3 text-ink-600">Vom Anbieter bis zum woechentlichen Report — in vier klaren Schritten.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div key={s.title} className="card-soft p-6 hover:shadow-lift transition-shadow animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                    <s.icon className="h-5.5 w-5.5" />
                  </span>
                  <span className="font-display text-2xl font-semibold text-ink-200">{i + 1}</span>
                </div>
                <h3 className="font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          {/* Flow visualization */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {flow.map((f, i) => (
              <div key={f} className="flex items-center gap-2">
                <span className="rounded-full border border-ink-200 bg-ink-50 px-4 py-2 text-xs font-semibold text-ink-700">
                  {f}
                </span>
                {i < flow.length - 1 && <ArrowRight className="h-4 w-4 text-ink-300" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product preview */}
      <section id="preview" className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Vorschau: Admin Dashboard</h2>
          <p className="mt-3 text-ink-600">KPIs, Schulen, Kurse, Suchprofile und Leads — uebersichtlich in einem Tool.</p>
        </div>
        {/* Browser frame mockup */}
        <div className="card p-2 shadow-lift max-w-5xl mx-auto animate-fade-up">
          <div className="rounded-t-xl bg-ink-50 px-4 py-3 flex items-center gap-2 border-b border-ink-200">
            <span className="h-3 w-3 rounded-full bg-rose-300" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-accent-300" />
            <span className="ml-3 text-xs text-ink-400 font-mono">jobradar.app/admin</span>
          </div>
          <div className="p-5 bg-white rounded-b-xl">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-xl border border-ink-200/70 bg-ink-50/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <k.icon className="h-4 w-4 text-ink-400" />
                  </div>
                  <div className="font-display text-2xl font-semibold tabular-nums">{k.value}</div>
                  <div className="text-xs text-ink-500 mt-0.5">{k.label}</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="md:col-span-2 rounded-xl border border-ink-200/70 p-4">
                <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3">Recent Workflow Runs</div>
                <div className="space-y-2">
                  {['Connection Test — completed', 'Flow 4 Job APIs — completed', 'Weekly Report — paused'].map((r) => (
                    <div key={r} className="flex items-center justify-between text-sm border-b border-ink-100 pb-2 last:border-0">
                      <span className="text-ink-700">{r}</span>
                      <ArrowUpRight className="h-4 w-4 text-ink-300" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-ink-200/70 p-4">
                <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3">System Health</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-ink-600">Admin API</span><span className="text-accent-600 font-semibold">Online</span></div>
                  <div className="flex justify-between"><span className="text-ink-600">n8n Bridge</span><span className="text-brand-600 font-semibold">Ready</span></div>
                  <div className="flex justify-between"><span className="text-ink-600">Local DB</span><span className="text-ink-700 font-semibold">SQLite</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-8">
          <button onClick={() => goAdmin()} className="btn-primary text-base px-5 py-3">
            Live Demo oeffnen
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </section>

      {/* Benefits */}
      <section id="bildungstraeger" className="bg-white border-y border-ink-200/60">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Vorteile fuer alle Beteiligten</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b, i) => (
              <div key={b.title} className="card-soft p-6 hover:shadow-lift transition-shadow animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-white mb-4">
                  <b.icon className="h-5.5 w-5.5" />
                </span>
                <h3 className="font-semibold text-ink-900">{b.title}</h3>
                <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referenzen in Vorbereitung */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
        <div className="card p-7 md:p-9 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Pilotphase
            </span>
            <h3 className="mt-3 font-display text-xl md:text-2xl font-semibold tracking-tight text-ink-900">Referenzen in Vorbereitung</h3>
            <p className="mt-2 text-ink-600 leading-relaxed max-w-2xl">
              JobRadar befindet sich in der Pilotphase. Statt kuenstlicher Bewertungen zeigen wir transparent, wie Feedback, Case Studies und Kundenstimmen spaeter eingebunden werden.
            </p>
          </div>
          <button onClick={() => goReferenzen()} className="btn-primary shrink-0">
            Referenzen ansehen
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Quote / Pitch */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 py-20 text-center">
          <Quote className="h-10 w-10 text-brand-300 mx-auto mb-6" />
          <p className="font-display text-2xl md:text-3xl font-medium tracking-tight text-ink-900 leading-snug text-balance">
            „Wir ersetzen keine Coaches. Wir liefern die woechentliche Marktgrundlage."
          </p>
          <p className="mt-5 text-sm text-ink-500">JobRadar Weiterbildung — KI-gestuetzt, menschlich geprueft.</p>
        </div>
      </section>

      {/* CTA — light, premium card, no solid color block */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-16">
        <div className="card p-8 md:p-12 text-center max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-300 via-cyanx-300 to-accent-300 rounded-t-2xl" />
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-ink-900 text-balance">
            Erstes Pilotprojekt starten?
          </h2>
          <p className="mt-4 text-ink-600 leading-relaxed max-w-xl mx-auto">
            Wenn Sie JobRadar Weiterbildung testen moechten, kann ein erstes Kursprofil als Pilot vorbereitet werden — mit transparentem Report und optionaler Feedbackfreigabe.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => toast('Pilot angefragt — Demo', 'info')} className="btn-primary text-base px-5 py-3">
              Pilot anfragen
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
            <button onClick={() => goAdmin()} className="btn-secondary text-base px-5 py-3">
              Zur Admin Demo
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer — minimal, calm, off-white */}
      <footer className="bg-ink-50 border-t border-ink-200" role="contentinfo">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-white">
                  <Radar className="h-4.5 w-4.5" />
                </span>
                <span className="font-display text-[15px] font-semibold text-ink-900">JobRadar Weiterbildung</span>
              </div>
              <p className="mt-3 text-sm text-ink-500">KI-gestuetzt, menschlich geprueft.</p>
            </div>
            <nav className="flex flex-wrap gap-6 text-sm" aria-label="Rechtliche Navigation">
              <button onClick={() => goReferenzen()} className="text-ink-500 hover:text-ink-900 transition-colors">Referenzen</button>
              <button onClick={goImpressum} className="text-ink-500 hover:text-ink-900 transition-colors">Impressum</button>
              <button onClick={goDatenschutz} className="text-ink-500 hover:text-ink-900 transition-colors">Datenschutz</button>
              <button onClick={goBarrierefreiheit} className="text-ink-500 hover:text-ink-900 transition-colors">Barrierefreiheit</button>
              <button onClick={goKontakt} className="text-ink-500 hover:text-ink-900 transition-colors">Kontakt</button>
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-ink-200 text-xs text-ink-400">
            (c) {new Date().getFullYear()} JobRadar Weiterbildung. Local MVP — keine externen API-Aufrufe.
          </div>
        </div>
      </footer>
    </div>
  );
}
