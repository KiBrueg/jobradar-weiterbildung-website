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
  { label: 'Uebersicht', action: goLanding, path: '/' },
  { label: 'Referenzen', action: goReferenzen, path: '/referenzen' },
  { label: 'Admin Demo', action: goAdmin, path: '/admin' },
  { label: 'Impressum', action: goImpressum, path: '/impressum' },
  { label: 'Datenschutz', action: goDatenschutz, path: '/datenschutz' },
  { label: 'Barrierefreiheit', action: goBarrierefreiheit, path: '/barrierefreiheit' },
  { label: 'Kontakt', action: goKontakt, path: '/kontakt' },
];

function currentPath() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

export default function PublicFooter() {
  const path = currentPath();
  return (
    <footer className="bg-ink-50 border-t border-ink-200" role="contentinfo">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <button onClick={goLanding} className="flex items-center gap-2.5 group" aria-label="JobRadar Weiterbildung Startseite">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-white transition-transform group-hover:scale-105">
                <Radar className="h-4.5 w-4.5" />
              </span>
              <span className="font-display text-[15px] font-semibold text-ink-900">JobRadar Weiterbildung</span>
            </button>
            <p className="mt-3 text-sm text-ink-500">KI-gestuetzt, menschlich geprueft.</p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm" aria-label="Seitennavigation">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={l.action}
                className="text-ink-500 hover:text-ink-900 transition-colors"
                aria-current={path === l.path ? 'page' : undefined}
              >
                {l.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-ink-200 text-xs text-ink-400">
          © {new Date().getFullYear()} JobRadar Weiterbildung. Local MVP — keine externen API-Aufrufe.
        </div>
      </div>
    </footer>
  );
}
