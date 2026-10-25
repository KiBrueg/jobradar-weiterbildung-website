import { useMemo, useState } from 'react';
import {
  Search as SearchIcon,
  Download,
  Menu,
  Database,
  Plus,
  Pencil,
  Archive,
  FileText,
  GitPullRequestArrow,
  FileBarChart,
  Copy,
  Check,
  X,
  Upload,
  Eye,
  Code2,
  AlertTriangle,
  Trash2,
  RotateCcw,
  Zap,
} from 'lucide-react';
import Sidebar, { sections, type SectionKey } from '@/components/Sidebar';
import CeoCockpit from '@/components/CeoCockpit';
import {
  StatusBadge,
  LeadStatusBadge,
  ScorePill,
  Modal,
  Drawer,
  ConfirmDialog,
} from '@/components/ui';
import { useToast } from '@/components/Toast';
import SearchProfileDrawer from '@/components/SearchProfileDrawer';
import {
  schools as initialSchools,
  courses as initialCourses,
  searchProfiles as initialProfiles,
  leads as initialLeads,
  documents as initialDocuments,
  changeRequests as initialChanges,
  workflowRuns as initialRuns,
  documentTypes,
  leadStatuses,
  testPayload,
  schoolName,
  courseName,
  profileForCourse,
  type School,
  type Course,
  type Lead,
  type LeadStatus,
  type SearchProfile,
  type DocItem,
  type ChangeRequest,
  type WorkflowRun,
} from '@/data/mock';
import { goLanding } from '@/App';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [section, setSection] = useState<SectionKey>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [profiles, setProfiles] = useState<SearchProfile[]>(initialProfiles);
  const [docs, setDocs] = useState<DocItem[]>(initialDocuments);
  const [changes, setChanges] = useState<ChangeRequest[]>(initialChanges);
  const [runs, setRuns] = useState<WorkflowRun[]>(initialRuns);

  const [selectedSchoolId, setSelectedSchoolId] = useState<number>(schools[0].id);
  const [profileDrawerCourse, setProfileDrawerCourse] = useState<Course | null>(null);
  const [leadDrawer, setLeadDrawer] = useState<Lead | null>(null);

  // Lead filters
  const [leadStatusFilter, setLeadStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [leadSchoolFilter, setLeadSchoolFilter] = useState<number | 'all'>('all');
  const [leadCourseFilter, setLeadCourseFilter] = useState<number | 'all'>('all');
  const [leadMinScore, setLeadMinScore] = useState(0);

  // Profile filters
  const [profileSchoolFilter, setProfileSchoolFilter] = useState<number | 'all'>('all');
  const [profileStatusFilter, setProfileStatusFilter] = useState<string>('all');
  const [profileOnlyActive, setProfileOnlyActive] = useState(false);
  const [profileOnlyOpenChanges, setProfileOnlyOpenChanges] = useState(false);

  // School modals
  const [addSchoolOpen, setAddSchoolOpen] = useState(false);
  const [renameSchool, setRenameSchool] = useState<School | null>(null);
  const [archiveSchool, setArchiveSchool] = useState<School | null>(null);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolContact, setNewSchoolContact] = useState('');
  const [renameSchoolValue, setRenameSchoolValue] = useState('');

  // Course modals
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [renameCourse, setRenameCourse] = useState<Course | null>(null);
  const [archiveCourse, setArchiveCourse] = useState<Course | null>(null);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseTopic, setNewCourseTopic] = useState('');
  const [renameValue, setRenameValue] = useState('');

  // Doc upload
  const [docSchool, setDocSchool] = useState<number>(schools[0].id);
  const [docCourse, setDocCourse] = useState<number>(courses[0].id);
  const [docType, setDocType] = useState<string>(documentTypes[0]);
  const [docName, setDocName] = useState('');

  // Diff modal
  const [diffRequest, setDiffRequest] = useState<ChangeRequest | null>(null);

  // n8n
  const [showPayload, setShowPayload] = useState(false);

  // Settings
  const [settings, setSettings] = useState({
    workspaceName: 'JobRadar Weiterbildung',
    reportLanguage: 'Deutsch',
    maxLeadsPerCourse: 50,
    humanQARequired: true,
    tunnelUrl: 'https://smooth-doors-rhyme.loca.lt',
    exportPath: '/exports/jobradar/',
  });

  const activeSection = sections.find((s) => s.key === section)!;

  const schoolCourses = useMemo(
    () => courses.filter((c) => c.schoolId === selectedSchoolId),
    [courses, selectedSchoolId]
  );

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (leadStatusFilter !== 'all' && l.status !== leadStatusFilter) return false;
      if (leadMinScore > 0 && l.score < leadMinScore) return false;
      const course = courses.find((c) => c.id === l.courseId);
      if (leadSchoolFilter !== 'all' && course?.schoolId !== leadSchoolFilter) return false;
      if (leadCourseFilter !== 'all' && l.courseId !== leadCourseFilter) return false;
      return true;
    });
  }, [leads, leadStatusFilter, leadMinScore, leadSchoolFilter, leadCourseFilter, courses]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const course = courses.find((c) => c.id === p.courseId);
      if (!course) return false;
      if (profileSchoolFilter !== 'all' && course.schoolId !== profileSchoolFilter) return false;
      if (profileStatusFilter !== 'all' && p.status !== profileStatusFilter) return false;
      if (profileOnlyActive && p.status !== 'active') return false;
      if (profileOnlyOpenChanges && !p.hasOpenChange) return false;
      return true;
    });
  }, [profiles, courses, profileSchoolFilter, profileStatusFilter, profileOnlyActive, profileOnlyOpenChanges]);

  const onExport = (label: string) => toast(`Demo: ${label} wurde vorbereitet.`, 'info');

  // --- School actions ---
  const addSchool = async () => {
    if (!newSchoolName.trim()) return;
    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSchoolName.trim(), contact_email: newSchoolContact.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { school } = await res.json();
      setSchools((ss) => [
        ...ss,
        { id: school.id, name: school.name, status: 'active', contact: school.contact_email || '—', coursesCount: 0, leadsCount: 0, note: school.note || 'Neuer Bildungstraeger.' },
      ]);
    } catch {
      toast('Fehler beim Speichern.', 'warning');
      return;
    }
    setNewSchoolName(''); setNewSchoolContact('');
    setAddSchoolOpen(false);
    toast('Schule hinzugefuegt.');
  };
  const doRenameSchool = () => {
    if (!renameSchool || !renameSchoolValue.trim()) return;
    setSchools((ss) => ss.map((s) => (s.id === renameSchool.id ? { ...s, name: renameSchoolValue.trim() } : s)));
    setRenameSchool(null);
    toast('Schule umbenannt.');
  };
  const doArchiveSchool = () => {
    if (!archiveSchool) return;
    setSchools((ss) => ss.map((s) => (s.id === archiveSchool.id ? { ...s, status: 'archived' } : s)));
    toast('Schule archiviert.', 'warning');
  };

  // --- Course actions ---
  const addCourse = () => {
    if (!newCourseName.trim()) return;
    const id = Math.max(0, ...courses.map((c) => c.id)) + 1;
    setCourses((cs) => [
      ...cs,
      { id, schoolId: selectedSchoolId, name: newCourseName.trim(), topic: newCourseTopic.trim() || '—', status: 'draft', searchProfileId: null, leads: 0, documents: 0, score: 0 },
    ]);
    setNewCourseName(''); setNewCourseTopic('');
    setAddCourseOpen(false);
    toast('Kurs hinzugefuegt.');
  };
  const doRename = () => {
    if (!renameCourse || !renameValue.trim()) return;
    setCourses((cs) => cs.map((c) => (c.id === renameCourse.id ? { ...c, name: renameValue.trim() } : c)));
    setRenameCourse(null);
    toast('Kurs umbenannt.');
  };
  const doArchive = () => {
    if (!archiveCourse) return;
    setCourses((cs) => cs.map((c) => (c.id === archiveCourse.id ? { ...c, status: 'archived' } : c)));
    toast('Kurs archiviert.', 'warning');
  };

  // --- Profile actions ---
  const saveProfile = (updated: SearchProfile) => {
    const exists = profiles.some((p) => p.id === updated.id);
    const url = exists && updated.id ? `/api/profiles/${updated.id}` : `/api/courses/${updated.courseId}/profile`;
    const method = exists && updated.id ? 'PUT' : 'POST';
    fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) }).catch(() => {});
    setProfiles((ps) => {
      if (exists) return ps.map((p) => (p.id === updated.id ? updated : p));
      return [...ps, updated];
    });
    setCourses((cs) => cs.map((c) => (c.id === updated.courseId ? { ...c, searchProfileId: updated.id } : c)));
    setProfileDrawerCourse(null);
    toast('Suchprofil gespeichert.');
  };
  const requestChange = (course: Course) => {
    const id = Math.max(0, ...changes.map((c) => c.id)) + 1;
    setChanges((cs) => [
      ...cs,
      {
        id, schoolId: course.schoolId, courseId: course.id,
        field: 'Suchprofil',
        suggestion: `AEnderung am Suchprofil fuer "${course.name}" angefragt`,
        oldValue: '(aktuell)', newValue: '(vorgeschlagen)',
        submittedBy: 'Admin', status: 'open', date: 'gerade eben',
      },
    ]);
    toast('AEnderungsanfrage erstellt.', 'info');
  };

  // --- Lead actions ---
  const setLeadStatus = (id: number, status: LeadStatus) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    setLeadDrawer((d) => (d && d.id === id ? { ...d, status } : d));
    toast(`Lead als "${status}" markiert.`);
  };

  // --- Document actions ---
  const addDoc = () => {
    if (!docName.trim()) {
      toast('Bitte Dateinamen eingeben.', 'warning');
      return;
    }
    const id = Math.max(0, ...docs.map((d) => d.id)) + 1;
    setDocs((ds) => [
      ...ds,
      { id, name: docName.trim(), schoolId: docSchool, courseId: docCourse, type: docType, uploadedBy: 'Admin', date: new Date().toLocaleDateString('de-DE'), access: 'school' },
    ]);
    setDocName('');
    toast('Dokument lokal hinzugefuegt.');
  };
  const deleteDoc = (id: number) => {
    setDocs((ds) => ds.filter((d) => d.id !== id));
    toast('Dokument entfernt.', 'warning');
  };

  // --- Change request actions ---
  const approveChange = (id: number) => {
    setChanges((cs) => cs.map((c) => (c.id === id ? { ...c, status: 'approved' } : c)));
    toast('AEnderung genehmigt.');
  };
  const rejectChange = (id: number) => {
    setChanges((cs) => cs.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c)));
    toast('AEnderung abgelehnt.', 'warning');
  };

  // --- n8n connection test simulation ---
  const simulateConnectionTest = () => {
    const leadId = Math.max(0, ...leads.map((l) => l.id)) + 1;
    const newLead: Lead = {
      id: leadId, courseId: 1, title: 'Junior Data Analyst Remote (Simulated)', company: 'Simulated Lead GmbH',
      score: 77, status: 'Candidate', risks: 'Simulated — QA check needed',
      source: 'Connection Test', sourceUrl: 'https://example.com/job/simulated',
      whyFit: 'Simulated lead from Connection Test.', missingEvidence: 'QA check needed', coachNote: 'Simulated — bitte pruefen.',
    };
    setLeads((ls) => [...ls, newLead]);
    const runId = Math.max(0, ...runs.map((r) => r.id)) + 1;
    setRuns((rs) => [
      ...rs,
      { id: runId, workflow: 'Connection Test (simuliert)', mode: 'test', status: 'completed', items: 1, createdLeads: 1, lastRun: 'gerade eben' },
    ]);
    toast('Connection Test simuliert: Lead wurde lokal hinzugefuegt.');
  };

  // --- Settings ---
  const saveSettings = () => toast('Einstellungen gespeichert.');
  const resetSettings = () => {
    setSettings({
      workspaceName: 'JobRadar Weiterbildung', reportLanguage: 'Deutsch', maxLeadsPerCourse: 50,
      humanQARequired: true, tunnelUrl: 'https://smooth-doors-rhyme.loca.lt', exportPath: '/exports/jobradar/',
    });
    toast('Einstellungen zurueckgesetzt.', 'info');
  };

  const kpiValues = {
    schulen: schools.length,
    aktiveKurse: courses.filter((c) => c.status === 'active').length,
    suchprofile: profiles.length,
    leadsDieseWoche: leads.length,
    qaOffen: leads.filter((l) => l.status === 'QA Needed').length,
    avgScore: Math.round(leads.reduce((a, l) => a + l.score, 0) / Math.max(1, leads.length)),
  };

  return (
    <div className="min-h-screen bg-ink-50 flex">
      <Sidebar active={section} onSelect={setSection} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 glass border-b border-ink-200/60">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost px-2" aria-label="Navigation öffnen" aria-expanded={sidebarOpen} aria-controls="sidebar-nav">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-semibold tracking-tight text-ink-900">{activeSection.label}</h1>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <div className="relative hidden sm:block">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen..." className="input pl-9 py-2 w-48 lg:w-64" />
              </div>
              <button onClick={() => onExport('Backup')} className="btn-secondary">
                <Download className="h-4 w-4" /><span className="hidden sm:inline">Backup exportieren</span>
              </button>
              <button onClick={goLanding} className="btn-ghost px-2" aria-label="Zur Landing Page"><X className="h-4 w-4" /></button>
            </div>
          </div>
        </header>

        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto" role="main">
          {/* ===== OVERVIEW ===== */}
          {section === 'overview' && <CeoCockpit />}

          {/* ===== SCHULEN & KURSE ===== */}
          {section === 'schools' && (
            <div className="grid lg:grid-cols-[320px_1fr] gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-base font-semibold">Schulen / Anbieter</h2>
                  <button onClick={() => setAddSchoolOpen(true)} className="btn-accent px-2.5 py-1.5 text-xs">
                    <Plus className="h-4 w-4" /> Schule
                  </button>
                </div>
                {schools.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSchoolId(s.id)}
                    className={`w-full text-left card-soft p-4 transition-all cursor-pointer ${
                      selectedSchoolId === s.id ? 'ring-2 ring-brand-400 shadow-lift' : 'hover:shadow-soft'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-ink-900">{s.name}</p>
                        <p className="mt-0.5 text-xs text-ink-500">{s.contact}</p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="mt-2 text-xs text-ink-500 leading-relaxed">{s.note}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-4 text-xs text-ink-500">
                        <span>{courses.filter((c) => c.schoolId === s.id).length} Kurse</span>
                        <span>{s.leadsCount} Leads</span>
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setRenameSchool(s); setRenameSchoolValue(s.name); }} className="btn-ghost px-1.5 py-1 text-xs" title="Umbenennen"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setArchiveSchool(s)} className="btn-ghost px-1.5 py-1 text-xs text-rose-500" title="Archivieren"><Archive className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="font-display text-base font-semibold">Kurse — {schoolName(selectedSchoolId)}</h2>
                    <p className="text-xs text-ink-500 mt-0.5">Ein Suchprofil definiert, welche Stellen fuer einen Kurs relevant sind.</p>
                  </div>
                  <button onClick={() => setAddCourseOpen(true)} className="btn-accent"><Plus className="h-4 w-4" /> Kurs hinzufuegen</button>
                </div>
                <div className="table-wrap">
                  <table className="table-base">
                    <thead><tr><th>Kursname</th><th>Thema</th><th>Status</th><th>Suchprofil</th><th>Leads</th><th>Dokumente</th><th>Score</th><th>Aktionen</th></tr></thead>
                    <tbody>
                      {schoolCourses.length === 0 && <tr><td colSpan={8} className="text-center text-ink-400 py-8">Keine Kurse.</td></tr>}
                      {schoolCourses.map((c) => (
                        <tr key={c.id}>
                          <td className="font-medium text-ink-900">{c.name}</td>
                          <td><span className="chip">{c.topic}</span></td>
                          <td><StatusBadge status={c.status} /></td>
                          <td>{c.searchProfileId ? <span className="text-accent-600 font-medium text-xs">Profil #{c.searchProfileId}</span> : <span className="text-ink-400 text-xs">—</span>}</td>
                          <td className="tabular-nums">{c.leads}</td>
                          <td className="tabular-nums">{c.documents}</td>
                          <td>{c.score > 0 ? <ScorePill score={c.score} /> : <span className="text-ink-400">—</span>}</td>
                          <td>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setProfileDrawerCourse(c)} className="btn-ghost px-2 py-1 text-xs" title="Suchprofil bearbeiten"><SearchIcon className="h-3.5 w-3.5" /></button>
                              <button onClick={() => { setRenameCourse(c); setRenameValue(c.name); }} className="btn-ghost px-2 py-1 text-xs" title="Umbenennen"><Pencil className="h-3.5 w-3.5" /></button>
                              <button onClick={() => setArchiveCourse(c)} className="btn-ghost px-2 py-1 text-xs text-rose-500" title="Archivieren"><Archive className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== SUCHPROFILE ===== */}
          {section === 'profiles' && (
            <div className="space-y-4">
              <div className="card p-4 flex flex-wrap gap-3 items-end">
                <div>
                  <label className="label">Schule</label>
                  <select className="input min-w-[180px]" value={profileSchoolFilter} onChange={(e) => setProfileSchoolFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
                    <option value="all">Alle Schulen</option>
                    {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input min-w-[150px]" value={profileStatusFilter} onChange={(e) => setProfileStatusFilter(e.target.value)}>
                    <option value="all">Alle</option><option value="active">Aktiv</option><option value="draft">Draft</option><option value="review">Review</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-ink-600 ml-2 cursor-pointer">
                  <input type="checkbox" checked={profileOnlyActive} onChange={(e) => setProfileOnlyActive(e.target.checked)} className="rounded border-ink-300" /> Nur aktive Profile
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-600 cursor-pointer">
                  <input type="checkbox" checked={profileOnlyOpenChanges} onChange={(e) => setProfileOnlyOpenChanges(e.target.checked)} className="rounded border-ink-300" /> Offene AEnderungen
                </label>
              </div>
              <div className="table-wrap">
                <table className="table-base">
                  <thead><tr><th>Schule</th><th>Kurs</th><th>Zielberufe</th><th>Skills</th><th>Ausschluesse</th><th>Aktive Queries</th><th>Letzte AEnderung</th><th>Status</th><th>Aktionen</th></tr></thead>
                  <tbody>
                    {filteredProfiles.map((p) => {
                      const course = courses.find((c) => c.id === p.courseId);
                      return (
                        <tr key={p.id}>
                          <td className="font-medium text-ink-900">{course ? schoolName(course.schoolId) : '—'}</td>
                          <td>{course?.name ?? '—'}</td>
                          <td><div className="flex flex-wrap gap-1 max-w-[200px]">{p.targetTitles.slice(0, 2).map((t) => <span key={t} className="chip">{t}</span>)}{p.targetTitles.length > 2 && <span className="chip">+{p.targetTitles.length - 2}</span>}</div></td>
                          <td><div className="flex flex-wrap gap-1 max-w-[180px]">{p.skills.slice(0, 2).map((t) => <span key={t} className="chip">{t}</span>)}{p.skills.length > 2 && <span className="chip">+{p.skills.length - 2}</span>}</div></td>
                          <td className="text-xs text-ink-500 max-w-[140px] truncate">{p.exclusions.join(', ')}</td>
                          <td className="tabular-nums">{p.activeQueries}</td>
                          <td className="text-ink-500 text-xs">{p.lastChanged}</td>
                          <td><div className="flex items-center gap-2"><StatusBadge status={p.status} />{p.hasOpenChange && <span className="h-2 w-2 rounded-full bg-amber-400" title="Offene AEnderung" />}</div></td>
                          <td><button onClick={() => course && setProfileDrawerCourse(course)} className="btn-ghost px-2 py-1 text-xs"><Pencil className="h-3.5 w-3.5" /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== LEADS ===== */}
          {section === 'leads' && (
            <div className="space-y-4">
              <div className="card p-4 flex flex-wrap gap-3 items-end">
                <div>
                  <label className="label">Status</label>
                  <select className="input min-w-[150px]" value={leadStatusFilter} onChange={(e) => setLeadStatusFilter(e.target.value as LeadStatus | 'all')}>
                    <option value="all">Alle</option>{leadStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Schule</label>
                  <select className="input min-w-[160px]" value={leadSchoolFilter} onChange={(e) => setLeadSchoolFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
                    <option value="all">Alle Schulen</option>{schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Kurs</label>
                  <select className="input min-w-[180px]" value={leadCourseFilter} onChange={(e) => setLeadCourseFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
                    <option value="all">Alle Kurse</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Min. Score: {leadMinScore}</label>
                  <input type="range" min={0} max={100} value={leadMinScore} onChange={(e) => setLeadMinScore(Number(e.target.value))} className="w-32 accent-brand-600" />
                </div>
              </div>
              <div className="table-wrap">
                <table className="table-base">
                  <thead><tr><th>Titel</th><th>Unternehmen</th><th>Kurs</th><th>Schule</th><th>Score</th><th>Status</th><th>Risiken</th><th>Quelle</th><th>Aktionen</th></tr></thead>
                  <tbody>
                    {filteredLeads.map((l) => {
                      const course = courses.find((c) => c.id === l.courseId);
                      return (
                        <tr key={l.id} className="cursor-pointer" onClick={() => setLeadDrawer(l)}>
                          <td className="font-medium text-ink-900">{l.title}</td>
                          <td>{l.company}</td>
                          <td className="text-xs">{course?.name ?? '—'}</td>
                          <td className="text-xs">{course ? schoolName(course.schoolId) : '—'}</td>
                          <td><ScorePill score={l.score} /></td>
                          <td><LeadStatusBadge status={l.status} /></td>
                          <td className="text-xs text-ink-500 max-w-[140px] truncate">{l.risks}</td>
                          <td className="text-xs text-ink-500">{l.source}</td>
                          <td onClick={(e) => e.stopPropagation()}><button onClick={() => setLeadDrawer(l)} className="btn-ghost px-2 py-1 text-xs"><Eye className="h-3.5 w-3.5" /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== DOKUMENTE ===== */}
          {section === 'documents' && (
            <div className="space-y-6">
              <div className="card p-5">
                <h2 className="font-display text-base font-semibold mb-4">Dokument hochladen</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="label">Schule</label>
                    <select className="input" value={docSchool} onChange={(e) => setDocSchool(Number(e.target.value))}>
                      {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Kurs</label>
                    <select className="input" value={docCourse} onChange={(e) => setDocCourse(Number(e.target.value))}>
                      {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Dokumenttyp</label>
                    <select className="input" value={docType} onChange={(e) => setDocType(e.target.value)}>
                      {documentTypes.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Datei</label>
                    <div className="flex gap-2">
                      <input className="input" value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="dateiname.pdf" />
                      <button onClick={addDoc} className="btn-primary shrink-0"><Upload className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-ink-500 leading-relaxed">
                  Beste Formate: PDF fuer Curriculum/AZAV-Nachweise, DOCX fuer bearbeitbare Kursplaene, TXT/MD fuer saubere Notizen, CSV/XLSX fuer Skill-Matrizen oder Stellenlisten. Bilder nur fuer Screenshots/Zertifikate.
                </p>
              </div>
              <div className="table-wrap">
                <table className="table-base">
                  <thead><tr><th>Datei</th><th>Schule</th><th>Kurs</th><th>Typ</th><th>Hochgeladen von</th><th>Datum</th><th>Zugriff</th><th>Aktionen</th></tr></thead>
                  <tbody>
                    {docs.map((d) => (
                      <tr key={d.id}>
                        <td className="font-medium text-ink-900 flex items-center gap-2"><FileText className="h-4 w-4 text-ink-400" /> {d.name}</td>
                        <td className="text-xs">{schoolName(d.schoolId)}</td>
                        <td className="text-xs">{d.courseId ? courseName(d.courseId) : '—'}</td>
                        <td><span className="chip">{d.type}</span></td>
                        <td className="text-xs">{d.uploadedBy}</td>
                        <td className="text-xs text-ink-500">{d.date}</td>
                        <td><span className="chip capitalize">{d.access}</span></td>
                        <td>
                          <div className="flex gap-1">
                            <button onClick={() => toast('Ansicht — Demo', 'info')} className="btn-ghost px-2 py-1 text-xs"><Eye className="h-3.5 w-3.5" /></button>
                            <button onClick={() => toast('Download — Demo', 'info')} className="btn-ghost px-2 py-1 text-xs"><Download className="h-3.5 w-3.5" /></button>
                            <button onClick={() => deleteDoc(d.id)} className="btn-ghost px-2 py-1 text-xs text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== AENDERUNGSANFRAGEN ===== */}
          {section === 'changes' && (
            <div className="table-wrap">
              <table className="table-base">
                <thead><tr><th>Schule</th><th>Kurs</th><th>Feld</th><th>Vorgeschlagene AEnderung</th><th>Eingereicht von</th><th>Status</th><th>Aktionen</th></tr></thead>
                <tbody>
                  {changes.map((r) => (
                    <tr key={r.id}>
                      <td className="font-medium text-ink-900">{schoolName(r.schoolId)}</td>
                      <td className="text-xs">{courseName(r.courseId)}</td>
                      <td><span className="chip">{r.field}</span></td>
                      <td className="text-sm text-ink-700 max-w-[280px]">{r.suggestion}</td>
                      <td className="text-xs">{r.submittedBy}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => approveChange(r.id)} className="btn-ghost px-2 py-1 text-xs text-accent-600" title="Genehmigen"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => rejectChange(r.id)} className="btn-ghost px-2 py-1 text-xs text-rose-500" title="Ablehnen"><X className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDiffRequest(r)} className="btn-ghost px-2 py-1 text-xs" title="Diff anzeigen"><GitPullRequestArrow className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===== REPORTS ===== */}
          {section === 'reports' && (
            <div className="space-y-6">
              <div className="card p-5">
                <h2 className="font-display text-base font-semibold mb-4">Report generieren</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div><label className="label">Schule</label><select className="input">{schools.map((s) => <option key={s.id}>{s.name}</option>)}</select></div>
                  <div><label className="label">Kurs</label><select className="input"><option>Alle Kurse</option>{courses.map((c) => <option key={c.id}>{c.name}</option>)}</select></div>
                  <div><label className="label">Zeitraum</label><select className="input"><option>Letzte 7 Tage</option><option>Letzte 30 Tage</option><option>Letztes Quartal</option></select></div>
                  <div><label className="label">Report-Typ</label><select className="input"><option>Arbeitsmarkt-Report</option><option>QA-Report</option><option>Backup</option></select></div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button onClick={() => onExport('HTML Report')} className="btn-primary"><FileBarChart className="h-4 w-4" /> HTML Report exportieren</button>
                  <button onClick={() => onExport('CSV')} className="btn-secondary"><Download className="h-4 w-4" /> CSV exportieren</button>
                  <button onClick={() => onExport('JSON')} className="btn-secondary"><Download className="h-4 w-4" /> JSON exportieren</button>
                  <button onClick={() => onExport('SQLite Backup')} className="btn-secondary"><Database className="h-4 w-4" /> SQLite Backup herunterladen</button>
                </div>
              </div>
              <div className="card p-5">
                <h2 className="font-display text-base font-semibold mb-4">Report-Vorschau</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { l: 'Aktive Kurse', v: kpiValues.aktiveKurse },
                    { l: 'Matched Leads', v: kpiValues.leadsDieseWoche },
                    { l: 'Dokumente', v: docs.length },
                    { l: 'Offene QA', v: kpiValues.qaOffen },
                    { l: 'Ø Score', v: kpiValues.avgScore },
                  ].map((k) => (
                    <div key={k.l} className="rounded-xl border border-ink-200/70 bg-ink-50/50 p-4">
                      <div className="font-display text-2xl font-semibold tabular-nums">{k.v}</div>
                      <div className="text-xs text-ink-500 mt-0.5">{k.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== N8N BRIDGE ===== */}
          {section === 'n8n' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">Tunnel URLs sind temporaer. Fuer Production sollte eine stabile Deployment-URL verwendet werden.</p>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[
                  { method: 'GET', path: '/api/n8n/search-tasks', desc: 'n8n liest aktive Kurs-Suchprofile.' },
                  { method: 'GET', path: '/api/n8n/status', desc: 'Live Status: Runs, Sources, Kosten und Leads.' },
                  { method: 'POST', path: '/api/n8n/workflow-runs', desc: 'n8n protokolliert Workflow-Run und Output-Zahlen.' },
                  { method: 'POST', path: '/api/n8n/source-runs', desc: 'n8n schreibt Quellenqualität, Treffer und Fehler.' },
                  { method: 'POST', path: '/api/n8n/cost-events', desc: 'n8n schreibt API/LLM/Tool-Kosten.' },
                  { method: 'POST', path: '/api/n8n/leads', desc: 'n8n sendet normalisierte Leads zurück.' },
                  { method: 'GET', path: '/api/n8n/runs', desc: 'Workflow-Runs und Testläufe anzeigen.' },
                ].map((e) => (
                  <div key={e.path} className="card p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${e.method === 'GET' ? 'bg-brand-50 text-brand-700' : 'bg-accent-50 text-accent-700'}`}>{e.method}</span>
                      <code className="text-xs font-mono text-ink-700">{e.path}</code>
                    </div>
                    <p className="text-sm text-ink-600">{e.desc}</p>
                  </div>
                ))}
              </div>
              <div className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h2 className="font-display text-base font-semibold">Base URL</h2>
                  <code className="text-sm font-mono text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg">{settings.tunnelUrl}</code>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl border border-ink-200 p-3"><span className="text-ink-600">Connection Test</span><span className="text-brand-600 font-semibold">Ready</span></div>
                  <div className="flex items-center justify-between rounded-xl border border-ink-200 p-3"><span className="text-ink-600">Flow 4 Integration</span><span className="text-brand-600 font-semibold">Ready</span></div>
                  <div className="flex items-center justify-between rounded-xl border border-ink-200 p-3"><span className="text-ink-600">Last run</span><span className="text-ink-500 font-semibold">Waiting</span></div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => setShowPayload((v) => !v)} className="btn-secondary"><Code2 className="h-4 w-4" /> {showPayload ? 'Payload ausblenden' : 'Test Payload anzeigen'}</button>
                  <button onClick={simulateConnectionTest} className="btn-accent"><Zap className="h-4 w-4" /> Connection Test simulieren</button>
                </div>
                {showPayload && (
                  <pre className="mt-4 rounded-xl bg-ink-950 text-ink-100 p-4 text-xs font-mono overflow-x-auto animate-fade-in">{JSON.stringify(testPayload, null, 2)}</pre>
                )}
              </div>
            </div>
          )}

          {/* ===== EINSTELLUNGEN ===== */}
          {section === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div className="card p-6">
                <h2 className="font-display text-base font-semibold mb-4">Allgemein</h2>
                <div className="space-y-4">
                  <div><label className="label">Workspace Name</label><input className="input" value={settings.workspaceName} onChange={(e) => setSettings({ ...settings, workspaceName: e.target.value })} /></div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="label">Default Report-Sprache</label><select className="input" value={settings.reportLanguage} onChange={(e) => setSettings({ ...settings, reportLanguage: e.target.value })}><option>Deutsch</option><option>English</option></select></div>
                    <div><label className="label">Max Leads pro Kurs</label><input type="number" className="input" value={settings.maxLeadsPerCourse} onChange={(e) => setSettings({ ...settings, maxLeadsPerCourse: Number(e.target.value) })} /></div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.humanQARequired} onChange={(e) => setSettings({ ...settings, humanQARequired: e.target.checked })} className="h-4 w-4 rounded border-ink-300 text-brand-600" />
                    <span className="text-sm text-ink-700">Human QA required (jeder Lead muss manuell geprueft werden)</span>
                  </label>
                </div>
              </div>
              <div className="card p-6">
                <h2 className="font-display text-base font-semibold mb-4">Integration</h2>
                <div className="space-y-4">
                  <div><label className="label">Tunnel Base URL</label><input className="input font-mono text-sm" value={settings.tunnelUrl} onChange={(e) => setSettings({ ...settings, tunnelUrl: e.target.value })} /></div>
                  <div><label className="label">Export-Pfad (Placeholder)</label><input className="input font-mono text-sm" value={settings.exportPath} onChange={(e) => setSettings({ ...settings, exportPath: e.target.value })} /></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveSettings} className="btn-primary"><Check className="h-4 w-4" /> Speichern</button>
                <button onClick={resetSettings} className="btn-secondary"><RotateCcw className="h-4 w-4" /> Reset</button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===== Drawers & Modals ===== */}
      <SearchProfileDrawer
        course={profileDrawerCourse}
        profile={profileDrawerCourse ? profiles.find((p) => p.courseId === profileDrawerCourse.id) ?? profileForCourse(profileDrawerCourse.id) : undefined}
        onClose={() => setProfileDrawerCourse(null)}
        onSave={saveProfile}
        onRequestChange={() => { if (profileDrawerCourse) requestChange(profileDrawerCourse); }}
      />

      {/* Lead detail drawer */}
      <Drawer
        open={!!leadDrawer} onClose={() => setLeadDrawer(null)}
        title={leadDrawer?.title ?? ''}
        subtitle={leadDrawer ? `${leadDrawer.company} — ${courseName(leadDrawer.courseId)}` : ''}
        width="max-w-lg"
        footer={leadDrawer && (
          <>
            <button onClick={() => setLeadStatus(leadDrawer.id, 'Rejected')} className="btn-secondary text-rose-600"><X className="h-4 w-4" /> Reject</button>
            <button onClick={() => setLeadStatus(leadDrawer.id, 'Approved')} className="btn-accent"><Check className="h-4 w-4" /> Approve</button>
          </>
        )}
      >
        {leadDrawer && (
          <div className="space-y-5">
            <div className="flex items-center gap-3"><ScorePill score={leadDrawer.score} /><LeadStatusBadge status={leadDrawer.status} /></div>
            <div><p className="label">Why this fits</p><p className="text-sm text-ink-700">{leadDrawer.whyFit}</p></div>
            <div><p className="label">Missing evidence</p><p className="text-sm text-ink-700">{leadDrawer.missingEvidence}</p></div>
            <div><p className="label">Risk flags</p><p className="text-sm text-ink-700">{leadDrawer.risks}</p></div>
            <div>
              <p className="label">Source URL</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-brand-700 truncate flex-1">{leadDrawer.sourceUrl}</code>
                <button onClick={() => { navigator.clipboard?.writeText(leadDrawer.sourceUrl); toast('URL kopiert.'); }} className="btn-ghost px-2 py-1"><Copy className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div><p className="label">Suggested coach note</p><p className="text-sm text-ink-700 italic">"{leadDrawer.coachNote}"</p></div>
            <button onClick={() => toast('Lead zum Report hinzugefuegt.')} className="btn-secondary w-full"><FileBarChart className="h-4 w-4" /> Add to report</button>
          </div>
        )}
      </Drawer>

      {/* Add school modal */}
      <Modal open={addSchoolOpen} onClose={() => setAddSchoolOpen(false)} title="Schule hinzufuegen"
        footer={<><button className="btn-secondary" onClick={() => setAddSchoolOpen(false)}>Abbrechen</button><button className="btn-primary" onClick={addSchool}>Hinzufuegen</button></>}
      >
        <div><label className="label">Schulname</label><input className="input" value={newSchoolName} onChange={(e) => setNewSchoolName(e.target.value)} placeholder="z.B. AZAV Academy" autoFocus /></div>
        <div><label className="label">Kontakt</label><input className="input" value={newSchoolContact} onChange={(e) => setNewSchoolContact(e.target.value)} placeholder="z.B. Lena Brandt" /></div>
      </Modal>

      {/* Rename school modal */}
      <Modal open={!!renameSchool} onClose={() => setRenameSchool(null)} title="Schule umbenennen"
        footer={<><button className="btn-secondary" onClick={() => setRenameSchool(null)}>Abbrechen</button><button className="btn-primary" onClick={doRenameSchool}>Speichern</button></>}
      >
        <div><label className="label">Neuer Name</label><input className="input" value={renameSchoolValue} onChange={(e) => setRenameSchoolValue(e.target.value)} autoFocus /></div>
      </Modal>

      {/* Archive school confirm */}
      <ConfirmDialog open={!!archiveSchool} onClose={() => setArchiveSchool(null)} onConfirm={doArchiveSchool}
        title="Schule archivieren" message={`Moechten Sie "${archiveSchool?.name}" wirklich archivieren?`}
        confirmLabel="Archivieren" danger
      />

      {/* Add course modal */}
      <Modal open={addCourseOpen} onClose={() => setAddCourseOpen(false)} title="Kurs hinzufuegen"
        footer={<><button className="btn-secondary" onClick={() => setAddCourseOpen(false)}>Abbrechen</button><button className="btn-primary" onClick={addCourse}>Hinzufuegen</button></>}
      >
        <div><label className="label">Kursname</label><input className="input" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} placeholder="z.B. Data Analyst Weiterbildung" autoFocus /></div>
        <div><label className="label">Thema</label><input className="input" value={newCourseTopic} onChange={(e) => setNewCourseTopic(e.target.value)} placeholder="z.B. Data / BI" /></div>
      </Modal>

      {/* Rename course modal */}
      <Modal open={!!renameCourse} onClose={() => setRenameCourse(null)} title="Kurs umbenennen"
        footer={<><button className="btn-secondary" onClick={() => setRenameCourse(null)}>Abbrechen</button><button className="btn-primary" onClick={doRename}>Speichern</button></>}
      >
        <div><label className="label">Neuer Name</label><input className="input" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} autoFocus /></div>
      </Modal>

      {/* Archive course confirm */}
      <ConfirmDialog open={!!archiveCourse} onClose={() => setArchiveCourse(null)} onConfirm={doArchive}
        title="Kurs archivieren" message={`Moechten Sie "${archiveCourse?.name}" wirklich archivieren? Der Kurs wird inaktiv und nicht mehr in Reports beruecksichtigt.`}
        confirmLabel="Archivieren" danger
      />

      {/* Diff modal */}
      <Modal open={!!diffRequest} onClose={() => setDiffRequest(null)} title="Diff-Ansicht"
        footer={<>
          <button className="btn-secondary" onClick={() => setDiffRequest(null)}>Schliessen</button>
          {diffRequest?.status === 'open' && (
            <>
              <button className="btn-secondary text-rose-600" onClick={() => { if (diffRequest) rejectChange(diffRequest.id); setDiffRequest(null); }}><X className="h-4 w-4" /> Ablehnen</button>
              <button className="btn-accent" onClick={() => { if (diffRequest) approveChange(diffRequest.id); setDiffRequest(null); }}><Check className="h-4 w-4" /> Genehmigen</button>
            </>
          )}
        </>}
      >
        {diffRequest && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="chip">{diffRequest.field}</span>
              <span className="text-xs text-ink-500">{diffRequest.submittedBy} — {diffRequest.date}</span>
            </div>
            <div>
              <p className="label">Vorgeschlagene AEnderung</p>
              <p className="text-sm text-ink-700">{diffRequest.suggestion}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 mb-2">Alter Wert</p>
                <p className="text-sm text-ink-700 font-mono break-words">{diffRequest.oldValue}</p>
              </div>
              <div className="rounded-xl border border-accent-200 bg-accent-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-600 mb-2">Neuer Wert</p>
                <p className="text-sm text-ink-700 font-mono break-words">{diffRequest.newValue}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
