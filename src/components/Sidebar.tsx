import {
  LayoutDashboard,
  School,
  Search,
  Radar,
  FileText,
  GitPullRequestArrow,
  FileBarChart,
  Workflow,
  Settings,
  Radar as Logo,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { goLanding } from '@/App';

export type SectionKey =
  | 'overview'
  | 'schools'
  | 'profiles'
  | 'leads'
  | 'documents'
  | 'changes'
  | 'reports'
  | 'n8n'
  | 'settings';

export const sections: { key: SectionKey; label: string; icon: LucideIcon }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'schools', label: 'Schulen & Kurse', icon: School },
  { key: 'profiles', label: 'Suchprofile', icon: Search },
  { key: 'leads', label: 'Leads', icon: Radar },
  { key: 'documents', label: 'Dokumente', icon: FileText },
  { key: 'changes', label: 'AEnderungsanfragen', icon: GitPullRequestArrow },
  { key: 'reports', label: 'Reports / Export', icon: FileBarChart },
  { key: 'n8n', label: 'n8n Bridge', icon: Workflow },
  { key: 'settings', label: 'Einstellungen', icon: Settings },
];

export default function Sidebar({
  active,
  onSelect,
  open,
  onClose,
}: {
  active: SectionKey;
  onSelect: (s: SectionKey) => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 border-r border-ink-200 bg-white flex flex-col transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-ink-200">
          <button onClick={goLanding} className="flex items-center gap-2.5 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-white">
              <Logo className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-[15px] font-semibold tracking-tight">JobRadar</span>
          </button>
          <button onClick={onClose} className="lg:hidden btn-ghost px-1.5" aria-label="Menue schliessen">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav id="sidebar-nav" className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5" aria-label="Hauptnavigation">
          {sections.map((s) => {
            const isActive = s.key === active;
            return (
              <button
                key={s.key}
                onClick={() => {
                  onSelect(s.key);
                  onClose();
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-ink-900 text-white shadow-soft'
                    : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                }`}
              >
                <s.icon className="h-4.5 w-4.5 shrink-0" />
                {s.label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-ink-200">
          <div className="rounded-xl bg-ink-50 p-3">
            <p className="text-xs font-semibold text-ink-700">Local MVP</p>
            <p className="mt-1 text-xs text-ink-500 leading-relaxed">React + FastAPI verbunden. CEO-KPIs laden live aus der lokalen API.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
