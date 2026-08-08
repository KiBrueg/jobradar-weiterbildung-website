import { useState } from 'react';
import { Radar, ArrowRight } from 'lucide-react';
import { goLanding, goReferenzen, goSchool, goSchulportalDemo } from '@/App';

const navItems = [
  { label: 'Produkt', route: 'landing' as const },
  { label: 'Anbieter', route: 'landing' as const },
  { label: 'Ablauf', route: 'landing' as const },
  { label: 'Referenzen', route: 'referenzen' as const },
  { label: 'Schulportal', route: 'school' as const },
];

function currentPath() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

export default function PublicHeader() {
  const [mobileNav, setMobileNav] = useState(false);
  const path = currentPath();

  const routePath: Record<string, string> = {
    landing: '/',
    referenzen: '/referenzen',
    school: '/school',
  };

  const navItem = (n: (typeof navItems)[number]) => {
    setMobileNav(false);
    if (n.route === 'landing') goLanding();
    else if (n.route === 'referenzen') goReferenzen();
    else if (n.route === 'school') goSchulportalDemo();
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-ink-200/60" role="banner">
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
              <button
                key={n.label}
                onClick={() => navItem(n)}
                className="nav-link"
                aria-current={path === routePath[n.route] ? 'page' : undefined}
              >
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
              aria-label={mobileNav ? 'Navigation schliessen' : 'Navigation aufrufen'}
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
                aria-current={path === routePath[n.route] ? 'page' : undefined}
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
