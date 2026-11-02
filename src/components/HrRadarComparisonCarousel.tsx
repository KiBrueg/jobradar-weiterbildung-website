import { useCallback, useEffect, useMemo, useState } from 'react';
import { Brain, ChevronLeft, ChevronRight, Clock, Euro, Radar, Target, TrendingUp } from 'lucide-react';

const MANUAL_HOURS_PER_FOCUS = 6;
const RADAR_REVIEW_HOURS_PER_FOCUS = 2;
const HOURLY_COST = 65;
const WEEKS_PER_YEAR = 48;

const SLIDES = [
  { label: '01 Research-Aufwand', icon: Clock },
  { label: '02 Die Research-Queue', icon: Radar },
  { label: '03 Zeitvergleich', icon: TrendingUp },
  { label: '04 Kapazitätswert', icon: Euro },
  { label: '05 Mandatsfokus', icon: Brain },
] as const;

function Bar({ label, value, max, valueLabel, tone }: { label: string; value: number; max: number; valueLabel: string; tone: 'rose' | 'accent' | 'brand' }) {
  const colors = { rose: 'bg-rose-500', accent: 'bg-accent-500', brand: 'bg-brand-600' };
  return <div>
    <div className="mb-1 flex items-baseline justify-between"><span className="text-xs font-medium text-ink-600">{label}</span><span className="text-sm font-bold text-ink-900">{valueLabel}</span></div>
    <div className="h-6 w-full overflow-hidden rounded-full bg-ink-100"><div className={`h-full rounded-full transition-all duration-700 ${colors[tone]}`} style={{ width: `${Math.round((value / max) * 100)}%` }} /></div>
  </div>;
}

function SectionLabel({ children, tone = 'brand' }: { children: React.ReactNode; tone?: 'rose' | 'brand' | 'accent' }) {
  const colors = { rose: 'bg-rose-50 text-rose-600', brand: 'bg-brand-50 text-brand-600', accent: 'bg-accent-50 text-accent-700' };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${colors[tone]}`}>{children}</span>;
}

function SlideResearch() {
  const tasks = [
    ['Vergaben, Register & Bekanntmachungen sichten', '90–120 Min', '🔎'],
    ['Firmen- und Projektkontext prüfen', '60–90 Min', '🏢'],
    ['Relevanz fürs Mandat einordnen', '60–90 Min', '🎯'],
    ['Quellen, Notizen & nächste Schritte dokumentieren', '45–60 Min', '📝'],
  ];
  return <div className="grid items-start gap-6 md:grid-cols-2">
    <div className="space-y-4">
      <SectionLabel tone="rose">Manuelle Marktbeobachtung</SectionLabel>
      <h3 className="font-display text-2xl font-semibold text-ink-900">Was Research vor einer sichtbaren Vakanz kostet</h3>
      <div className="space-y-3">{tasks.map(([task, time, icon]) => <div key={task} className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/60 px-4 py-3"><span className="text-lg">{icon}</span><span className="flex-1 text-sm text-ink-700">{task}</span><span className="whitespace-nowrap rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600">{time}</span></div>)}</div>
      <div className="space-y-2 text-sm text-rose-700"><p>✕ Quellen liegen verteilt und sind schwer vergleichbar</p><p>✕ Kontext muss pro Signal neu recherchiert werden</p><p>✕ Potenzielle Anlässe werden oft erst spät priorisiert</p></div>
      <div className="rounded-xl bg-rose-600 px-5 py-4 text-white"><p className="text-xs font-semibold uppercase tracking-wide text-rose-200">Beispielannahme pro Research-Fokus / Woche</p><p className="mt-1 text-3xl font-bold">ca. {MANUAL_HOURS_PER_FOCUS} Stunden</p><p className="mt-0.5 text-sm text-rose-200">Öffentliche Quellen, Kontextprüfung und Dokumentation</p></div>
    </div>
    <div className="space-y-4">
      <SectionLabel tone="rose">Transparente Annahmen</SectionLabel>
      <h3 className="font-display text-2xl font-semibold text-ink-900">Die Rechnung bleibt nachvollziehbar</h3>
      <Bar label="1 Research-Fokus — manuell" value={MANUAL_HOURS_PER_FOCUS} max={20} valueLabel={`${MANUAL_HOURS_PER_FOCUS} Std/Wo`} tone="rose" />
      <Bar label="3 parallele Research-Foki — manuell" value={MANUAL_HOURS_PER_FOCUS * 3} max={20} valueLabel={`${MANUAL_HOURS_PER_FOCUS * 3} Std/Wo`} tone="rose" />
      <div className="space-y-2">{[
        ['1 Fokus × 6 Std/Wo × 48 Wochen', `${MANUAL_HOURS_PER_FOCUS * WEEKS_PER_YEAR} Std/Jahr`],
        ['bei internem Kalkulationssatz von 65 €/Std', `€ ${(MANUAL_HOURS_PER_FOCUS * WEEKS_PER_YEAR * HOURLY_COST).toLocaleString('de-DE')} Zeitwert/Jahr`],
      ].map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-xl border border-rose-200 bg-white px-4 py-3"><span className="text-xs text-ink-500">{label}</span><span className="ml-3 text-right text-base font-bold text-rose-600">{value}</span></div>)}</div>
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><strong>Keine Preisbehauptung:</strong> Das ist ein Rechenbeispiel für gebundene Research-Kapazität, nicht die Zusage einer Einsparung.</div>
    </div>
  </div>;
}

function SlideQueue() {
  return <div className="grid items-start gap-6 md:grid-cols-2">
    <div className="space-y-4"><SectionLabel>Mandat Radar · Pilotlogik</SectionLabel><h3 className="font-display text-2xl font-semibold text-ink-900">Aus verstreuten Treffern wird eine prüfbare Queue</h3>
      <div className="space-y-3">{[
        ['Quellencluster nach Region, Branche & Mandat', 'konfigurierbar', '🧭'],
        ['Signal mit Fundstelle und Kontext', 'nachvollziehbar', '📌'],
        ['Priorisierung für die menschliche Prüfung', 'Research bleibt menschlich', '🧑‍💼'],
        ['Notiz und nächste Recherchefrage', 'ansprechbar', '✍️'],
      ].map(([task, value, icon]) => <div key={task} className="flex items-center gap-3 rounded-xl border border-accent-100 bg-accent-50/60 px-4 py-3"><span className="text-lg">{icon}</span><span className="flex-1 text-sm text-ink-700">{task}</span><span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-700">{value}</span></div>)}</div>
      <div className="grid grid-cols-3 gap-3">{[['3', 'Signalcluster'], ['1', 'Research-Queue'], ['100 %', 'Quelle & Kontext']].map(([value, label]) => <div key={label} className="rounded-xl border border-accent-200 bg-white px-3 py-3 text-center"><p className="text-xl font-bold text-accent-600">{value}</p><p className="mt-0.5 text-xs text-ink-500">{label}</p></div>)}</div>
    </div>
    <div className="space-y-4"><SectionLabel tone="accent">Was automatisiert wird</SectionLabel><h3 className="font-display text-2xl font-semibold text-ink-900">Vorsortieren statt entscheiden</h3>
      <div className="grid grid-cols-2 gap-3">{[
        ['Quellenstruktur', 'einmal definieren', 'bg-brand-600'],
        ['Fundstellen', 'geordnet erfassen', 'bg-accent-600'],
        ['Prüfqueue', 'statt Tabs & Notizen', 'bg-accent-600'],
        ['Review', 'immer menschlich', 'bg-brand-600'],
      ].map(([value, label, color]) => <div key={value} className={`${color} rounded-xl p-4 text-white`}><p className="text-base font-bold">{value}</p><p className="mt-1 text-xs text-white/75">{label}</p></div>)}</div>
      <div className="rounded-xl border border-brand-200 bg-brand-50 px-5 py-4"><p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Realistische Wirkung im Pilot</p><p className="mt-1 text-2xl font-bold text-brand-900">Research wird strukturierter</p><p className="mt-1 text-sm text-brand-700">Nicht jede öffentliche Meldung ist ein Mandat. Mandat Radar macht sie nur früher und prüfbar sichtbar.</p></div>
    </div>
  </div>;
}

function SlideComparison() {
  const manual = MANUAL_HOURS_PER_FOCUS;
  const radar = RADAR_REVIEW_HOURS_PER_FOCUS;
  const saved = manual - radar;
  const savedPercent = Math.round((saved / manual) * 100);
  return <div className="space-y-6"><div className="text-center"><SectionLabel tone="accent">Direktvergleich</SectionLabel><h3 className="mt-3 font-display text-2xl font-semibold text-ink-900">Zeitaufwand: manuelle Marktbeobachtung vs. Mandat Radar</h3><p className="mt-1 text-sm text-ink-500">Beispielannahme · ein Research-Fokus pro Woche</p></div>
    <div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-rose-200 bg-rose-50 p-5"><div className="mb-3 flex items-center gap-2"><span className="text-2xl">👤</span><span className="font-semibold text-ink-800">Manuell</span><span className="ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">verteilt</span></div><p className="mb-3 text-xs text-ink-400">Pro Research-Fokus / Woche</p><div className="space-y-2">{[['Quellen sichten', 120], ['Kontext prüfen', 90], ['Priorisieren', 90], ['Dokumentieren', 60]].map(([label, min]) => <div key={label as string} className="flex items-center gap-2 text-sm"><span className="w-32 shrink-0 text-ink-600">{label}</span><div className="h-5 flex-1 overflow-hidden rounded bg-rose-100"><div className="h-full rounded bg-rose-500" style={{ width: `${(Number(min) / 120) * 100}%` }} /></div><span className="w-14 text-right text-xs font-semibold text-rose-700">{min} Min</span></div>)}</div><div className="mt-4 border-t border-rose-200 pt-3"><div className="flex justify-between"><span className="text-sm text-rose-600">Gesamt</span><span className="text-2xl font-bold text-rose-600">{manual} Std/Wo</span></div></div></div>
      <div className="rounded-2xl border border-accent-200 bg-accent-50 p-5"><div className="mb-3 flex items-center gap-2"><span className="text-2xl">📡</span><span className="font-semibold text-ink-800">Mandat Radar</span><span className="ml-auto rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-700">Research-Queue</span></div><p className="mb-3 text-xs text-ink-400">Pro Research-Fokus / Woche</p><div className="space-y-2">{[['Quellen strukturieren', 0], ['Signale vorsortieren', 0], ['Kontext auffindbar machen', 0], ['Menschlicher Review', 120]].map(([label, min]) => <div key={label as string} className="flex items-center gap-2 text-sm"><span className="w-32 shrink-0 text-ink-600">{label}</span><div className="h-5 flex-1 overflow-hidden rounded bg-accent-100">{Number(min) ? <div className="h-full rounded bg-accent-500" style={{ width: `${(Number(min) / 120) * 100}%` }} /> : <span className="px-2 text-xs font-medium text-accent-700">✓ vorbereitet</span>}</div><span className="w-14 text-right text-xs font-semibold text-accent-700">{Number(min) ? `${min} Min` : ''}</span></div>)}</div><div className="mt-4 border-t border-accent-200 pt-3"><div className="flex justify-between"><span className="text-sm text-accent-600">Review-Aufwand</span><span className="text-2xl font-bold text-accent-600">{radar} Std/Wo</span></div></div></div></div>
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-ink-900 px-6 py-4 text-white"><div><p className="text-xs uppercase tracking-wide text-ink-400">Freie Research-Kapazität</p><p className="text-3xl font-bold">{saved} Std <span className="text-lg font-normal text-ink-400">/ Woche</span></p></div><div className="hidden h-8 w-px bg-ink-700 md:block" /><div><p className="text-xs uppercase tracking-wide text-ink-400">Zeitreduktion</p><p className="text-3xl font-bold text-accent-400">{savedPercent} %</p></div><div className="hidden h-8 w-px bg-ink-700 md:block" /><div><p className="text-xs uppercase tracking-wide text-ink-400">Was bleibt</p><p className="text-sm font-semibold">Qualitätsprüfung & Ansprache</p></div></div>
  </div>;
}

function SlideCapacity() {
  const [focuses, setFocuses] = useState(1);
  const calculation = useMemo(() => {
    const savedHours = focuses * (MANUAL_HOURS_PER_FOCUS - RADAR_REVIEW_HOURS_PER_FOCUS) * WEEKS_PER_YEAR;
    return { savedHours, value: savedHours * HOURLY_COST, manual: focuses * MANUAL_HOURS_PER_FOCUS * WEEKS_PER_YEAR, review: focuses * RADAR_REVIEW_HOURS_PER_FOCUS * WEEKS_PER_YEAR };
  }, [focuses]);
  return <div className="space-y-6"><div className="text-center"><SectionLabel tone="accent">Beispielrechnung</SectionLabel><h3 className="mt-3 font-display text-2xl font-semibold text-ink-900">Kapazitätswert transparent berechnen</h3><p className="mt-1 text-sm text-ink-500">Ohne Lizenz- oder Pilotpreis: nur der potenzielle Wert freier interner Research-Zeit.</p></div>
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Anzahl paralleler Research-Foki">{[1, 3, 5].map((n) => <button key={n} onClick={() => setFocuses(n)} className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${focuses === n ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50'}`}>{n} {n === 1 ? 'Fokus' : 'Foki'}</button>)}</div>
    <div className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-rose-200 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Ohne Mandat Radar</p><div className="mt-4 space-y-2 text-sm text-ink-700"><p className="flex justify-between"><span>Research-Foki</span><strong>{focuses}</strong></p><p className="flex justify-between"><span>6 Std/Wo je Fokus</span><strong>{focuses * MANUAL_HOURS_PER_FOCUS} Std</strong></p><p className="flex justify-between"><span>48 Wochen/Jahr</span><strong>{calculation.manual} Std</strong></p><p className="mt-3 flex justify-between border-t border-rose-100 pt-3 font-semibold"><span>Zeitwert bei €65/Std</span><span className="text-rose-600">€ {(calculation.manual * HOURLY_COST).toLocaleString('de-DE')}</span></p></div></div>
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Mit Mandat Radar · Review</p><div className="mt-4 space-y-2 text-sm text-ink-700"><p className="flex justify-between"><span>Research-Foki</span><strong>{focuses}</strong></p><p className="flex justify-between"><span>2 Std/Wo je Fokus</span><strong>{focuses * RADAR_REVIEW_HOURS_PER_FOCUS} Std</strong></p><p className="flex justify-between"><span>48 Wochen/Jahr</span><strong>{calculation.review} Std</strong></p><p className="mt-3 flex justify-between border-t border-brand-200 pt-3 font-semibold"><span>Review-Zeitwert</span><span className="text-brand-700">€ {(calculation.review * HOURLY_COST).toLocaleString('de-DE')}</span></p></div></div>
      <div className="flex flex-col justify-between rounded-2xl bg-accent-600 p-5 text-white"><p className="text-xs font-semibold uppercase tracking-wide text-accent-200">Freie Kapazität</p><div><p className="text-4xl font-bold">{calculation.savedHours} Std</p><p className="mt-1 text-sm text-accent-200">pro Jahr für Mandatsarbeit, Ansprache und Bewertung</p></div><div className="mt-4 border-t border-accent-500 pt-3"><p className="text-sm text-accent-200">Brutto-Kapazitätswert</p><p className="text-2xl font-bold">€ {calculation.value.toLocaleString('de-DE')}</p></div></div></div>
    <p className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-center text-xs leading-relaxed text-ink-600">Formel: {focuses} Fokus{focuses > 1 ? 'se' : ''} × ({MANUAL_HOURS_PER_FOCUS} Std manuell − {RADAR_REVIEW_HOURS_PER_FOCUS} Std Review) × {WEEKS_PER_YEAR} Wochen × € {HOURLY_COST}/Std. Die tatsächliche Wirkung hängt von Quellen, Mandat, Workflow und Prüfungstiefe ab.</p>
  </div>;
}

function SlideFocus() {
  return <div className="space-y-6"><div className="text-center"><SectionLabel>Was mit der Zeit passiert</SectionLabel><h3 className="mt-3 font-display text-2xl font-semibold text-ink-900">Research-Kapazität wird Mandatsqualität</h3><p className="mt-1 text-sm text-ink-500">Nicht „weniger Arbeit“, sondern mehr Zeit für die wertvolleren Schritte.</p></div>
    <div className="grid gap-5 md:grid-cols-2"><div className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50 p-5"><div className="flex items-center gap-2"><Clock className="h-5 w-5 text-rose-600" /><span className="font-semibold">Ohne strukturierte Frühindikatoren</span></div>{[['Quellen suchen & öffnen', 35], ['Kontext manuell zusammensuchen', 30], ['Listen, Notizen & Duplikate', 20], ['Ansprache & Mandatsstrategie', 15]].map(([label, pct]) => <div key={label as string}><div className="mb-1 flex justify-between text-xs"><span className="text-ink-600">{label}</span><strong>{pct} %</strong></div><div className="h-4 overflow-hidden rounded-full bg-rose-100"><div className="h-full rounded-full bg-rose-500" style={{ width: `${pct}%` }} /></div></div>)}<div className="rounded-xl bg-rose-600 px-4 py-3 text-sm text-white"><strong>85 % der Zeit</strong> bleiben in Suche, Kontext und Dokumentation gebunden.</div></div>
      <div className="space-y-4 rounded-2xl border border-brand-200 bg-brand-50 p-5"><div className="flex items-center gap-2"><Target className="h-5 w-5 text-brand-700" /><span className="font-semibold">Mit Mandat Radar als Research-Schicht</span></div>{[['Mandats-Hypothesen & Zielunternehmen', 35], ['Qualitätsprüfung der Signale', 25], ['Personalisierte Erstansprache', 25], ['Marktgespräch & Beratung', 15]].map(([label, pct]) => <div key={label as string}><div className="mb-1 flex justify-between text-xs"><span className="text-ink-600">{label}</span><strong>{pct} %</strong></div><div className="h-4 overflow-hidden rounded-full bg-brand-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} /></div></div>)}<div className="rounded-xl bg-brand-700 px-4 py-3 text-sm text-white"><strong>100 % der Zeit</strong> bleibt Research-Zeit – aber mit mehr Fokus auf Bewertung und Ansprache.</div></div></div>
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">{[['🎯', 'Mandats-Hypothese', 'Signale in eine konkrete Recherchefrage übersetzen'], ['🧩', 'Kontextprüfung', 'Entscheider, Projekt und Timing fachlich einordnen'], ['✉️', 'Ansprache', 'Relevante, fundierte Kontaktpunkte vorbereiten'], ['🛡️', 'QA', 'Keine Meldung ungeprüft als Lead ausgeben']].map(([icon, title, text]) => <article key={title} className="rounded-xl bg-ink-50 p-4"><p className="text-2xl">{icon}</p><h4 className="mt-2 text-sm font-semibold">{title}</h4><p className="mt-1 text-xs leading-snug text-ink-500">{text}</p></article>)}</div>
  </div>;
}

const CONTENT = [SlideResearch, SlideQueue, SlideComparison, SlideCapacity, SlideFocus];

export default function HrRadarComparisonCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const next = useCallback(() => setActive((i) => (i + 1) % SLIDES.length), []);
  const previous = useCallback(() => setActive((i) => (i - 1 + SLIDES.length) % SLIDES.length), []);
  useEffect(() => { if (paused) return; const timer = window.setInterval(next, 9000); return () => window.clearInterval(timer); }, [next, paused]);
  const Slide = CONTENT[active];
  return <div className="card overflow-hidden shadow-lift" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
    <div className="flex overflow-x-auto border-b border-ink-200 bg-white px-2" role="tablist" aria-label="Mandat Radar Nutzenvergleich">{SLIDES.map((slide, index) => <button key={slide.label} role="tab" aria-selected={active === index} onClick={() => setActive(index)} className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors sm:px-5 sm:text-sm ${active === index ? 'border-ink-900 text-ink-900' : 'border-transparent text-ink-400 hover:text-ink-700'}`}><slide.icon className="h-4 w-4" />{slide.label}</button>)}</div>
    <div className="min-h-[570px] p-5 sm:p-7"><Slide /></div>
    <div className="flex items-center justify-between border-t border-ink-200 bg-white px-5 py-4"><div className="flex gap-1.5">{SLIDES.map((slide, index) => <button key={slide.label} onClick={() => setActive(index)} className={`h-2 w-2 rounded-full ${active === index ? 'w-5 bg-ink-900' : 'bg-ink-300'}`} aria-label={`Zu ${slide.label}`} />)}</div><div className="flex items-center gap-3"><span className="text-xs text-ink-400">{active + 1} / {SLIDES.length}</span><button onClick={previous} className="rounded-lg border border-ink-200 p-2 text-ink-500 hover:bg-ink-50" aria-label="Vorherige Ansicht"><ChevronLeft className="h-4 w-4" /></button><button onClick={next} className="rounded-lg border border-ink-200 p-2 text-ink-500 hover:bg-ink-50" aria-label="Nächste Ansicht"><ChevronRight className="h-4 w-4" /></button></div></div>
  </div>;
}
