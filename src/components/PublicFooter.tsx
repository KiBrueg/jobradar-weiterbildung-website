import { Radar } from 'lucide-react';
import {
  goLanding,
  goReferenzen,
  goAdmin,
  goImpressum,
  goDatenschutz,
  goBarrierefreiheit,
  goKontakt,
} from '@/App';

const links = [
  { label: 'Uebersicht', action: goLanding },
  { label: 'Referenzen', action: goReferenzen },
  { label: 'Admin Demo', action: goAdmin },
  { label: 'Impressum', action: goImpressum },
  { label: 'Datenschutz', action: goDatenschutz },
  { label: 'Barrierefreiheit', action: goBarrierefreiheit },
  { label: 'Kontakt', action: goKontakt },
];

export default function PublicFooter() {
  return (
    <footer className="bg-ink-50 border-t border-ink-200" role="contentinfo">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <button onClick={goLanding} className="flex items-center gap-2.5 group">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-white transition-transform group-hover:scale-105">
                <Radar className="h-4.5 w-4.5" />
              </span>
              <span className="font-display text-[15px] font-semibold text-ink-900">JobRadar Weiterbildung</span>
            </button>
            <p className="mt-3 text-sm text-ink-500">KI-gestuetzt, menschlich geprueft.</p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm" aria-label="Rechtliche Navigation">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={l.action}
                className="text-ink-500 hover:text-ink-900 transition-colors"
              >
                {l.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-ink-200 text-xs text-ink-400">
          (c) {new Date().getFullYear()} JobRadar Weiterbildung. Local MVP — keine externen API-Aufrufe.
        </div>
      </div>
    </footer>
  );
}
