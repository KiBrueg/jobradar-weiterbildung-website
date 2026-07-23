import { useMemo, useState } from 'react';
import {
  Search as SearchIcon,
  Download,
  Menu,
  School as SchoolIcon,
  BookOpen,
  Radar,
  ShieldCheck,
  Gauge,
  Server,
  Workflow,
  Database,
  CheckCircle2,
  Plus,
  Pencil,
  Archive,
  FileText,
  GitPullRequestArrow,
  FileBarChart,
  Filter,
  Copy,
  Check,
  X,
  Upload,
  Eye,
  Code2,
  AlertTriangle,
  Info,
  Trash2,
  RotateCcw,
  Zap,
  Globe,
} from 'lucide-react';
import Sidebar, { sections, type SectionKey } from '@/components/Sidebar';
import KpiCard from '@/components/KpiCard';
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

  const [leadStatusFilter, setLeadStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [leadSchoolFilter, setLeadSchoolFilter] = useState<number | 'all'>('all');
  const [leadCourseFilter, setLeadCourseFilter] = useState<number | 'all'>('all');
  const [leadMinScore, setLeadMinScore] = useState(0);

  const [profileSchoolFilter, setProfileSchoolFilter] = useState<number | 'all'>('all');
  const [profileStatusFilter, setProfileStatusFilter] = useState<string>('all');
  const [profileOnlyActive, setProfileOnlyActive] = useState(false);
  const [profileOnlyOpenChanges, setProfileOnlyOpenChanges] = useState(false);

  const [addSchoolOpen, setAddSchoolOpen] = useState(false);
  const [renameSchool, setRenameSchool] = useState<School | null>(null);
  const [archiveSchool, setArchiveSchool] = useState<School | null>(null);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolContact, setNewSchoolContact] = useState('');
  const [renameSchoolValue, setRenameSchoolValue] = useState('');

  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [renameCourse, setRenameCourse] = useState<Course | null>(null);
  const [archiveCourse, setArchiveCourse] = useState<Course | null>(null);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseTopic, setNewCourseTopic] = useState('');
  const [renameValue, setRenameValue] = useState('');

  const [docSchool, setDocSchool] = useState<number>(schools[0].id);
  const [docCourse, setDocCourse] = useState<number>(courses[0].id);
  const [docType, setDocType] = useState<string>(documentTypes[0]);
  const [docName, setDocName] = useState('');

  const [diffRequest, setDiffRequest] = useState<ChangeRequest | null>(null);
  const [showPayload, setShowPayload] = useState(false);

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

  return (
    <div className="min-h-screen bg-ink-50 flex">
      <Sidebar active={section} onSelect={setSection} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 glass border-b border-ink-200/60">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost px-2" aria-label="Menue">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-semibold tracking-tight text-ink-900">{activeSection.label}</h1>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button onClick={goLanding} className="btn-ghost px-2" aria-label="Zur Landing Page"><X className="h-4 w-4" /></button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {section === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KpiCard label="Schulen" value={schools.length} icon={SchoolIcon} accent="brand" />
                <KpiCard label="Aktive Kurse" value={courses.filter((c) => c.status === 'active').length} icon={BookOpen} accent="accent" />
                <KpiCard label="Suchprofile" value={profiles.length} icon={SearchIcon} accent="cyanx" />
                <KpiCard label="Leads diese Woche" value={leads.length} icon={Radar} accent="brand" />
                <KpiCard label="QA offen" value={leads.filter((l) => l.status === 'QA Needed').length} icon={ShieldCheck} accent="ink" />
                <KpiCard label="OE Match Score" value={Math.round(leads.reduce((a, l) => a + l.score, 0) / Math.max(1, leads.length))} icon={Gauge} accent="accent" />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
