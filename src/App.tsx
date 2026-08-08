import { useEffect, useState } from 'react';
import LandingPage from '@/components/LandingPage';
import AdminDashboard from '@/components/AdminDashboard';
import AdminGate from '@/components/AdminGate';
import ReferencesPage from '@/components/ReferencesPage';
import ImpressumPage from '@/components/ImpressumPage';
import DatenschutzPage from '@/components/DatenschutzPage';
import BarrierefreiheitPage from '@/components/BarrierefreiheitPage';
import KontaktPage from '@/components/KontaktPage';
import BeispielReportPage from '@/components/BeispielReportPage';
import SchulportalDemoPage from '@/components/SchulportalDemoPage';
import { ToastProvider } from '@/components/Toast';
import SchoolLoginPage from '@/components/school/SchoolLoginPage';
import SchoolLayout from '@/components/school/SchoolLayout';
import SchoolDashboard from '@/components/school/SchoolDashboard';
import SchoolJobsPage from '@/components/school/SchoolJobsPage';
import SchoolProfilePage from '@/components/school/SchoolProfilePage';
import { getSchoolUser } from '@/hooks/useSchoolAuth';

type Route =
  | 'landing' | 'admin' | 'referenzen' | 'impressum' | 'datenschutz'
  | 'barrierefreiheit' | 'kontakt' | 'beispiel-report' | 'schulportal-demo'
  | 'school-login' | 'school-dashboard' | 'school-jobs' | 'school-profile' | 'school-reports';

function getRoute(): Route {
  const path = window.location.pathname.replace(/\/$/, '');
  if (path === '/admin' && window.location.hostname.startsWith('admin.')) return 'admin';
  if (path === '/referenzen') return 'referenzen';
  if (path === '/impressum') return 'impressum';
  if (path === '/datenschutz') return 'datenschutz';
  if (path === '/barrierefreiheit') return 'barrierefreiheit';
  if (path === '/kontakt') return 'kontakt';
  if (path === '/beispiel-report') return 'beispiel-report';
  if (path === '/schulportal-demo') return 'schulportal-demo';
  if (path === '/school/login') return 'school-login';
  if (path.startsWith('/school/jobs')) return 'school-jobs';
  if (path === '/school/profile') return 'school-profile';
  if (path === '/school/reports') return 'school-reports';
  if (path.startsWith('/school')) return 'school-dashboard';
  return 'landing';
}

function nav(to: string) {
  if (window.location.pathname !== to) window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function goAdmin() { nav('/admin'); }
export function goLanding() { nav('/'); }
export function goReferenzen() { nav('/referenzen'); }
export function goImpressum() { nav('/impressum'); }
export function goDatenschutz() { nav('/datenschutz'); }
export function goBarrierefreiheit() { nav('/barrierefreiheit'); }
export function goKontakt() { nav('/kontakt'); }
export function goBeispielReport() { nav('/beispiel-report'); }
export function goSchulportalDemo() { nav('/schulportal-demo'); }
export function goSchool() { nav('/school/login'); }

function SchoolRouter() {
  const [route, setRoute] = useState<Route>(getRoute());
  const [authed, setAuthed] = useState(!!getSchoolUser());

  useEffect(() => {
    const onPop = () => setRoute(getRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (!authed || route === 'school-login') {
    return (
      <SchoolLoginPage
        onLogin={() => {
          setAuthed(true);
          nav('/school/dashboard');
          setRoute('school-dashboard');
        }}
      />
    );
  }

  return (
    <SchoolLayout
      currentPath={window.location.pathname}
      onLogout={() => {
        setAuthed(false);
        nav('/school/login');
        setRoute('school-login');
      }}
    >
      {route === 'school-dashboard' && <SchoolDashboard />}
      {route === 'school-jobs'      && <SchoolJobsPage />}
      {route === 'school-profile'   && <SchoolProfilePage />}
      {route === 'school-reports'   && <div className="text-gray-400 py-8 text-center">Berichte — demnächst verfügbar</div>}
    </SchoolLayout>
  );
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute());

  useEffect(() => {
    const onPop = () => setRoute(getRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (route.startsWith('school')) return <SchoolRouter />;

  return (
    <ToastProvider>
      <a href="#main-content" className="skip-link">Zum Hauptinhalt springen</a>
      {route === 'admin'           ? <AdminGate><AdminDashboard /></AdminGate>
      : route === 'referenzen'     ? <ReferencesPage />
      : route === 'impressum'      ? <ImpressumPage />
      : route === 'datenschutz'    ? <DatenschutzPage />
      : route === 'barrierefreiheit' ? <BarrierefreiheitPage />
      : route === 'kontakt'        ? <KontaktPage />
      : route === 'beispiel-report' ? <BeispielReportPage />
      : route === 'schulportal-demo' ? <SchulportalDemoPage />
      :                              <LandingPage />}
    </ToastProvider>
  );
}
