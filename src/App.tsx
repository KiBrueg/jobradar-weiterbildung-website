import { useEffect, useState } from 'react';
import LandingPage from '@/components/LandingPage';
import AdminDashboard from '@/components/AdminDashboard';
import ReferencesPage from '@/components/ReferencesPage';
import { ToastProvider } from '@/components/Toast';

type Route = 'landing' | 'admin' | 'referenzen';

function getRoute(): Route {
  const path = window.location.pathname.replace(/\/$/, '');
  if (path === '/admin') return 'admin';
  if (path === '/referenzen') return 'referenzen';
  return 'landing';
}

function navigate(route: Route) {
  const url = route === 'admin' ? '/admin' : route === 'referenzen' ? '/referenzen' : '/';
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

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute());

  useEffect(() => {
    const onPop = () => setRoute(getRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <ToastProvider>
      {route === 'admin' ? <AdminDashboard /> : route === 'referenzen' ? <ReferencesPage /> : <LandingPage />}
    </ToastProvider>
  );
}
