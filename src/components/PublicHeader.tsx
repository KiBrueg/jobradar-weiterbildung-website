import { useState } from 'react';
import { Radar, ArrowRight } from 'lucide-react';
import { goLanding, goReferenzen, goAdmin } from '@/App';

const navItems = [
  { label: 'Loesung', href: '#loesung', route: 'landing' as const },
  { label: 'Fuer Bildungstraeger', href: '#bildungstraeger', route: 'landing' as const },
  { label: 'Ablauf', href: '#ablauf', route: 'landing' as const },
  { label: 'Referenzen', href: '#', route: 'referenzen' as const },
  { label: 'Admin Demo', href: '#preview', route: 'admin' as const },
];

export default function PublicHeader() {
  const [mobileNav, setMobileNav] = useState(false);

  const navItem = (n: (typeof navItems)[number]) => {
    setMobileNav(false);
    if (n.route === 'landing') goLanding();
    else if (n.route === 'admin') goAdmin();
    else if (n.route === 'referenzen') goReferenzen();
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-ink-200/60" role="banner">
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
          <nav className="hidden md:flex items-center gap-7" aria-label="Hauptnavigation">
            {navItems.map((n) => (
              <button key={n.label} onClick={() => navItem(n)} className="nav-link">
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
              aria-label="Menue"
              aria-expanded={mobileNav}
              aria-controls="mobile-nav-public"
            >
              <span className="text-xl leading-none">{mobileNav ? '\u00d7' : '\u2630'}</span>
            </button>
          </div>
        </div>
        {mobileNav && (
          <nav
            id="mobile-nav-public"
            className="md:hidden pb-4 flex flex-col gap-1 animate-fade-in"
            aria-label="Mobile Navigation"
          >
            {navItems.map((n) => (
              <button
                key={n.label}
                onClick={() => navItem(n)}
                className="text-left px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-100"
              >
                {n.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
