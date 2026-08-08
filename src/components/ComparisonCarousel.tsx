import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Clock, Euro, TrendingUp, Zap, Brain } from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────────────────────── */

const SLIDES = [
  {
    id: 'problem',
    label: '01 Das Problem',
    icon: Clock,
    color: 'rose',
  },
  {
    id: 'automation',
    label: '02 Die Lösung',
    icon: Zap,
    color: 'brand',
  },
  {
    id: 'comparison',
    label: '03 Zeitvergleich',
    icon: TrendingUp,
    color: 'accent',
  },
  {
    id: 'roi',
    label: '04 Ihr ROI',
    icon: Euro,
    color: 'accent',
  },
  {
    id: 'coaching',
    label: '05 Coaching-Fokus',
    icon: Brain,
    color: 'brand',
  },
] as const;

/* ─── Inline Bar Chart ───────────────────────────────────────────────────── */

function BarChart({ bars }: { bars: { label: string; value: number; max: number; color: string; unit: string }[] }) {
  return (
    <div className="space-y-3 w-full">
      {bars.map((b) => (
        <div key={b.label}>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs font-medium text-ink-600">{b.label}</span>
            <span className="text-sm font-bold text-ink-900">{b.value}{b.unit}</span>
          </div>
          <div className="h-6 w-full rounded-full bg-ink-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.round((b.value / b.max) * 100)}%`, background: b.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Slides ─────────────────────────────────────────────────────────────── */

function SlideProblem() {
  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      {/* Left: Pain */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 uppercase tracking-wide">
          Manuelle Recherche
        </div>
        <h3 className="font-display text-2xl font-semibold text-ink-900">
          Was Berater heute täglich leisten
        </h3>
        <div className="space-y-3">
          {[
            { task: 'Stellensuche auf Jobportalen', time: '60–90 Min', icon: '🔍' },
            { task: 'Passende Stellen filtern & prüfen', time: '30–45 Min', icon: '📋' },
            { task: 'Anforderungen mit Klientprofil abgleichen', time: '30–45 Min', icon: '🤝' },
            { task: 'Report & Dokumentation erstellen', time: '20–30 Min', icon: '📄' },
          ].map((row) => (
            <div key={row.task} className="flex items-center gap-3 rounded-xl bg-rose-50/60 border border-rose-100 px-4 py-3">
              <span className="text-lg shrink-0">{row.icon}</span>
              <span className="flex-1 text-sm text-ink-700">{row.task}</span>
              <span className="shrink-0 text-xs font-semibold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                {row.time}
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[
            { icon: '❌', text: 'Nur 3–8 Quellen gleichzeitig im Blick' },
            { icon: '❌', text: 'Nur 15–20 % des Marktes wird erfasst' },
            { icon: '❌', text: 'Hohe Fehlerquote & Doppelarbeit' },
          ].map((r) => (
            <div key={r.text} className="flex items-center gap-2 text-sm text-rose-700">
              <span>{r.icon}</span><span>{r.text}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-rose-600 px-5 py-4 text-white">
          <div className="text-xs font-semibold uppercase tracking-wide text-rose-200 mb-1">Pro Berater / Woche (Recherche gesamt)</div>
          <div className="text-3xl font-bold">ca. 5 Stunden</div>
          <div className="text-rose-200 text-sm mt-0.5">≈ 30 Min pro Klient · 10 Klienten · <strong className="text-white">bis zu 8.000 € / Jahr</strong></div>
        </div>
      </div>

      {/* Right: Cost breakdown */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 uppercase tracking-wide">
          Kostentreiber
        </div>
        <h3 className="font-display text-2xl font-semibold text-ink-900">
          Was das kostet
        </h3>

        <BarChart bars={[
          { label: '1 Berater (10 Klienten) — Recherche', value: 5, max: 40, color: '#f43f5e', unit: ' Std/Wo' },
          { label: '2 Berater (20 Klienten) — Recherche', value: 10, max: 40, color: '#f43f5e', unit: ' Std/Wo' },
        ]} />

        <div className="space-y-2">
          {[
            { label: '1 Berater × 3–5 Std/Wo × 50 Wochen', value: '€ 8.000', sub: 'Personalkosten Recherche pro Jahr' },
            { label: '2 Berater × 10 Klienten je', value: '€ 16.000', sub: 'pro Jahr bei Skalierung' },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between rounded-xl border border-rose-200 bg-white px-4 py-3">
              <div>
                <div className="text-xs text-ink-500">{r.label}</div>
                <div className="text-xs text-ink-400 mt-0.5">{r.sub}</div>
              </div>
              <div className="text-lg font-bold text-rose-600 shrink-0 ml-3">{r.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '3–8', label: 'Quellen' },
            { value: '~250', label: 'Stellen / Monat' },
            { value: '20–50', label: 'Relevante Treffer' },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-rose-200 bg-white px-3 py-3 text-center">
              <div className="text-xl font-bold text-rose-600">{k.value}</div>
              <div className="text-xs text-ink-500 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <strong>Bis zu 8.000 € / Jahr</strong> — für Aufgaben, die kein Fachwissen brauchen.
        </div>
      </div>
    </div>
  );
}

function SlideAutomation() {
  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 uppercase tracking-wide">
          JobRadar Automatisierung
        </div>
        <h3 className="font-display text-2xl font-semibold text-ink-900">
          Was JobRadar täglich erledigt
        </h3>
        <div className="space-y-3">
          {[
            { task: 'Jobportale + 2.000+ Firmenseiten via Gelbe Seiten', value: '81/Tag', icon: '🤖' },
            { task: 'KI-gestützte Anforderungsanalyse', value: '99,7 %', icon: '🧠' },
            { task: 'Automatischer Abgleich mit Kursprofil', value: '<1 Sek', icon: '⚡' },
            { task: 'Fit-Score & Report generieren', value: '0 Min', icon: '📊' },
          ].map((row) => (
            <div key={row.task} className="flex items-center gap-3 rounded-xl bg-accent-50/60 border border-accent-100 px-4 py-3">
              <span className="text-lg shrink-0">{row.icon}</span>
              <span className="flex-1 text-sm text-ink-700">{row.task}</span>
              <span className="shrink-0 text-xs font-semibold text-accent-700 bg-accent-100 px-2 py-0.5 rounded-full">
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '2.200+', label: 'Quellen' },
            { value: '~2.400', label: 'Stellen / Monat' },
            { value: '394+', label: 'Relevante Treffer' },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-accent-200 bg-white px-3 py-3 text-center">
              <div className="text-xl font-bold text-accent-600">{k.value}</div>
              <div className="text-xs text-ink-500 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-accent-600 px-5 py-4 text-white">
          <div className="text-xs font-semibold uppercase tracking-wide text-accent-200 mb-1">Manuelle Recherchezeit pro Klient</div>
          <div className="text-3xl font-bold">0 Stunden</div>
          <div className="text-accent-200 text-sm mt-0.5">JobRadar läuft <strong className="text-white">24/7 automatisch</strong></div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 uppercase tracking-wide">
          Zahlen aus dem System
        </div>
        <h3 className="font-display text-2xl font-semibold text-ink-900">Live-Metriken
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {[
            { value: '2.200+', label: 'Seiten überwacht', color: 'bg-brand-600' },
            { value: '~2.400', label: 'Stellen / Monat', color: 'bg-accent-600' },
            { value: '394+', label: 'Relevante Treffer', color: 'bg-accent-600' },
            { value: '0–100', label: 'KI-Relevanz-Score', color: 'bg-brand-600' },
          ].map((m) => (
            <div key={m.label} className={`${m.color} rounded-xl p-4 text-white`}>
              <div className="text-2xl font-bold">{m.value}</div>
              <div className="text-xs text-white/70 mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {[
            { label: 'LinkedIn, StepStone, Indeed', icon: '🌐' },
            { label: 'Bundesagentur für Arbeit', icon: '🏛️' },
            { label: '2.192 Firmenseiten (Gelbe Seiten)', icon: '🕸️' },
            { label: 'Jobportale per Gmail-Agent', icon: '📧' },
            { label: 'RSS Feeds & IMAP', icon: '📡' },
            { label: 'Webhook / Manuell', icon: '🔗' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-sm text-ink-600">
              <span>{s.icon}</span>
              <span>{s.label}</span>
              <span className="ml-auto text-xs text-accent-600 font-medium">✓ aktiv</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideComparison() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-600 uppercase tracking-wide mb-3">
          Direktvergleich
        </div>
        <h3 className="font-display text-2xl font-semibold text-ink-900">
          Zeitaufwand: Mensch vs. JobRadar
        </h3>
        <p className="text-ink-500 text-sm mt-1">Stunden pro Woche · 1 Berater · 10 Klienten</p>
      </div>

      {/* Big visual comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Human */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">👤</span>
            <span className="font-semibold text-ink-800">Manuell</span>
            <span className="ml-auto text-xs text-rose-600 font-medium bg-rose-100 px-2 py-0.5 rounded-full">teuer</span>
          </div>
          <p className="text-xs text-ink-400 mb-2">Pro Klient / Monat</p>
          <div className="space-y-2 mb-4">
            {[
              { label: 'Stellensuche', min: 60 },
              { label: 'Filtern & Prüfen', min: 30 },
              { label: 'Profilabgleich', min: 20 },
              { label: 'Dokumentation', min: 10 },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-2 text-sm">
                <span className="w-32 text-ink-600 shrink-0">{r.label}</span>
                <div className="flex-1 h-5 rounded bg-rose-100 overflow-hidden">
                  <div className="h-full rounded bg-rose-500" style={{ width: `${(r.min / 120) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-rose-700 w-12 text-right">{r.min} Min</span>
              </div>
            ))}
          </div>
          <div className="border-t border-rose-200 pt-3 space-y-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-rose-600">Pro Klient/Monat</span>
              <span className="font-bold text-rose-600">120 Min</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-rose-600">× 10 Klienten</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-rose-600">20 Std/Monat</div>
                <div className="text-xs text-rose-500">= 5 Std/Woche · € 8.000/Jahr</div>
              </div>
            </div>
          </div>
        </div>

        {/* JobRadar */}
        <div className="rounded-2xl border border-accent-200 bg-accent-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🤖</span>
            <span className="font-semibold text-ink-800">JobRadar</span>
            <span className="ml-auto text-xs text-accent-700 font-medium bg-accent-100 px-2 py-0.5 rounded-full">automatisch</span>
          </div>
          <p className="text-xs text-ink-400 mb-2">Pro Klient / Monat</p>
          <div className="space-y-2 mb-4">
            {[
              { label: 'Stellensuche', h: 0 },
              { label: 'Analyse (KI)', h: 0 },
              { label: 'Profilabgleich', h: 0 },
              { label: 'Report Review', min: 30 },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-2 text-sm">
                <span className="w-32 text-ink-600 shrink-0">{r.label}</span>
                <div className="flex-1 h-5 rounded bg-accent-100 overflow-hidden">
                  {r.min
                    ? <div className="h-full rounded bg-accent-500" style={{ width: `${(r.min / 120) * 100}%` }} />
                    : <div className="h-full flex items-center px-2"><span className="text-xs text-accent-600 font-medium">✓ automatisch</span></div>
                  }
                </div>
                <span className="text-xs font-semibold text-accent-700 w-14 text-right">{r.min ? `${r.min} Min` : ''}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-accent-200 pt-3 space-y-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-accent-600">Pro Klient/Monat</span>
              <span className="font-bold text-accent-600">30 Min</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-accent-600">× 10 Klienten</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-accent-600">5 Std/Monat</div>
                <div className="text-xs text-accent-500">nur Review · 1,25 Std/Woche</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="rounded-2xl bg-ink-900 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="text-white">
          <div className="text-xs text-ink-400 uppercase tracking-wide">Zeitersparnis</div>
          <div className="text-3xl font-bold">5 Std <span className="text-ink-400 text-lg font-normal">/ Woche</span></div>
        </div>
        <div className="h-8 w-px bg-ink-700 hidden md:block" />
        <div className="text-white">
          <div className="text-xs text-ink-400 uppercase tracking-wide">Kostenersparnis</div>
          <div className="text-2xl font-bold">bis zu 8.000 € / Jahr</div>
        </div>
        <div className="h-8 w-px bg-ink-700 hidden md:block" />
        <div className="text-white">
          <div className="text-xs text-ink-400 uppercase tracking-wide">Zeitersparnis</div>
          <div className="text-3xl font-bold text-accent-400">75 %</div>
        </div>
      </div>
    </div>
  );
}

function SlideROI() {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-600 uppercase tracking-wide mb-3">
          Return on Investment
        </div>
        <h3 className="font-display text-2xl font-semibold text-ink-900">
          Ihr ROI — konkret gerechnet
        </h3>
        <p className="text-ink-500 text-sm mt-1">Jahresrechnung · 1 Berater · 10 Klienten · 50 Wochen</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Kosten ohne JobRadar */}
        <div className="rounded-2xl border border-rose-200 p-5">
          <div className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-3">Ohne JobRadar</div>
          <div className="space-y-2 text-sm text-ink-700">
            <div className="flex justify-between">
              <span>Berater-Stundenlohn</span>
              <span className="font-medium">€ 32</span>
            </div>
            <div className="flex justify-between">
              <span>Recherche-Std./Woche</span>
              <span className="font-medium">5 Std</span>
            </div>
            <div className="flex justify-between">
              <span>Wochen/Jahr</span>
              <span className="font-medium">50</span>
            </div>
            <div className="border-t border-rose-100 pt-2 mt-2 flex justify-between font-semibold">
              <span>Kosten/Jahr</span>
              <span className="text-rose-600">€ 8.000</span>
            </div>
          </div>
        </div>

        {/* Kosten mit JobRadar */}
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-3">Mit JobRadar</div>
          <div className="space-y-2 text-sm text-ink-700">
            <div className="flex justify-between">
              <span>Review 60 Std/Jahr × €32</span>
              <span className="font-medium">€ 1.920</span>
            </div>
            <div className="flex justify-between">
              <span>JobRadar Pilot/Jahr</span>
              <span className="font-medium">€ 1.788</span>
            </div>
            <div className="border-t border-brand-200 pt-2 mt-2 flex justify-between font-semibold">
              <span>Kosten/Jahr</span>
              <span className="text-brand-700">€ 3.708</span>
            </div>
          </div>
        </div>

        {/* Ersparnis */}
        <div className="rounded-2xl bg-accent-600 text-white p-5 flex flex-col justify-between">
          <div className="text-xs font-semibold text-accent-200 uppercase tracking-wide mb-3">Ersparnis</div>
          <div className="space-y-3">
            <div>
              <div className="text-4xl font-bold">€ 4.292</div>
              <div className="text-accent-200 text-sm">pro Jahr gespart</div>
            </div>
            <div className="border-t border-accent-500 pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-accent-200">Zeitersparnis</span>
                <span className="font-bold">15 Std / Monat</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-accent-200">ROI auf Abo</span>
                <span className="font-bold">+ 240 %</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scale table */}
      <div className="rounded-2xl border border-ink-200 overflow-hidden">
        <div className="bg-ink-50 px-5 py-3 border-b border-ink-200">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Ersparnis nach Berateranzahl (pro Jahr)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50/50">
                <th className="px-4 py-2.5 text-left text-xs text-ink-500 font-semibold">Berater</th>
                <th className="px-4 py-2.5 text-right text-xs text-ink-500 font-semibold">Manuell/Jahr</th>
                <th className="px-4 py-2.5 text-right text-xs text-ink-500 font-semibold">JobRadar/Jahr</th>
                <th className="px-4 py-2.5 text-right text-xs text-ink-500 font-semibold text-accent-700">Ersparnis/Jahr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {[
                { n: 1, manual: 8000, jr: 3708, save: 4292 },
                { n: 3, manual: 24000, jr: 9500, save: 14500 },
                { n: 10, manual: 80000, jr: 23000, save: 57000 },
              ].map((r) => (
                <tr key={r.n} className="hover:bg-ink-50/40">
                  <td className="px-4 py-3 font-medium text-ink-800">{r.n} Berater</td>
                  <td className="px-4 py-3 text-right text-rose-600 font-medium">€ {r.manual.toLocaleString('de-DE')}</td>
                  <td className="px-4 py-3 text-right text-brand-700 font-medium">€ {r.jr.toLocaleString('de-DE')}</td>
                  <td className="px-4 py-3 text-right font-bold text-accent-600">€ {r.save.toLocaleString('de-DE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SlideCoaching() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 uppercase tracking-wide mb-3">
          Das eigentliche Problem
        </div>
        <h3 className="font-display text-2xl font-semibold text-ink-900">
          Zeit für Suche — oder Zeit für Erfolg?
        </h3>
        <p className="text-ink-500 text-sm mt-1">Was ein Coach tun sollte vs. was er tatsächlich tut</p>
      </div>

      {/* Time split before / after */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Before */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">😓</span>
            <span className="font-semibold text-ink-800">Ohne JobRadar</span>
            <span className="ml-auto text-xs text-rose-600 font-medium bg-rose-100 px-2 py-0.5 rounded-full">Ist-Zustand</span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Stellensuche & Filtern', pct: 45, color: '#f43f5e' },
              { label: 'Sortierung & Dokumentation', pct: 25, color: '#fb7185' },
              { label: 'Klientgespräch & Beratung', pct: 20, color: '#fca5a5' },
              { label: 'Interview-Vorbereitung', pct: 10, color: '#fecdd3' },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-600">{r.label}</span>
                  <span className="font-semibold text-ink-700">{r.pct} %</span>
                </div>
                <div className="h-4 w-full rounded-full bg-rose-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-rose-600 px-4 py-3 text-white text-sm">
            <strong>70 % der Arbeitszeit</strong> gehen für Suche &amp; Admin drauf —<br />
            <span className="text-rose-200">kaum Zeit für echte Beratung</span>
          </div>
        </div>

        {/* After */}
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-semibold text-ink-800">Mit JobRadar</span>
            <span className="ml-auto text-xs text-brand-700 font-medium bg-brand-100 px-2 py-0.5 rounded-full">Soll-Zustand</span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Klientgespräch & Beratung', pct: 40, color: '#2563eb' },
              { label: 'Interview-Vorbereitung', pct: 30, color: '#3b82f6' },
              { label: 'Bewerbungs-Taktik & CV', pct: 20, color: '#60a5fa' },
              { label: 'Report-Review (QA)', pct: 10, color: '#93c5fd' },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-600">{r.label}</span>
                  <span className="font-semibold text-ink-700">{r.pct} %</span>
                </div>
                <div className="h-4 w-full rounded-full bg-brand-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-brand-700 px-4 py-3 text-white text-sm">
            <strong>90 % der Zeit</strong> für echtes Coaching —<br />
            <span className="text-brand-200">höhere Vermittlungsquote, zufriedenere Klienten</span>
          </div>
        </div>
      </div>

      {/* What coaches can actually do */}
      <div className="rounded-2xl border border-ink-200 bg-white p-5">
        <div className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-3">
          Was Coaches mit der gewonnenen Zeit tun können
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🎯', title: 'Ziel-Analyse', desc: 'Realistisches Stellenprofil mit dem Klienten erarbeiten' },
            { icon: '📝', title: 'CV-Taktik', desc: 'Lebenslauf auf konkrete Stellen aus dem Report anpassen' },
            { icon: '🗣️', title: 'Interview-Training', desc: 'Vorbereitung auf typische Fragen der Zielbranche' },
            { icon: '📈', title: 'Markt-Briefing', desc: 'Reale Marktlage aus dem JobRadar-Report direkt besprechen' },
          ].map((a) => (
            <div key={a.title} className="rounded-xl bg-ink-50 p-4">
              <div className="text-2xl mb-2">{a.icon}</div>
              <div className="font-semibold text-sm text-ink-800 mb-1">{a.title}</div>
              <div className="text-xs text-ink-500 leading-snug">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SLIDE_CONTENT = [SlideProblem, SlideAutomation, SlideComparison, SlideROI, SlideCoaching];

/* ─── Carousel ───────────────────────────────────────────────────────────── */

export default function ComparisonCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setActive((i) => (i + 1) % SLIDES.length), []);
  const prev = useCallback(() => setActive((i) => (i - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 7000);
    return () => clearInterval(t);
  }, [paused, next]);

  const Slide = SLIDE_CONTENT[active];

  return (
    <div
      className="card shadow-lift overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Tab bar */}
      <div className="flex border-b border-ink-100 overflow-x-auto scrollbar-hide">
        {SLIDES.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => { setActive(i); setPaused(true); }}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 shrink-0 ${
                i === active
                  ? 'border-ink-900 text-ink-900 bg-ink-50/60'
                  : 'border-transparent text-ink-400 hover:text-ink-600 hover:bg-ink-50/40'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Slide content */}
      <div className="p-6 md:p-8 min-h-[480px]" key={active}>
        <div className="animate-fade-up">
          <Slide />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-6 pb-5 border-t border-ink-100 pt-4">
        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); setPaused(true); }}
              className={`rounded-full transition-all ${
                i === active ? 'w-5 h-2 bg-ink-900' : 'w-2 h-2 bg-ink-300 hover:bg-ink-400'
              }`}
            />
          ))}
        </div>

        {/* Prev/Next */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-400">{active + 1} / {SLIDES.length}</span>
          <button
            onClick={() => { prev(); setPaused(true); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50 hover:text-ink-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => { next(); setPaused(true); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50 hover:text-ink-800 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
