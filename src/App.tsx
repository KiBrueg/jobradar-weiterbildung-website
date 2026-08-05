import { useEffect, useState } from 'react';
import LandingPage from '@/components/LandingPage';
import AdminDashboard from '@/components/AdminDashboard';
import AdminGate from '@/components/AdminGate';
import ReferencesPage from '@/components/ReferencesPage';
import ImpressumPage from '@/components/ImpressumPage';
import DatenschutzPage from '@/components/DatenschutzPage';
import BarrierefreiheitPage from '@/components/BarrierefreiheitPage';
import KontaktPage from '@/components/KontaktPage';
import { ToastProvider } from '@/components/Toast';

type Route = 'landing' | 'admin' | 'referenzen' | 'impressum' | 'datenschutz' | 'barrierefreiheit' | 'kontakt';

function getRoute(): Route {
  const path = window.location.pathname.replace(/\/$/, '');
  if (path === '/admin') return 'admin';
  if (path === '/referenzen') return 'referenzen';
  if (path === '/impressum') return 'impressum';
  if (path === '/datenschutz') return 'datenschutz';
  if (path === '/barrierefreiheit') return 'barrierefreiheit';
  if (path === '/kontakt') return 'kontakt';
  return 'landing';
}

function navigate(route: Route) {
  const paths: Record<Route, string> = {
    landing: '/',
    admin: '/admin',
    referenzen: '/referenzen',
    impressum: '/impressum',
    datenschutz: '/datenschutz',
    barrierefreiheit: '/barrierefreiheit',
    kontakt: '/kontakt',
  };
  const url = paths[route];
  if (window.location.pathname !== url) {
    window.history.pushState({}, '', url);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function goAdmin() {
  navigate('admin');
}
export function goLanding() {
  navigate('landing');
}
export function goReferenzen() {
  navigate('referenzen');
}
export function goImpressum() {
  navigate('impressum');
}
export function goDatenschutz() {
  navigate('datenschutz');
}
export function goBarrierefreiheit() {
  navigate('barrierefreiheit');
}
export function goKontakt() {
  navigate('kontakt');
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute());

  useEffect(() => {
    const onPop = () => setRoute(getRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <ToastProvider>
      <a href="#main-content" className="skip-link">Zum Hauptinhalt springen</a>
      {route === 'admin' ? (
        <AdminGate><AdminDashboard /></AdminGate>
      ) : route === 'referenzen' ? (
        <ReferencesPage />
      ) : route === 'impressum' ? (
        <ImpressumPage />
      ) : route === 'datenschutz' ? (
        <DatenschutzPage />
      ) : route === 'barrierefreiheit' ? (
        <BarrierefreiheitPage />
      ) : route === 'kontakt' ? (
        <KontaktPage />
      ) : (
        <LandingPage />
      )}
    </ToastProvider>
  );
}
