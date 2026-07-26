export type SchoolStatus = 'active' | 'archived';
export type CourseStatus = 'active' | 'draft' | 'archived' | 'risk';
export type ProfileStatus = 'active' | 'draft' | 'review';
export type LeadStatus = 'Candidate' | 'QA Needed' | 'Approved' | 'Rejected';
export type ChangeStatus = 'open' | 'approved' | 'rejected';
export type WorkflowStatus = 'completed' | 'running' | 'paused' | 'failed' | 'waiting';

export interface School {
  id: number;
  name: string;
  status: SchoolStatus;
  contact: string;
  coursesCount: number;
  leadsCount: number;
  note: string;
}

export interface Course {
  id: number;
  schoolId: number;
  name: string;
  topic: string;
  status: CourseStatus;
  searchProfileId: number | null;
  leads: number;
  documents: number;
  score: number;
}

export interface SearchProfile {
  id: number;
  courseId: number;
  targetTitles: string[];
  skills: string[];
  locationRules: string;
  languageRules: string;
  exclusions: string[];
  sourceQueries: string[];
  coachNote: string;
  status: ProfileStatus;
  activeQueries: number;
  lastChanged: string;
  hasOpenChange: boolean;
}

export interface Lead {
  id: number;
  courseId: number;
  title: string;
  company: string;
  score: number;
  status: LeadStatus;
  risks: string;
  source: string;
  sourceUrl: string;
  whyFit: string;
  missingEvidence: string;
  coachNote: string;
}

export interface DocItem {
  id: number;
  name: string;
  schoolId: number;
  courseId: number | null;
  type: string;
  uploadedBy: string;
  date: string;
  access: 'private' | 'school' | 'public';
}

export interface ChangeRequest {
  id: number;
  schoolId: number;
  courseId: number;
  field: string;
  suggestion: string;
  oldValue: string;
  newValue: string;
  submittedBy: string;
  status: ChangeStatus;
  date: string;
}

export interface WorkflowRun {
  id: number;
  workflow: string;
  mode: 'test' | 'live' | 'paused';
  status: WorkflowStatus;
  items: number;
  createdLeads: number;
  lastRun: string;
}

export const schools: School[] = [
  { id: 1, name: 'AZAV Academy', status: 'active', contact: 'Lena Brandt', coursesCount: 1, leadsCount: 52, note: 'Berlin, AZAV-zertifiziert, Fokus Data & BI.' },
  { id: 2, name: 'Data School EU', status: 'active', contact: 'Marc Voss', coursesCount: 1, leadsCount: 47, note: 'Remote-first, Python & AI Automation.' },
  { id: 3, name: 'Future Skills GmbH', status: 'active', contact: 'Sandra Klein', coursesCount: 1, leadsCount: 33, note: 'SAP & Data Basics, Berlin.' },
  { id: 4, name: 'BI Campus', status: 'active', contact: 'Tobias Rahn', coursesCount: 1, leadsCount: 28, note: 'Power BI, Reporting, BI-Track.' },
  { id: 5, name: 'Remote Code School', status: 'active', contact: 'Jana Frey', coursesCount: 1, leadsCount: 24, note: 'Python Backend Bootcamps, remote.' },
];

export const courses: Course[] = [
  { id: 1, schoolId: 1, name: 'Data Analyst Weiterbildung', topic: 'Data Analytics', status: 'active', searchProfileId: 1, leads: 24, documents: 2, score: 92 },
  { id: 2, schoolId: 2, name: 'AI Automation / n8n Course', topic: 'AI Automation', status: 'active', searchProfileId: 2, leads: 14, documents: 1, score: 86 },
  { id: 3, schoolId: 3, name: 'SAP + Data Basics', topic: 'SAP / Data', status: 'active', searchProfileId: 3, leads: 19, documents: 1, score: 74 },
  { id: 4, schoolId: 4, name: 'Business Intelligence Track', topic: 'BI / Reporting', status: 'active', searchProfileId: 4, leads: 16, documents: 2, score: 88 },
  { id: 5, schoolId: 5, name: 'Python Backend Bootcamp', topic: 'Python Backend', status: 'risk', searchProfileId: null, leads: 13, documents: 0, score: 71 },
];

export const searchProfiles: SearchProfile[] = [
  {
    id: 1, courseId: 1,
    targetTitles: ['Junior Data Analyst', 'BI Analyst', 'Reporting Analyst', 'Data Quality Analyst'],
    skills: ['SQL', 'Excel', 'Power BI', 'Python basics', 'dashboards', 'data cleaning'],
    locationRules: 'Remote Germany / EU, Berlin optional, no on-site requirement',
    languageRules: 'German B1/B2 OK, English OK, entry-level or junior only',
    exclusions: ['Senior', 'Lead', 'Manager', '5+ years', 'pure controlling', 'on-site only'],
    sourceQueries: ['site:arbeitsagentur.de Data Analyst Junior Remote', 'Junior BI Analyst Berlin Remote', 'Data Quality Analyst Einstieg'],
    coachNote: 'Coach focus: realistic entry titles and skill gaps.',
    status: 'active', activeQueries: 3, lastChanged: 'vor 2 Tagen', hasOpenChange: true,
  },
  {
    id: 2, courseId: 2,
    targetTitles: ['Workflow Automation Junior', 'Automation Assistant', 'n8n Operator'],
    skills: ['n8n', 'APIs', 'JSON', 'no-code tools', 'OpenAI APIs'],
    locationRules: 'Remote EU',
    languageRules: 'English B2+, German optional',
    exclusions: ['Senior', 'Lead', 'Manager', '5+ years'],
    sourceQueries: ['workflow automation junior remote', 'n8n operator remote', 'AI automation assistant entry'],
    coachNote: 'Automation-Einsteiger, no-code-nah.',
    status: 'active', activeQueries: 3, lastChanged: 'vor 4 Tagen', hasOpenChange: false,
  },
  {
    id: 3, courseId: 3,
    targetTitles: ['SAP Support Analyst Junior', 'SAP Junior', 'Data Analyst SAP'],
    skills: ['SAP basics', 'Excel', 'SQL basics', 'data entry'],
    locationRules: 'Berlin + Remote DACH',
    languageRules: 'German B2 required',
    exclusions: ['Senior', 'Lead', '5+ years', 'on-site only'],
    sourceQueries: ['sap support analyst junior', 'sap data analyst entry', 'SAP junior remote DACH'],
    coachNote: 'SAP-Einsteiger, Berlin/Remote.',
    status: 'active', activeQueries: 3, lastChanged: 'vor 1 Woche', hasOpenChange: false,
  },
  {
    id: 4, courseId: 4,
    targetTitles: ['BI Analyst Junior', 'Power BI Reporting Specialist', 'Reporting Analyst'],
    skills: ['Power BI', 'DAX', 'Tableau', 'SQL', 'Excel', 'ETL basics'],
    locationRules: 'Remote DACH + Berlin/Hamburg',
    languageRules: 'German B2 or English C1',
    exclusions: ['Senior', 'Lead', 'Manager', '5+ years'],
    sourceQueries: ['BI analyst junior remote', 'power BI reporting specialist', 'reporting analyst DACH entry'],
    coachNote: 'BI-Track, breites Reporting-Profil.',
    status: 'active', activeQueries: 3, lastChanged: 'vor 1 Tag', hasOpenChange: true,
  },
];

export const leads: Lead[] = [
  { id: 1, courseId: 1, title: 'Junior Data Analyst Remote', company: 'Acme Data GmbH', score: 87, status: 'Candidate', risks: 'Check German requirement', source: 'Flow 4 Job APIs', sourceUrl: 'https://example.com/job/data-analyst', whyFit: 'SQL/Power BI Profil passt, Entry-level erkennbar, Remote DACH.', missingEvidence: 'Sprachniveau nicht angegeben.', coachNote: 'Guter Kandidat, Sprache pruefen.' },
  { id: 2, courseId: 4, title: 'Junior BI Analyst Berlin', company: 'ReportWorks GmbH', score: 82, status: 'QA Needed', risks: 'Hybrid risk', source: 'Flow 4 Job APIs', sourceUrl: 'https://example.com/job/bi-analyst', whyFit: 'BI-Analyst, Berlin/hybrid, Power BI + SQL.', missingEvidence: 'AZAV-Nachweis fehlt.', coachNote: 'Hybrid ok? mit Teilnehmer klaeren.' },
  { id: 3, courseId: 2, title: 'Workflow Automation Assistant', company: 'AutomateNow GmbH', score: 79, status: 'Approved', risks: 'Check seniority', source: 'Flow 4 Job APIs', sourceUrl: 'https://example.com/job/automation', whyFit: 'Automation, no-code, n8n, Einsteiger.', missingEvidence: 'Keine', coachNote: 'Freigegeben fuer Report.' },
  { id: 4, courseId: 3, title: 'SAP Support Analyst Junior', company: 'ERP Bridge GmbH', score: 73, status: 'Candidate', risks: 'German required', source: 'Flow 4 Job APIs', sourceUrl: 'https://example.com/job/sap-support', whyFit: 'SAP-Support, Junior, Berlin/Remote.', missingEvidence: 'Sprachniveau B2?', coachNote: 'Sprache pruefen.' },
  { id: 5, courseId: 4, title: 'Power BI Reporting Specialist', company: 'Dashboard Factory GmbH', score: 76, status: 'Rejected', risks: 'Too senior', source: 'Flow 4 Job APIs', sourceUrl: 'https://example.com/job/power-bi', whyFit: 'Power BI, Reporting.', missingEvidence: 'Senioritaet zu hoch.', coachNote: 'Ausgeschlossen wg. Erfahrung.' },
];

export const documents: DocItem[] = [
  { id: 1, name: 'Curriculum_Data_Analyst.pdf', schoolId: 1, courseId: 1, type: 'Curriculum', uploadedBy: 'Lena Brandt', date: '12.07.2026', access: 'school' },
  { id: 2, name: 'AZAV_Nachweis_Data.pdf', schoolId: 1, courseId: 1, type: 'AZAV proof', uploadedBy: 'Lena Brandt', date: '10.07.2026', access: 'school' },
  { id: 3, name: 'Skill_Matrix_BI.xlsx', schoolId: 4, courseId: 4, type: 'Skill matrix', uploadedBy: 'Tobias Rahn', date: '14.07.2026', access: 'private' },
  { id: 4, name: 'SAP_Course_Syllabus.docx', schoolId: 3, courseId: 3, type: 'Syllabus', uploadedBy: 'Sandra Klein', date: '08.07.2026', access: 'school' },
  { id: 5, name: 'n8n_Automation_Notes.md', schoolId: 2, courseId: 2, type: 'Other', uploadedBy: 'Marc Voss', date: '15.07.2026', access: 'private' },
];

export const changeRequests: ChangeRequest[] = [
  { id: 1, schoolId: 1, courseId: 1, field: 'Zielberufe', suggestion: '"Power BI Junior" zu Zielberufen hinzufuegen', oldValue: 'Junior Data Analyst, BI Analyst, Reporting Analyst, Data Quality Analyst', newValue: 'Junior Data Analyst, BI Analyst, Reporting Analyst, Data Quality Analyst, Power BI Junior', submittedBy: 'Lena Brandt', status: 'open', date: 'vor 1 Tag' },
  { id: 2, schoolId: 1, courseId: 1, field: 'Ausschluesse', suggestion: '"Senior Consultant" aus akzeptierten Titeln entfernen', oldValue: 'Senior, Lead, Manager, 5+ years, pure controlling, on-site only', newValue: 'Senior, Lead, Manager, 5+ years, pure controlling, on-site only, Senior Consultant', submittedBy: 'Coach Team', status: 'open', date: 'vor 2 Tagen' },
  { id: 3, schoolId: 4, courseId: 4, field: 'Sprachregeln', suggestion: '"German B1/B2" zu Sprachregeln hinzufuegen', oldValue: 'German B2 or English C1', newValue: 'German B1/B2 or English C1', submittedBy: 'Tobias Rahn', status: 'open', date: 'vor 3 Tagen' },
  { id: 4, schoolId: 3, courseId: 3, field: 'Standortregeln', suggestion: '"Remote EU" zu Location hinzufuegen', oldValue: 'Berlin + Remote DACH', newValue: 'Berlin + Remote DACH + Remote EU', submittedBy: 'Sandra Klein', status: 'open', date: 'vor 4 Tagen' },
];

export const workflowRuns: WorkflowRun[] = [
  { id: 1, workflow: 'Connection Test', mode: 'test', status: 'completed', items: 1, createdLeads: 1, lastRun: 'vor 2 Std.' },
  { id: 2, workflow: 'Flow 4 Job APIs', mode: 'test', status: 'waiting', items: 0, createdLeads: 0, lastRun: 'vor 4 Std.' },
  { id: 3, workflow: 'Weekly Report Generator', mode: 'paused', status: 'paused', items: 0, createdLeads: 0, lastRun: 'vor 3 Tagen' },
];

export const documentTypes = [
  'Curriculum',
  'AZAV proof',
  'Syllabus',
  'Skill matrix',
  'Screenshot',
  'Certificate',
  'Other',
];

export const leadStatuses: LeadStatus[] = ['Candidate', 'QA Needed', 'Approved', 'Rejected'];

export const testPayload = {
  step_1_get_tasks: {
    method: 'GET',
    path: '/api/n8n/search-tasks',
  },
  step_2_workflow_run: {
    method: 'POST',
    path: '/api/n8n/workflow-runs',
    body: {
      workflow_name: 'Flow 4 Job APIs - Integration Test',
      run_mode: 'test',
      status: 'completed',
      input_count: 3,
      output_count: 1,
      note: 'n8n smoke run',
    },
  },
  step_3_source_run: {
    method: 'POST',
    path: '/api/n8n/source-runs',
    body: {
      workflow_run_id: 123,
      items: [{ source_name: 'RemoteOK', source_type: 'job_board', raw_items: 25, normalized_items: 23, duplicate_items: 4, relevant_items: 6, failed_items: 0, quality_score: 91, risk_level: 'low' }],
    },
  },
  step_4_cost_event: {
    method: 'POST',
    path: '/api/n8n/cost-events',
    body: {
      workflow_run_id: 123,
      items: [{ tool_name: 'OpenRouter', tool_type: 'llm', source_name: 'RemoteOK', units: 1200, unit_type: 'tokens', estimated_cost: 0.002 }],
    },
  },
  step_5_leads: {
    method: 'POST',
    path: '/api/n8n/leads',
    body: {
      workflow_name: 'Flow 4 Job APIs - Integration Test',
      run_mode: 'test',
      items: [
        {
          course_id: 1,
          title: 'Junior Data Analyst Remote',
          provider: 'Acme GmbH',
          status: 'Candidate',
          score: 77,
          source_url: 'https://example.com/job',
          why_fit: 'Matches SQL/Power BI profile',
          missing_evidence: 'QA check needed',
          risks: 'Check seniority and language requirement',
        },
      ],
    },
  },
};

export function schoolName(id: number): string {
  return schools.find((s) => s.id === id)?.name ?? '—';
}
export function courseName(id: number): string {
  return courses.find((c) => c.id === id)?.name ?? '—';
}
export function profileForCourse(courseId: number): SearchProfile | undefined {
  return searchProfiles.find((p) => p.courseId === courseId);
}
