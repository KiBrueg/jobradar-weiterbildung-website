import { ReactNode, useState } from "react";
import { clearSchoolUser, getSchoolUser } from "@/hooks/useSchoolAuth";

const NAV = [
  { href: "/school/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/school/jobs",      label: "Stellen",   icon: "📋" },
  { href: "/school/profile",   label: "Profil",    icon: "⚙" },
  { href: "/school/reports",   label: "Berichte",  icon: "📄" },
];

function planBadgeClass(plan: string) {
  if (plan.toLowerCase().includes("pro")) return "bg-purple-100 text-purple-700";
  if (plan.toLowerCase().includes("basic")) return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
}

interface Props {
  children: ReactNode;
  currentPath: string;
  onLogout: () => void;
}

export default function SchoolLayout({ children, currentPath, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const user = getSchoolUser();

  function logout() {
    clearSchoolUser();
    onLogout();
  }

  function SidebarContent() {
    return (
      <aside className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-64 p-5">
        <div className="mb-8">
          <span className="text-xl font-bold text-gray-900 dark:text-white">JobRadar</span>
          <p className="text-xs text-gray-400 mt-0.5">Schulportal</p>
        </div>

        {user && (
          <div className="mb-6 px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{user.schoolName}</p>
            <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${planBadgeClass(user.plan)}`}>
              {user.plan}
            </span>
          </div>
        )}

        <nav className="flex-1 space-y-1">
          {NAV.map((n) => {
            const active = currentPath.startsWith(n.href);
            return (
              <a
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                <span>{n.icon}</span>
                {n.label}
              </a>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="mt-4 flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400
                     hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
        >
          <span>↩</span> Abmelden
        </button>
      </aside>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-50">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <button onClick={() => setOpen(true)} className="text-gray-600 dark:text-gray-300 text-xl">☰</button>
          <span className="font-semibold text-gray-900 dark:text-white">JobRadar</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
