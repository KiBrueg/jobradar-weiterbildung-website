import { useState, useMemo } from 'react';
import {
  Clock,
  TrendingUp,
  Euro,
  Gauge,
  Rocket,
  ShieldCheck,
  Target,
  Wallet,
  BarChart3,
  Calendar,
  ChevronRight,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  Activity,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Lightbulb,
} from 'lucide-react';
import { Modal, Drawer } from '@/components/ui';
import { useToast } from '@/components/Toast';

type TimeRange = 'tag' | 'woche' | 'monat' | 'jahr';

interface DashboardData {
  rawJobs: number;
  duplicates: number;
  relevantLeads: number;
  topRecommendations: number;
  qaOpen: number;
  reportsPrepared: number;
  serpApiCost: number;
  llmCost: number;
  jinaCost: number;
  n8nCost: number;
  hostingCost: number;
  otherApiCost: number;
  manualJobsPerHour: number;
  qaMinutesPerRelevantLead: number;
  manualHoursTotal: number;
  automatedHoursTotal: number;
  hourlyRate: number;
  reportValue: number;
  avgMatchScore: number;
  seniorityRisk: number;
  locationFit: number;
  languageFit: number;
  sourceQuality: number;
  qaBacklog: number;
  automationSafety: number;
  costControl: number;
}

interface DashboardKpis {
  zeitersparnisPct: number;
  gesparteZeitH: number;
  nettoEffekt: number;
  roi: number;
  produktivitaetsfaktor: number;
  automationSafetyPct: number;
  arbeitsmarktFitPct: number;
  toolKosten: number;
  changes: Record<string, { value: string; up: boolean }>;
}

interface KpiCardData {
  label: string;
  value: string;
  subtext: string;
  comparison: string;
  comparisonUp: boolean;
  status: string;
  statusColor: 'green' | 'blue' | 'amber' | 'cyan' | 'ink';
  spark: number[];
  icon: typeof Clock;
  iconColor: string;
  formula?: string;
  explanation?: string;
  action?: string;
}

interface CostRow {
  tool: string;
  typ: string;
  runsHeute: number;
  items: number;
  kostenHeute: number;
  kostenMonat: number;
  kostenJahr: number;
  status: string;
  optimierung: string;
  category: string;
}

interface SourceHealthRow {
  name: string;
  status: string;
  erfolgsrate: number;
  runs: number;
  rawJobs: number;
  relevantLeads: number;
  letzterLauf: string;
  trefferqualitaet: string;
  kosten: string;
  risiko: string;
}

interface CoursePerfRow {
  kurs: string;
  schule: string;
  fit: number;
  leadsMonat: number;
  leadsJahr: number;
  qaOffen: number;
  risiko: string;
  empfehlung: string;
}

const dashboardDataByRange: Record<TimeRange, DashboardData> = {
  tag: {
    rawJobs: 12, duplicates: 3, relevantLeads: 3, topRecommendations: 1,
    qaOpen: 2, reportsPrepared: 0,
    serpApiCost: 0.06, llmCost: 0.04, jinaCost: 0.01, n8nCost: 0.05, hostingCost: 0.13, otherApiCost: 0,
    manualJobsPerHour: 10, qaMinutesPerRelevantLead: 2,
    manualHoursTotal: 2.5, automatedHoursTotal: 0.7,
    hourlyRate: 45, reportValue: 15,
    avgMatchScore: 78, seniorityRisk: 22, locationFit: 84, languageFit: 71,
    sourceQuality: 88, qaBacklog: 2, automationSafety: 91, costControl: 93,
  },
  woche: {
    rawJobs: 46, duplicates: 12, relevantLeads: 10, topRecommendations: 3,
    qaOpen: 4, reportsPrepared: 1,
    serpApiCost: 0.43, llmCost: 0.26, jinaCost: 0.04, n8nCost: 0.35, hostingCost: 0.92, otherApiCost: 0,
    manualJobsPerHour: 10, qaMinutesPerRelevantLead: 2,
    manualHoursTotal: 17.5, automatedHoursTotal: 4.9,
    hourlyRate: 45, reportValue: 105,
    avgMatchScore: 78, seniorityRisk: 22, locationFit: 84, languageFit: 71,
    sourceQuality: 88, qaBacklog: 4, automationSafety: 91, costControl: 93,
  },
  monat: {
    rawJobs: 184, duplicates: 46, relevantLeads: 39, topRecommendations: 10,
    qaOpen: 17, reportsPrepared: 5,
    serpApiCost: 1.84, llmCost: 1.12, jinaCost: 0.18, n8nCost: 1.5, hostingCost: 4.0, otherApiCost: 0,
    manualJobsPerHour: 10, qaMinutesPerRelevantLead: 2,
    manualHoursTotal: 74, automatedHoursTotal: 21,
    hourlyRate: 45, reportValue: 455,
    avgMatchScore: 78, seniorityRisk: 22, locationFit: 84, languageFit: 71,
    sourceQuality: 88, qaBacklog: 17, automationSafety: 91, costControl: 93,
  },
  jahr: {
    rawJobs: 2208, duplicates: 552, relevantLeads: 468, topRecommendations: 126,
    qaOpen: 17, reportsPrepared: 58,
    serpApiCost: 22.08, llmCost: 13.44, jinaCost: 2.16, n8nCost: 18, hostingCost: 48, otherApiCost: 0,
    manualJobsPerHour: 10, qaMinutesPerRelevantLead: 2,
    manualHoursTotal: 888, automatedHoursTotal: 252,
    hourlyRate: 45, reportValue: 5460,
    avgMatchScore: 78, seniorityRisk: 22, locationFit: 84, languageFit: 71,
    sourceQuality: 88, qaBacklog: 17, automationSafety: 91, costControl: 93,
  },
};

function calculateDashboardKpis(data: DashboardData): DashboardKpis {
  const toolKosten =
    data.serpApiCost + data.llmCost + data.jinaCost +
    data.n8nCost + data.hostingCost + data.otherApiCost;

  const gesparteZeitH = data.manualHoursTotal - data.automatedHoursTotal;
  const zeitersparnisPct = data.manualHoursTotal > 0
    ? (gesparteZeitH / data.manualHoursTotal) * 100 : 0;

  const bruttoErsparnis = gesparteZeitH * data.hourlyRate;
  const gesamtnutzen = bruttoErsparnis + data.reportValue;
  const nettoEffekt = gesamtnutzen - toolKosten;
  const roi = toolKosten > 0 ? gesamtnutzen / toolKosten : 0;

  const automatedReviewHours = data.relevantLeads * data.qaMinutesPerRelevantLead / 60;
  const jobRadarItemsPerReviewHour = automatedReviewHours > 0 ? data.rawJobs / automatedReviewHours : 0;
  const produktivitaetsfaktor = data.manualJobsPerHour > 0 ? jobRadarItemsPerReviewHour / data.manualJobsPerHour : 0;

  return {
    zeitersparnisPct: Math.round(zeitersparnisPct),
    gesparteZeitH: Math.round(gesparteZeitH),
    nettoEffekt: Math.round(nettoEffekt),
    roi: Math.round(roi * 10) / 10,
    produktivitaetsfaktor: Math.round(produktivitaetsfaktor * 10) / 10,
    automationSafetyPct: data.automationSafety,
    arbeitsmarktFitPct: data.avgMatchScore,
    toolKosten: Math.round(toolKosten),
    changes: {
      zeitersparnis: { value: '+8% vs. letzter Monat', up: true },
      gesparteZeit: { value: '+11 h vs. letzter Monat', up: true },
      nettoEffekt: { value: '+€420 vs. letzter Monat', up: true },
      roi: { value: '+2.1x vs. letzter Monat', up: true },
      produktivitaet: { value: '+0.6x vs. letzter Monat', up: true },
      automation: { value: '-2% vs. letzter Monat', up: false },
      arbeitsmarkt: { value: '+4% vs. letzter Monat', up: true },
      toolKosten: { value: '+€13 vs. letzter Monat', up: false },
    },
  };
}


const sparkData = (base: number, variance: number, seed: number): number[] => {
  const result: number[] = [];
  for (let i = 0; i < 7; i++) {
    const v = base + Math.sin(seed + i * 1.3) * variance;
    result.push(Math.max(0, Math.round(v)));
  }
  return result;
};

const costRows: CostRow[] = [
  { tool: 'SerpAPI', typ: 'Job Search API', runsHeute: 8, items: 96, kostenHeute: 1.84, kostenMonat: 42.60, kostenJahr: 511, status: 'OK', optimierung: 'Queries bündeln', category: 'paid' },
  { tool: 'OpenRouter LLM', typ: 'LLM Parsing', runsHeute: 39, items: 39, kostenHeute: 1.12, kostenMonat: 31.80, kostenJahr: 382, status: 'OK', optimierung: 'Nur nach Vorfilter', category: 'llm' },
  { tool: 'Arbeitnow Scraper', typ: 'Free Source', runsHeute: 3, items: 44, kostenHeute: 0, kostenMonat: 0, kostenJahr: 0, status: 'OK', optimierung: 'Weiter nutzen', category: 'free' },
  { tool: 'Remotive', typ: 'Free Source', runsHeute: 3, items: 28, kostenHeute: 0, kostenMonat: 0, kostenJahr: 0, status: 'OK', optimierung: 'Dedupe prüfen', category: 'free' },
  { tool: 'RemoteOK', typ: 'Scraper/API', runsHeute: 2, items: 21, kostenHeute: 0, kostenMonat: 0, kostenJahr: 0, status: 'Watch', optimierung: 'Rate limit beachten', category: 'free' },
  { tool: 'Jina Reader', typ: 'Page Fetch / CRAG', runsHeute: 7, items: 7, kostenHeute: 0.18, kostenMonat: 6.20, kostenJahr: 74, status: 'OK', optimierung: 'Nur für QA-Risiko', category: 'paid' },
  { tool: 'n8n', typ: 'Workflow Automation', runsHeute: 12, items: 0, kostenHeute: 1.50, kostenMonat: 30.00, kostenJahr: 360, status: 'OK', optimierung: 'Self-hosted stabil', category: 'n8n' },
  { tool: 'Hosting (VPS)', typ: 'Infrastructure', runsHeute: 0, items: 0, kostenHeute: 4.00, kostenMonat: 30.00, kostenJahr: 360, status: 'OK', optimierung: 'Ausreichend für MVP', category: 'hosting' },
  { tool: 'Localtunnel', typ: 'Temporary Bridge', runsHeute: 1, items: 0, kostenHeute: 0, kostenMonat: 0, kostenJahr: 0, status: 'Temporary', optimierung: 'Production URL ersetzen', category: 'infra' },
  { tool: 'SQLite Local DB', typ: 'Storage', runsHeute: 0, items: 268, kostenHeute: 0, kostenMonat: 0, kostenJahr: 0, status: 'OK', optimierung: 'Backup planen', category: 'infra' },
];

const sourceHealthRows: SourceHealthRow[] = [
  { name: 'SerpAPI Google Jobs', status: 'OK', erfolgsrate: 96, runs: 8, rawJobs: 96, relevantLeads: 22, letzterLauf: 'vor 2 h', trefferqualitaet: 'High', kosten: 'Medium', risiko: 'Low' },
  { name: 'Arbeitnow', status: 'OK', erfolgsrate: 92, runs: 3, rawJobs: 44, relevantLeads: 8, letzterLauf: 'vor 3 h', trefferqualitaet: 'Medium', kosten: 'Free', risiko: 'Low' },
  { name: 'Remotive', status: 'OK', erfolgsrate: 88, runs: 3, rawJobs: 28, relevantLeads: 5, letzterLauf: 'vor 4 h', trefferqualitaet: 'Medium', kosten: 'Free', risiko: 'Low' },
  { name: 'RemoteOK', status: 'Watch', erfolgsrate: 72, runs: 2, rawJobs: 21, relevantLeads: 2, letzterLauf: 'vor 6 h', trefferqualitaet: 'Medium', kosten: 'Free', risiko: 'Rate limit' },
  { name: 'Jobicy', status: 'Paused', erfolgsrate: 0, runs: 0, rawJobs: 0, relevantLeads: 0, letzterLauf: 'vor 3 T', trefferqualitaet: 'Unknown', kosten: 'Free', risiko: 'Source changed' },
  { name: 'Himalayas', status: 'OK', erfolgsrate: 84, runs: 2, rawJobs: 18, relevantLeads: 3, letzterLauf: 'vor 5 h', trefferqualitaet: 'Medium', kosten: 'Free', risiko: 'Low' },
  { name: 'Bundesagentur Jobsuche', status: 'OK', erfolgsrate: 91, runs: 4, rawJobs: 52, relevantLeads: 12, letzterLauf: 'vor 1 h', trefferqualitaet: 'High', kosten: 'Free', risiko: 'Low' },
  { name: 'Company ATS', status: 'Watch', erfolgsrate: 78, runs: 3, rawJobs: 24, relevantLeads: 4, letzterLauf: 'vor 8 h', trefferqualitaet: 'High', kosten: 'Medium', risiko: 'Parser drift' },
  { name: 'RSS Feeds', status: 'OK', erfolgsrate: 95, runs: 6, rawJobs: 38, relevantLeads: 7, letzterLauf: 'vor 1 h', trefferqualitaet: 'Medium', kosten: 'Free', risiko: 'Low' },
];

const coursePerfRows: CoursePerfRow[] = [
  { kurs: 'Data Analyst Weiterbildung', schule: 'TechAcademy', fit: 87, leadsMonat: 42, leadsJahr: 504, qaOffen: 5, risiko: 'Low', empfehlung: 'Weiter skalieren' },
  { kurs: 'AI Automation / n8n Course', schule: 'TechAcademy', fit: 81, leadsMonat: 37, leadsJahr: 444, qaOffen: 4, risiko: 'Medium', empfehlung: 'Queries verfeinern' },
  { kurs: 'SAP + Data Basics', schule: 'BusinessHub', fit: 69, leadsMonat: 22, leadsJahr: 264, qaOffen: 6, risiko: 'Medium', empfehlung: 'Hybrid/Deutsch prüfen' },
  { kurs: 'Business Intelligence Track', schule: 'DataInstitute', fit: 84, leadsMonat: 31, leadsJahr: 372, qaOffen: 2, risiko: 'Low', empfehlung: 'Report vorbereiten' },
  { kurs: 'Python Backend Bootcamp', schule: 'CodeCamp', fit: 58, leadsMonat: 14, leadsJahr: 168, qaOffen: 7, risiko: 'High', empfehlung: 'Suchprofil überarbeiten' },
];

const ceoActions = [
  { title: 'Data Analyst & BI Kurse weiter skalieren', priority: 'Hoch', impact: '+€600 Monatsnutzen möglich' },
  { title: 'Python Backend Suchprofil prüfen — Fit unter 60%', priority: 'Hoch', impact: 'Risiko senken' },
  { title: 'SerpAPI Queries bündeln', priority: 'Mittel', impact: 'API-Kosten stabil halten' },
  { title: 'QA-Rückstau auf 10 Leads reduzieren', priority: 'Mittel', impact: 'Reportqualität erhöhen' },
  { title: 'Stabile Production-URL statt localtunnel planen', priority: 'Niedrig', impact: 'Betriebssicherheit erhöhen' },
];

const statusDotColor = (status: string): string => {
  if (status === 'OK') return 'bg-accent-500';
  if (status === 'Watch') return 'bg-amber-400';
  if (status === 'Problem') return 'bg-rose-500';
  return 'bg-ink-300';
};

const riskPill = (risk: string): string => {
  if (risk === 'Low') return 'bg-accent-50 text-accent-700 ring-accent-200';
  if (risk === 'Medium') return 'bg-amber-50 text-amber-700 ring-amber-200';
  return 'bg-rose-50 text-rose-700 ring-rose-200';
};

const priorityBadge = (p: string): string => {
  if (p === 'Hoch') return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
  if (p === 'Mittel') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
  return 'bg-ink-100 text-ink-600 ring-1 ring-ink-200';
};

const rangeLabel = (r: TimeRange): string =>
  r === 'tag' ? 'Tag' : r === 'woche' ? 'Woche' : r === 'monat' ? 'Monat' : 'Jahr';

const euroFmt = (n: number): string => `€${Math.round(n).toLocaleString('de-DE')}`;

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-8" role="img" aria-label="Trend-Visualisierung">
      {data.map((v, i) => (
        <div key={i} className={`w-1.5 rounded-sm ${color} transition-all`} style={{ height: `${(v / max) * 100}%`, opacity: 0.4 + (i / data.length) * 0.6 }} />
      ))}
    </div>
  );
}

function GaugeIndicator({ value, size = 200 }: { value: number; size?: number }) {
  const radius = size / 2 - 12;
  const circumference = Math.PI * radius;
  const pct = value / 100;
  const dash = circumference * pct;
  return (
    <div className="relative flex flex-col items-center" style={{ width: size }} role="img" aria-label={`Markt- und Risikoindikator: ${value} von 100`}>
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        <path d={`M 12 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2}`} fill="none" stroke="#eceef2" strokeWidth="10" strokeLinecap="round" />
        <path d={`M 12 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2}`} fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} ${circumference}`} />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" /><stop offset="35%" stopColor="#fbbf24" /><stop offset="65%" stopColor="#10b981" /><stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute bottom-2 flex flex-col items-center">
        <span className="font-display text-3xl font-bold text-ink-900 tabular-nums">{value}</span>
        <span className="text-xs text-ink-400 font-medium">/ 100</span>
      </div>
    </div>
  );
}

export default function CeoCockpit() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<TimeRange>('monat');
  const [viewMode, setViewMode] = useState<'ceo' | 'ops'>('ceo');
  const [statsTab, setStatsTab] = useState<'monat' | 'jahr'>('monat');
  const [costFilter, setCostFilter] = useState<string>('alle');
  const [kpiModal, setKpiModal] = useState<KpiCardData | null>(null);
  const [roiModal, setRoiModal] = useState(false);
  const [courseDrawer, setCourseDrawer] = useState<CoursePerfRow | null>(null);

  const data = useMemo(() => dashboardDataByRange[timeRange], [timeRange]);
  const kpis = useMemo(() => calculateDashboardKpis(data), [data]);

  const automatedReviewHours = data.relevantLeads * data.qaMinutesPerRelevantLead / 60;
  const jobRadarItemsPerReviewHour = automatedReviewHours > 0 ? data.rawJobs / automatedReviewHours : 0;
  const manualHours = data.manualJobsPerHour > 0 ? data.rawJobs / data.manualJobsPerHour : 0;

  const filteredCostRows = useMemo(() => {
    if (costFilter === 'alle') return costRows;
    return costRows.filter((r) => r.category === costFilter);
  }, [costFilter]);

  const statusBadgeColor = (color: string): string => {
    const map: Record<string, string> = {
      green: 'bg-accent-50 text-accent-700 ring-1 ring-accent-200',
      blue: 'bg-brand-50 text-brand-700 ring-1 ring-brand-200',
      amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      cyan: 'bg-cyanx-50 text-cyanx-600 ring-1 ring-cyanx-200',
      ink: 'bg-ink-100 text-ink-600 ring-1 ring-ink-200',
    };
    return map[color] || map.ink;
  };

  const kpiCards: KpiCardData[] = useMemo(() => {
    const c = kpis.changes;
    return [
      { label: 'Zeitersparnis', value: `${kpis.zeitersparnisPct}%`, subtext: 'gegenüber manueller Recherche', comparison: c.zeitersparnis.value, comparisonUp: c.zeitersparnis.up, status: kpis.zeitersparnisPct >= 70 ? 'Sehr hoch' : 'Hoch', statusColor: 'green', spark: sparkData(65, 8, 1), icon: Clock, iconColor: 'bg-accent-50 text-accent-600', formula: '(manuelle Zeit − automatisierte Zeit) / manuelle Zeit × 100', explanation: 'Vergleicht die Zeit für manuelle Recherche mit der Zeit, die JobRadar benötigt.', action: 'Suchprofile weiter optimieren, um Streuung zu reduzieren.' },
      { label: 'Gesparte Zeit', value: `${kpis.gesparteZeitH} h`, subtext: 'geschätzte Coach-Recherchezeit', comparison: c.gesparteZeit.value, comparisonUp: c.gesparteZeit.up, status: 'Stark', statusColor: 'green', spark: sparkData(40, 6, 2), icon: Clock, iconColor: 'bg-brand-50 text-brand-600', formula: 'Manuelle Recherchezeit − Automatisierte Recherchezeit', explanation: 'Absolute Stunden, die durch Automatisierung eingespart werden.', action: 'Mehr Kurse mit Suchprofilen verknüpfen, um Skalierungseffekt zu erhöhen.' },
      { label: 'Netto-Effekt', value: euroFmt(kpis.nettoEffekt), subtext: 'Nutzen abzüglich Tool-Kosten', comparison: c.nettoEffekt.value, comparisonUp: c.nettoEffekt.up, status: 'Positiv', statusColor: 'green', spark: sparkData(2200, 300, 3), icon: Euro, iconColor: 'bg-accent-50 text-accent-700', formula: 'Gesamtnutzen − Tool-Kosten', explanation: 'Monetärer Netto-Effekt: Gesparte Zeit + Reportwert − alle Tool-Kosten.', action: 'Stundensatz regelmäßig aktualisieren für präzise ROI-Berechnung.' },
      { label: 'ROI', value: `${kpis.roi}x`, subtext: 'Nutzen im Verhältnis zu Tool-Kosten', comparison: c.roi.value, comparisonUp: c.roi.up, status: kpis.roi >= 15 ? 'Sehr gut' : 'Gut', statusColor: 'green', spark: sparkData(15, 3, 4), icon: TrendingUp, iconColor: 'bg-brand-50 text-brand-700', formula: 'Monatlicher Gesamtnutzen / Tool-Kosten', explanation: 'Return on Investment: Wie viel Euro Nutzen pro Euro Tool-Kosten.', action: 'API-Kosten optimieren, um ROI weiter zu steigern.' },
      { label: 'Produktivitätsfaktor', value: `${kpis.produktivitaetsfaktor}x`, subtext: 'mehr geprüfte Stellen pro QA-Stunde', comparison: c.produktivitaet.value, comparisonUp: c.produktivitaet.up, status: 'Skaliert', statusColor: 'cyan', spark: sparkData(4, 0.5, 5), icon: Rocket, iconColor: 'bg-cyanx-50 text-cyanx-600', formula: '(Rohstellen / QA-Review-Stunden) ÷ manuelle Stellen/Stunde', explanation: 'Vergleicht wie viele Rohstellen pro QA-Stunde geprüft werden vs. manuell.', action: 'Neue Quellen hinzufügen, um Durchsatz weiter zu steigern.' },
      { label: 'Automation Safety', value: `${kpis.automationSafetyPct}%`, subtext: 'stabile Runs ohne manuelle Korrektur', comparison: c.automation.value, comparisonUp: c.automation.up, status: 'Stabil', statusColor: 'amber', spark: sparkData(90, 3, 6), icon: ShieldCheck, iconColor: 'bg-amber-50 text-amber-600', formula: 'Erfolgreiche Runs / Gesamtzahl Runs × 100', explanation: 'Anteil der Workflow-Runs, die ohne manuelle Korrektur abgeschlossen werden.', action: 'RemoteOK Rate-Limit überwachen und ggf. pausieren.' },
      { label: 'Arbeitsmarkt-Fit', value: `${kpis.arbeitsmarktFitPct}%`, subtext: 'durchschnittlicher Kurs-Match-Score', comparison: c.arbeitsmarkt.value, comparisonUp: c.arbeitsmarkt.up, status: 'Gut', statusColor: 'green', spark: sparkData(72, 5, 7), icon: Target, iconColor: 'bg-accent-50 text-accent-600', formula: 'Ø Match Score aller Kurse − Risiko-Penalty', explanation: 'Durchschnittlicher Fit zwischen Kursprofilen und aktuellem Arbeitsmarkt.', action: 'Python Backend Suchprofil überarbeiten (Fit < 60%).' },
      { label: 'Tool-Kosten', value: euroFmt(kpis.toolKosten), subtext: 'API, LLM, Scraper, n8n, Hosting', comparison: c.toolKosten.value, comparisonUp: c.toolKosten.up, status: 'Im Budget', statusColor: 'ink', spark: sparkData(100, 10, 8), icon: Wallet, iconColor: 'bg-ink-100 text-ink-600', formula: 'Summe aller API-, LLM-, Scraper-, n8n- und Hosting-Kosten', explanation: 'Betriebskosten für alle externen Dienste und Infrastruktur.', action: 'SerpAPI Queries bündeln, um Kosten zu senken.' },
    ];
  }, [kpis]);

  const gaugeScore = useMemo(() => {
    const fit = data.avgMatchScore, safety = data.automationSafety, sources = data.sourceQuality, cost = data.costControl;
    const qa = data.qaBacklog <= 10 ? 100 : Math.max(0, 100 - (data.qaBacklog - 10) * 5);
    return Math.round((fit + safety + sources + cost + qa) / 5);
  }, [data]);

  const gaugeLabel = gaugeScore >= 81 ? 'Starker Arbeitsmarkt-Fit' : gaugeScore >= 61 ? 'Guter Kurs-Fit' : 'Gemischt';
  const moodScore = gaugeScore;
  const moodLabel = moodScore >= 81 ? 'Sehr stark' : moodScore >= 61 ? 'Gut' : moodScore >= 41 ? 'Gemischt' : 'Kritisch';

  const statsItems = useMemo(() => [
    { label: 'Rohstellen geprüft', value: data.rawJobs.toLocaleString('de-DE'), icon: Filter },
    { label: 'Dubletten entfernt', value: data.duplicates.toLocaleString('de-DE'), icon: X },
    { label: 'Relevante Leads', value: data.relevantLeads.toLocaleString('de-DE'), icon: Target },
    { label: 'Top-Empfehlungen', value: data.topRecommendations.toLocaleString('de-DE'), icon: CheckCircle2 },
    { label: 'QA offen', value: data.qaOpen, icon: ShieldCheck },
    { label: 'Reports vorbereitet', value: data.reportsPrepared, icon: FileText },
    { label: 'Zeit gespart', value: `${kpis.gesparteZeitH} h`, icon: Clock },
    { label: 'Netto-Effekt', value: euroFmt(kpis.nettoEffekt), icon: Euro },
  ], [data, kpis]);

  const yearlyStats = [
    { label: 'Rohstellen geprüft', value: dashboardDataByRange.jahr.rawJobs.toLocaleString('de-DE'), icon: Filter },
    { label: 'Dubletten entfernt', value: dashboardDataByRange.jahr.duplicates.toLocaleString('de-DE'), icon: X },
    { label: 'Relevante Leads', value: dashboardDataByRange.jahr.relevantLeads.toLocaleString('de-DE'), icon: Target },
    { label: 'Top-Empfehlungen', value: dashboardDataByRange.jahr.topRecommendations.toLocaleString('de-DE'), icon: CheckCircle2 },
    { label: 'Reports vorbereitet', value: dashboardDataByRange.jahr.reportsPrepared, icon: FileText },
    { label: 'Zeit gespart', value: `${kpis.gesparteZeitH * 12} h`, icon: Clock },
    { label: 'Brutto-Einsparung', value: euroFmt(kpis.nettoEffekt * 12 + kpis.toolKosten * 12), icon: Euro },
    { label: 'Tool-Kosten Jahr', value: euroFmt(kpis.toolKosten * 12), icon: Wallet },
    { label: 'Netto-Effekt Jahr', value: euroFmt(kpis.nettoEffekt * 12), icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900">CEO Cockpit</h2>
          <p className="mt-1 text-sm text-ink-500">Zeitersparnis, ROI, Kosten, Workflow-Gesundheit und Kurs-Performance auf einen Blick.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl bg-white ring-1 ring-ink-200 shadow-soft p-1" role="tablist" aria-label="Zeitraum auswählen">
            {(['tag', 'woche', 'monat', 'jahr'] as TimeRange[]).map((r) => (
              <button key={r} onClick={() => setTimeRange(r)} role="tab" aria-selected={timeRange === r} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${timeRange === r ? 'bg-brand-600 text-white shadow-soft' : 'text-ink-500 hover:text-ink-700'}`}>{rangeLabel(r)}</button>
            ))}
          </div>
          <div className="flex items-center rounded-xl bg-white ring-1 ring-ink-200 shadow-soft p-1" role="tablist" aria-label="Ansicht auswählen">
            <button onClick={() => setViewMode('ceo')} role="tab" aria-selected={viewMode === 'ceo'} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'ceo' ? 'bg-ink-900 text-white shadow-soft' : 'text-ink-500 hover:text-ink-700'}`}>CEO View</button>
            <button onClick={() => setViewMode('ops')} role="tab" aria-selected={viewMode === 'ops'} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'ops' ? 'bg-ink-900 text-white shadow-soft' : 'text-ink-500 hover:text-ink-700'}`}>Operations View</button>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <button key={i} onClick={() => setKpiModal(kpi)} aria-label={`${kpi.label}: ${kpi.value}, ${kpi.status}. Details anzeigen`} className="card p-4 flex flex-col gap-2 text-left animate-fade-up hover:shadow-lift transition-shadow group" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-center justify-between">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.iconColor}`}><Icon className="h-4 w-4" strokeWidth={2} /></span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadgeColor(kpi.statusColor)}`}>{kpi.status}</span>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 leading-tight">{kpi.label}</span>
              <span className="font-display text-xl font-bold text-ink-900 tabular-nums">{kpi.value}</span>
              <Sparkline data={kpi.spark} color={kpi.statusColor === 'green' ? 'bg-accent-400' : kpi.statusColor === 'blue' ? 'bg-brand-400' : kpi.statusColor === 'amber' ? 'bg-amber-400' : kpi.statusColor === 'cyan' ? 'bg-cyanx-400' : 'bg-ink-400'} />
              <div className="flex items-center gap-1 text-[10px] font-medium">
                {kpi.comparisonUp ? <ArrowUpRight className="h-3 w-3 text-accent-600" /> : <ArrowDownRight className="h-3 w-3 text-rose-500" />}
                <span className={kpi.comparisonUp ? 'text-accent-600' : 'text-rose-500'}>{kpi.comparison}</span>
              </div>
              <p className="text-[10px] text-ink-400 leading-snug">{kpi.subtext}</p>
            </button>
          );
        })}
      </div>

      {/* CEO View */}
      {viewMode === 'ceo' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-semibold text-ink-900 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-brand-600" />Statistik — {rangeLabel(timeRange)}</h3>
                <div className="flex items-center rounded-lg bg-ink-50 p-1" role="tablist" aria-label="Statistik-Zeitraum">
                  <button onClick={() => setStatsTab('monat')} role="tab" aria-selected={statsTab === 'monat'} className={`px-3 py-1 text-xs font-semibold rounded-md ${statsTab === 'monat' ? 'bg-white shadow-soft text-ink-900' : 'text-ink-500'}`}>Monat</button>
                  <button onClick={() => setStatsTab('jahr')} role="tab" aria-selected={statsTab === 'jahr'} className={`px-3 py-1 text-xs font-semibold rounded-md ${statsTab === 'jahr' ? 'bg-white shadow-soft text-ink-900' : 'text-ink-500'}`}>Jahr</button>
                </div>
              </div>
              {statsTab === 'monat' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {statsItems.map((stat, i) => { const Icon = stat.icon; return (
                    <div key={i} className="rounded-xl bg-ink-50/60 border border-ink-100 p-3 flex flex-col gap-1.5"><Icon className="h-3.5 w-3.5 text-ink-400" /><span className="font-display text-lg font-bold text-ink-900 tabular-nums">{stat.value}</span><span className="text-[10px] text-ink-500 leading-tight">{stat.label}</span></div>
                  ); })}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {yearlyStats.map((stat, i) => { const Icon = stat.icon; return (
                    <div key={i} className="rounded-xl bg-ink-50/60 border border-ink-100 p-3 flex flex-col gap-1.5"><Icon className="h-3.5 w-3.5 text-ink-400" /><span className="font-display text-lg font-bold text-ink-900 tabular-nums">{stat.value}</span><span className="text-[10px] text-ink-500 leading-tight">{stat.label}</span></div>
                  );})}
                </div>
              )}
              <div className="mt-5 pt-4 border-t border-ink-100">
                <div className="flex items-center justify-between mb-3"><span className="text-xs font-semibold text-ink-600">Leads pro Monat (vergangene 7 Monate)</span><span className="text-xs text-ink-400">Demo</span></div>
                <div className="flex items-end gap-2 h-20" role="img" aria-label="Balkendiagramm: Leads pro Monat">
                  {[28, 31, 35, 33, 39, 37, 39].map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full rounded-t-md bg-gradient-to-t from-brand-200 to-brand-500 transition-all hover:from-brand-300 hover:to-brand-600" style={{ height: `${(v / 40) * 100}%` }} /><span className="text-[9px] text-ink-400">{['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul'][i]}</span></div>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-[11px] text-ink-400 italic">Diese Werte sind Demo-/Schätzwerte und später konfigurierbar.</p>
            </div>

            <div className="card p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-semibold text-ink-900 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent-600" />ROI & Business Value</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ink-900 text-white">Management KPI</span>
              </div>
              <div className="flex flex-col items-center py-4">
                <span className="font-display text-5xl font-bold text-accent-600 tabular-nums">{kpis.roi}x</span>
                <span className="mt-1 text-xs font-semibold text-accent-600 flex items-center gap-1"><ArrowUpRight className="h-3.5 w-3.5" /> +2.1x vs. Vormonat</span>
              </div>
              <div className="space-y-3 mt-2">
                <div><div className="flex justify-between text-xs mb-1"><span className="text-ink-500 font-medium">Nutzen</span><span className="font-semibold text-accent-600">{euroFmt(kpis.nettoEffekt + kpis.toolKosten)}</span></div><div className="h-3 rounded-full bg-ink-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-600" style={{ width: '96%' }} /></div></div>
                <div><div className="flex justify-between text-xs mb-1"><span className="text-ink-500 font-medium">Kosten</span><span className="font-semibold text-rose-500">{euroFmt(kpis.toolKosten)}</span></div><div className="h-3 rounded-full bg-ink-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-rose-300 to-rose-500" style={{ width: `${Math.min(10, (kpis.toolKosten / (kpis.nettoEffekt + kpis.toolKosten)) * 100)}%` }} /></div></div>
              </div>
              <div className="mt-4 space-y-1.5 text-xs">
                {[['Coach-Zeit gespart', `${kpis.gesparteZeitH} h / ${rangeLabel(timeRange)}`], ['Interner Stundensatz', euroFmt(data.hourlyRate)], ['Brutto-Ersparnis', euroFmt(kpis.gesparteZeitH * data.hourlyRate)], ['Zusätzlicher Reportwert', euroFmt(data.reportValue)], ['Monatlicher Gesamtnutzen', euroFmt(kpis.nettoEffekt + kpis.toolKosten)], ['Tool-Kosten', euroFmt(kpis.toolKosten)], ['Netto-Effekt', euroFmt(kpis.nettoEffekt)]].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between py-1 border-b border-ink-50 last:border-0"><span className="text-ink-500">{label}</span><span className="font-semibold text-ink-800 tabular-nums">{val}</span></div>
                ))}
              </div>
              <button onClick={() => setRoiModal(true)} className="mt-4 btn-secondary text-xs w-full justify-center"><Info className="h-3.5 w-3.5" /> ROI Details anzeigen</button>
              <p className="mt-3 text-[10px] text-ink-400 leading-relaxed">ROI basiert auf Zeitersparnis, Tool-Kosten und geschätztem Reportwert. Werte können später pro Anbieter angepasst werden.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card p-5">
              <h3 className="font-display text-base font-semibold text-ink-900 mb-4 flex items-center gap-2"><Gauge className="h-4 w-4 text-brand-600" />JobRadar Markt- & Risikoindikator</h3>
              <div className="flex justify-center mb-3"><GaugeIndicator value={gaugeScore} size={220} /></div>
              <div className="text-center mb-4"><span className="inline-block px-3 py-1 rounded-full bg-accent-50 text-accent-700 text-xs font-semibold ring-1 ring-accent-200">{gaugeLabel}</span></div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {[{ label: 'Match', val: `${data.avgMatchScore}%` }, { label: 'Safety', val: `${data.automationSafety}%` }, { label: 'Quellen', val: `${data.sourceQuality}%` }, { label: 'Kosten', val: `${data.costControl}%` }, { label: 'QA', val: `${data.qaBacklog <= 10 ? 100 : Math.max(0, 100 - (data.qaBacklog - 10) * 5)}%` }, { label: 'Senioritätsrisiko', val: `${data.seniorityRisk}%` }, { label: 'Standortfit', val: `${data.locationFit}%` }, { label: 'Sprachfit', val: `${data.languageFit}%` }].map((f) => (
                  <span key={f.label} className="text-[10px] font-medium px-2 py-1 rounded-lg bg-ink-50 text-ink-600 ring-1 ring-ink-100">{f.label}: <span className="font-bold text-ink-800">{f.val}</span></span>
                ))}
              </div>
              <p className="mt-4 text-[10px] text-ink-400 leading-relaxed">Der Index kombiniert Match Scores, Senioritätsrisiken, Standort-/Sprachfit, QA-Status, Quellenqualität und Kostenkontrolle.</p>
            </div>

            <div className="card p-5">
              <h3 className="font-display text-base font-semibold text-ink-900 mb-4 flex items-center gap-2"><Clock className="h-4 w-4 text-accent-600" />Zeitersparnis — {rangeLabel(timeRange)}</h3>
              <div className="space-y-3">
                <div><div className="flex justify-between text-xs mb-1"><span className="text-ink-500 font-medium">Manuelle Recherche</span><span className="font-semibold text-rose-500">{data.manualHoursTotal} h / {rangeLabel(timeRange)}</span></div><div className="h-4 rounded-full bg-ink-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-rose-300 to-rose-500" style={{ width: '100%' }} /></div></div>
                <div><div className="flex justify-between text-xs mb-1"><span className="text-ink-500 font-medium">Mit JobRadar</span><span className="font-semibold text-accent-600">{data.automatedHoursTotal} h / {rangeLabel(timeRange)}</span></div><div className="h-4 rounded-full bg-ink-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-accent-300 to-accent-500" style={{ width: `${(data.automatedHoursTotal / data.manualHoursTotal) * 100}%` }} /></div></div>
                <div><div className="flex justify-between text-xs mb-1"><span className="text-ink-500 font-medium">Gespart</span><span className="font-bold text-accent-700">{kpis.gesparteZeitH} h / {rangeLabel(timeRange)} ({kpis.zeitersparnisPct}%)</span></div><div className="h-4 rounded-full bg-ink-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-accent-400 to-cyanx-500" style={{ width: `${kpis.zeitersparnisPct}%` }} /></div></div>
              </div>
              <div className="mt-5 pt-4 border-t border-ink-100">
                <span className="text-xs font-semibold text-ink-600 mb-2 block">Wöchentliche Aufschlüsselung</span>
                <div className="grid grid-cols-4 gap-2">
                  {[{ week: 'Woche 1', hours: 12 }, { week: 'Woche 2', hours: 14 }, { week: 'Woche 3', hours: 13 }, { week: 'Woche 4', hours: 14 }].map((w) => (
                    <div key={w.week} className="text-center"><div className="h-16 flex items-end justify-center mb-1"><div className="w-8 rounded-t-md bg-brand-200 hover:bg-brand-400 transition-colors" style={{ height: `${(w.hours / 15) * 100}%` }} /></div><span className="text-[10px] text-ink-500 block">{w.week}</span><span className="text-[10px] font-bold text-ink-700">{w.hours} h</span></div>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-[10px] text-ink-400 italic">Schätzung für 5 aktive Kursprofile.</p>
            </div>

            <div className="card p-5">
              <h3 className="font-display text-base font-semibold text-ink-900 mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-cyanx-600" />Mensch vs. JobRadar</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-ink-50/60 border border-ink-100 p-4"><span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Manuell</span><ul className="mt-2 space-y-1.5 text-xs text-ink-600"><li>{data.manualJobsPerHour} Stellen/Stunde</li><li>{manualHours.toFixed(1)} h geschätzte Recherchezeit</li><li className="text-rose-500">hoher Wiederholungsaufwand</li></ul></div>
                <div className="rounded-xl bg-brand-50/60 border border-brand-100 p-4"><span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">JobRadar</span><ul className="mt-2 space-y-1.5 text-xs text-ink-700"><li>{data.rawJobs} Rohstellen geprüft</li><li>{data.relevantLeads} relevante Leads</li><li>{automatedReviewHours.toFixed(1)} h QA/Review-Zeit</li></ul></div>
              </div>
              <div className="mt-4 flex flex-col items-center">
                <span className="font-display text-3xl font-bold text-accent-600">{kpis.produktivitaetsfaktor}x effizienter</span>
                <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-cyanx-50 text-cyanx-600 ring-1 ring-cyanx-200"><Rocket className="h-3.5 w-3.5" /> Skalierung ohne Workflow-Sprawl</span>
              </div>
              <div className="mt-4 rounded-xl bg-ink-50 border border-ink-100 p-3">
                <span className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider">Berechnung</span>
                <p className="mt-1 text-[11px] font-mono text-ink-700 leading-relaxed">({data.rawJobs} Rohstellen / {automatedReviewHours.toFixed(1)} h Review) ÷ {data.manualJobsPerHour} Stellen/Stunde manuell</p>
                <p className="mt-0.5 text-[11px] font-mono text-ink-500">= {jobRadarItemsPerReviewHour.toFixed(1)} / {data.manualJobsPerHour} = {kpis.produktivitaetsfaktor}x</p>
              </div>
            </div>
          </div>

          {/* Course Performance */}
          <div className="card p-5">
            <h3 className="font-display text-base font-semibold text-ink-900 mb-4 flex items-center gap-2"><Target className="h-4 w-4 text-brand-600" />Kurs-Performance</h3>
            <div className="table-wrap" role="region" aria-label="Kurs-Performance Tabelle" tabIndex={0}>
              <table className="table-base">
                <thead><tr><th>Kurs</th><th>Schule</th><th>Arbeitsmarkt-Fit</th><th>Leads Monat</th><th>Leads Jahr</th><th>QA offen</th><th>Risiko</th><th>Empfehlung</th></tr></thead>
                <tbody>
                  {coursePerfRows.map((c, i) => (
                    <tr key={i} className="cursor-pointer hover:bg-ink-50/50" onClick={() => setCourseDrawer(c)}>
                      <td className="font-medium text-ink-900">{c.kurs}</td><td className="text-xs text-ink-500">{c.schule}</td>
                      <td><div className="flex items-center gap-2"><div className="w-20 h-2 rounded-full bg-ink-100 overflow-hidden"><div className={`h-full rounded-full ${c.fit >= 80 ? 'bg-accent-500' : c.fit >= 65 ? 'bg-amber-400' : 'bg-rose-500'}`} style={{ width: `${c.fit}%` }} /></div><span className="text-xs font-semibold tabular-nums">{c.fit}%</span></div></td>
                      <td className="tabular-nums text-sm">{c.leadsMonat}</td><td className="tabular-nums text-sm">{c.leadsJahr.toLocaleString('de-DE')}</td><td className="tabular-nums text-sm">{c.qaOffen}</td>
                      <td><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${riskPill(c.risiko)}`}>{c.risiko}</span></td><td className="text-xs text-ink-600">{c.empfehlung}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions + Mood */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-5">
              <h3 className="font-display text-base font-semibold text-ink-900 mb-4 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" />Empfohlene Management-Aktionen</h3>
              <div className="space-y-3">
                {ceoActions.map((a, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 p-3 hover:border-brand-200 hover:bg-brand-50/30 transition-all">
                    <div className="flex items-center gap-3 min-w-0"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-100 text-ink-600 text-xs font-bold shrink-0">{i + 1}</span><div className="min-w-0"><p className="text-sm font-medium text-ink-800 truncate">{a.title}</p><p className="text-xs text-ink-400">{a.impact}</p></div></div>
                    <div className="flex items-center gap-2 shrink-0"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityBadge(a.priority)}`}>{a.priority}</span><button onClick={() => toast('Demo: Aufgabe markiert.', 'info')} className="btn-ghost px-2 py-1 text-xs">Als Aufgabe</button></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5 flex flex-col items-center justify-center text-center">
              <h3 className="font-display text-base font-semibold text-ink-900 mb-4">Operative Stimmung</h3>
              <div className="relative w-32 h-32 flex items-center justify-center" role="img" aria-label={`Operative Stimmung: ${moodScore} von 100, ${moodLabel}`}>
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128"><circle cx="64" cy="64" r="56" fill="none" stroke="#eceef2" strokeWidth="8" /><circle cx="64" cy="64" r="56" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(moodScore / 100) * 351.86} 351.86`} /></svg>
                <div className="flex flex-col items-center"><span className="font-display text-2xl font-bold text-ink-900 tabular-nums">{moodScore}</span><span className="text-[10px] text-ink-400">/ 100</span></div>
              </div>
              <span className="mt-3 text-sm font-semibold text-accent-600">{moodLabel}</span>
              <p className="mt-2 text-xs text-ink-400 leading-relaxed">Hohe Automatisierung, stabile Kosten, gute Kurs-Fit-Werte.</p>
            </div>
          </div>

          {/* Report Export */}
          <div className="card p-5">
            <h3 className="font-display text-base font-semibold text-ink-900 mb-1 flex items-center gap-2"><FileText className="h-4 w-4 text-brand-600" />CEO Report — {rangeLabel(timeRange)}</h3>
            <p className="text-xs text-ink-500 mb-4">Statistik für Management, Kostenkontrolle und Arbeitsmarktnachweis.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <button onClick={() => toast(`Demo: ${rangeLabel(timeRange)}-Report wurde vorbereitet.`, 'success')} className="btn-primary text-xs justify-center"><Download className="h-3.5 w-3.5" /> {rangeLabel(timeRange)}-Report</button>
              <button onClick={() => toast('Demo: Jahresreport wurde vorbereitet.', 'success')} className="btn-primary text-xs justify-center"><Download className="h-3.5 w-3.5" /> Jahresreport</button>
              <button onClick={() => toast('Demo: ROI-Report wurde vorbereitet.', 'success')} className="btn-primary text-xs justify-center"><Download className="h-3.5 w-3.5" /> ROI-Report</button>
              <button onClick={() => toast('Demo: Kostenbericht wurde vorbereitet.', 'success')} className="btn-primary text-xs justify-center"><Download className="h-3.5 w-3.5" /> Kostenbericht</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-ink-50/60 border border-ink-100 p-4"><span className="text-xs font-semibold text-ink-600 mb-2 block">Report enthält:</span><ul className="space-y-1 text-xs text-ink-500"><li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-brand-500" /> KPI Summary</li><li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-brand-500" /> ROI</li><li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-brand-500" /> Zeitersparnis</li><li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-brand-500" /> Kostenbreakdown</li><li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-brand-500" /> Kurs-Performance</li><li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-brand-500" /> Quellengesundheit</li><li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-brand-500" /> Management-Aktionen</li></ul></div>
              <div className="rounded-xl bg-ink-50/60 border border-ink-100 p-4"><span className="text-xs font-semibold text-ink-600 mb-2 block">Jahresreport enthält:</span><ul className="space-y-1 text-xs text-ink-500"><li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-brand-500" /> Jahres-Einsparungen</li><li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-brand-500" /> Jahres-Tool-Kosten</li><li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-brand-500" /> ROI-Trend</li><li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-brand-500" /> Kurs-Vergleich</li><li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-brand-500" /> Quellen-Zuverlässigkeit</li><li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-brand-500" /> Skalierungs-Empfehlung</li></ul></div>
            </div>
          </div>
        </div>
      )}

      {/* Operations View */}
      {viewMode === 'ops' && (
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="font-display text-base font-semibold text-ink-900 flex items-center gap-2"><Wallet className="h-4 w-4 text-brand-600" />Tool-, API- & Scraper-Verbrauch — {rangeLabel(timeRange)}</h3>
              <div className="flex items-center rounded-lg bg-ink-50 p-1" role="tablist" aria-label="Kosten-Filter">
                {[{ key: 'alle', label: 'Alle' }, { key: 'paid', label: 'Paid APIs' }, { key: 'free', label: 'Free Sources' }, { key: 'llm', label: 'LLM' }, { key: 'n8n', label: 'n8n' }, { key: 'hosting', label: 'Hosting' }, { key: 'infra', label: 'Infrastructure' }].map((f) => (
                  <button key={f.key} onClick={() => setCostFilter(f.key)} role="tab" aria-selected={costFilter === f.key} className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${costFilter === f.key ? 'bg-white shadow-soft text-ink-900' : 'text-ink-500 hover:text-ink-700'}`}>{f.label}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[{ label: `Kosten ${rangeLabel(timeRange)}`, value: euroFmt(kpis.toolKosten), icon: Euro }, { label: 'Kosten Monat', value: euroFmt(dashboardDataByRange.monat.serpApiCost + dashboardDataByRange.monat.llmCost + dashboardDataByRange.monat.jinaCost + dashboardDataByRange.monat.n8nCost + dashboardDataByRange.monat.hostingCost), icon: Calendar }, { label: 'Kosten Jahr', value: euroFmt(kpis.toolKosten * 12), icon: TrendingUp }, { label: 'Budgetstatus', value: 'Im Rahmen', icon: CheckCircle2 }].map((s, i) => { const Icon = s.icon; return (
                <div key={i} className="rounded-xl bg-ink-50/60 border border-ink-100 p-3 flex flex-col gap-1"><Icon className="h-3.5 w-3.5 text-ink-400" /><span className="font-display text-base font-bold text-ink-900">{s.value}</span><span className="text-[10px] text-ink-500">{s.label}</span></div>
              );})}
            </div>
            <div className="table-wrap" role="region" aria-label="Tool- und API-Kosten Tabelle" tabIndex={0}>
              <table className="table-base">
                <thead><tr><th>Tool / Quelle</th><th>Typ</th><th>Runs heute</th><th>Items</th><th>Kosten heute</th><th>Kosten Monat</th><th>Kosten Jahr</th><th>Status</th><th>Optimierung</th></tr></thead>
                <tbody>
                  {filteredCostRows.map((r, i) => (
                    <tr key={i}><td className="font-medium text-ink-900">{r.tool}</td><td className="text-xs text-ink-500">{r.typ}</td><td className="tabular-nums text-sm">{r.runsHeute || '—'}</td><td className="tabular-nums text-sm">{r.items || '—'}</td><td className="tabular-nums text-sm">{r.kostenHeute > 0 ? `€${r.kostenHeute.toFixed(2)}` : '—'}</td><td className="tabular-nums text-sm">{r.kostenMonat > 0 ? `€${r.kostenMonat.toFixed(2)}` : '—'}</td><td className="tabular-nums text-sm">{r.kostenJahr > 0 ? `€${r.kostenJahr}` : '—'}</td><td><span className="flex items-center gap-1.5 text-xs"><span className={`h-2 w-2 rounded-full ${statusDotColor(r.status)}`} />{r.status}</span></td><td className="text-xs text-ink-500">{r.optimierung}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 pt-4 border-t border-ink-100">
              <span className="text-xs font-semibold text-ink-600 mb-3 block">Kostenverteilung (Monat)</span>
              <div className="flex h-6 rounded-full overflow-hidden ring-1 ring-ink-100" role="img" aria-label="Kostenverteilung: API 36%, LLM 27%, Scraper 5%, n8n und Hosting 25%, Infrastruktur 7%">
                <div className="bg-brand-400" style={{ width: '36%' }} /><div className="bg-accent-400" style={{ width: '27%' }} /><div className="bg-cyanx-400" style={{ width: '5%' }} /><div className="bg-ink-400" style={{ width: '25%' }} /><div className="bg-ink-300" style={{ width: '7%' }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-[10px] text-ink-500"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-brand-400" /> API-Kosten</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-accent-400" /> LLM-Kosten</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-cyanx-400" /> Scraper-Kosten</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-ink-400" /> n8n + Hosting</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-ink-300" /> Infrastruktur</span></div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-base font-semibold text-ink-900 mb-4 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent-600" />Quellen- & Scraper-Gesundheit</h3>
            <div className="table-wrap" role="region" aria-label="Quellen- und Scraper-Gesundheit Tabelle" tabIndex={0}>
              <table className="table-base">
                <thead><tr><th>Quelle</th><th>Status</th><th>Erfolgsrate</th><th>Runs</th><th>Rohstellen</th><th>Relevante Leads</th><th>Letzter Lauf</th><th>Trefferqualität</th><th>Kosten</th><th>Risiko</th></tr></thead>
                <tbody>
                  {sourceHealthRows.map((s, i) => (
                    <tr key={i}><td className="font-medium text-ink-900">{s.name}</td><td><span className="flex items-center gap-1.5 text-xs"><span className={`h-2 w-2 rounded-full ${statusDotColor(s.status)}`} />{s.status}</span></td><td><div className="flex items-center gap-2"><div className="w-16 h-1.5 rounded-full bg-ink-100 overflow-hidden"><div className={`h-full rounded-full ${s.erfolgsrate >= 85 ? 'bg-accent-500' : s.erfolgsrate >= 70 ? 'bg-amber-400' : 'bg-rose-500'}`} style={{ width: `${s.erfolgsrate}%` }} /></div><span className="text-xs tabular-nums">{s.erfolgsrate}%</span></div></td><td className="tabular-nums text-sm">{s.runs || '—'}</td><td className="tabular-nums text-sm">{s.rawJobs || '—'}</td><td className="tabular-nums text-sm">{s.relevantLeads || '—'}</td><td className="text-xs text-ink-500">{s.letzterLauf}</td><td className="text-xs text-ink-600">{s.trefferqualitaet}</td><td className="text-xs text-ink-600">{s.kosten}</td><td className="text-xs text-ink-600">{s.risiko}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* KPI Modal */}
      {kpiModal && (
        <Modal open onClose={() => setKpiModal(null)} title={kpiModal.label}>
          <div className="space-y-4">
            <div className="flex items-center gap-3"><span className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpiModal.iconColor}`}><kpiModal.icon className="h-6 w-6" /></span><div><span className="font-display text-3xl font-bold text-ink-900">{kpiModal.value}</span><span className="ml-2 text-sm text-ink-500">{kpiModal.status}</span></div></div>
            <div className="rounded-xl bg-ink-50 border border-ink-100 p-4 space-y-2">
              <div><span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Formel</span><p className="mt-1 text-sm text-ink-700 font-mono">{kpiModal.formula}</p></div>
              <div><span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Erklärung</span><p className="mt-1 text-sm text-ink-600">{kpiModal.explanation}</p></div>
              <div><span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Vergleich</span><p className="mt-1 text-sm text-ink-600">{kpiModal.comparison}</p></div>
              {kpiModal.action && <div className="pt-2 border-t border-ink-100"><span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Empfohlene Aktion</span><p className="mt-1 text-sm text-brand-700">{kpiModal.action}</p></div>}
            </div>
            <button onClick={() => setKpiModal(null)} className="btn-secondary w-full justify-center text-sm">Schließen</button>
          </div>
        </Modal>
      )}

      {/* ROI Modal */}
      {roiModal && (
        <Modal open onClose={() => setRoiModal(false)} title="ROI Details">
          <div className="space-y-4">
            <div className="rounded-xl bg-accent-50 border border-accent-100 p-5 text-center"><span className="text-xs font-semibold text-accent-600 uppercase tracking-wider">ROI</span><p className="font-display text-4xl font-bold text-accent-700 mt-1">{kpis.roi}x</p><p className="text-xs text-accent-600 mt-1">+2.1x vs. Vormonat</p></div>
            <div className="space-y-3">
              <div className="rounded-xl border border-ink-100 p-4"><span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">ROI-Formel</span><p className="mt-1 text-sm font-mono text-ink-800">ROI = Gesamtnutzen / Tool-Kosten</p><p className="mt-1 text-sm text-ink-500">{euroFmt(kpis.nettoEffekt + kpis.toolKosten)} / {euroFmt(kpis.toolKosten)} = {kpis.roi}x</p></div>
              <div className="rounded-xl border border-ink-100 p-4"><span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Netto-Effekt</span><p className="mt-1 text-sm font-mono text-ink-800">Netto = Gesamtnutzen − Tool-Kosten</p><p className="mt-1 text-sm text-ink-500">{euroFmt(kpis.nettoEffekt + kpis.toolKosten)} − {euroFmt(kpis.toolKosten)} = {euroFmt(kpis.nettoEffekt)}</p></div>
              <div className="rounded-xl border border-ink-100 p-4"><span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Zeitersparnis</span><p className="mt-1 text-sm font-mono text-ink-800">Zeitersparnis = Manuelle Zeit − Automatisierte Zeit</p><p className="mt-1 text-sm text-ink-500">{data.manualHoursTotal} h − {data.automatedHoursTotal} h = {kpis.gesparteZeitH} h / {rangeLabel(timeRange)}</p></div>
              <div className="rounded-xl border border-ink-100 p-4"><span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Produktivitätsfaktor</span><p className="mt-1 text-sm font-mono text-ink-800">(Rohstellen / QA-Stunden) ÷ manuelle Stellen/Stunde</p><p className="mt-1 text-sm text-ink-500">({data.rawJobs} / {automatedReviewHours.toFixed(1)} h) ÷ {data.manualJobsPerHour} = {kpis.produktivitaetsfaktor}x</p></div>
            </div>
            <p className="text-xs text-ink-400 italic">ROI basiert auf Zeitersparnis, Tool-Kosten und geschätztem Reportwert. Werte können später pro Anbieter angepasst werden.</p>
            <button onClick={() => setRoiModal(false)} className="btn-secondary w-full justify-center text-sm">Schließen</button>
          </div>
        </Modal>
      )}

      {/* Course Drawer */}
      {courseDrawer && (
        <Drawer open onClose={() => setCourseDrawer(null)} title={courseDrawer.kurs}>
          <div className="space-y-5">
            <div className="rounded-xl bg-brand-50/60 border border-brand-100 p-4"><span className="text-xs font-semibold text-brand-600">{courseDrawer.schule}</span><p className="mt-1 text-sm text-ink-700 font-medium">{courseDrawer.empfehlung}</p></div>
            <div><span className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Fit-Faktoren</span><div className="space-y-2">
              {[{ label: 'Arbeitsmarkt-Fit', val: courseDrawer.fit, color: courseDrawer.fit >= 80 ? 'bg-accent-500' : courseDrawer.fit >= 65 ? 'bg-amber-400' : 'bg-rose-500' }, { label: 'Match Score', val: courseDrawer.fit - 5, color: 'bg-brand-500' }, { label: 'Standortfit', val: 84, color: 'bg-accent-400' }, { label: 'Sprachfit', val: 71, color: 'bg-amber-400' }].map((f, i) => (
                <div key={i}><div className="flex justify-between text-xs mb-1"><span className="text-ink-600">{f.label}</span><span className="font-semibold tabular-nums">{f.val}%</span></div><div className="h-2 rounded-full bg-ink-100 overflow-hidden"><div className={`h-full rounded-full ${f.color}`} style={{ width: `${f.val}%` }} /></div></div>
              ))}
            </div></div>
            <div><span className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Risiko-Gründe</span>
              {courseDrawer.risiko === 'Low' && <ul className="space-y-1 text-xs text-ink-500"><li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent-500" /> Keine signifikanten Risiken</li><li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent-500" /> Guter Senioritäts-Fit</li><li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent-500" /> Standort- und Sprachfit gut</li></ul>}
              {courseDrawer.risiko === 'Medium' && <ul className="space-y-1 text-xs text-ink-500"><li className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Senioritäts-Mismatch bei einigen Leads</li><li className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Deutsch-Anforderungen prüfen</li></ul>}
              {courseDrawer.risiko === 'High' && <ul className="space-y-1 text-xs text-ink-500"><li className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> Fit-Wert unter 60% — Suchprofil überarbeiten</li><li className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> Zu viele irrelevante Treffer</li><li className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> QA-Rückstau bei 7 Leads</li></ul>}
            </div>
            <div><span className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Statistik</span><div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-ink-50 p-3"><span className="text-[10px] text-ink-500">Leads / Monat</span><p className="font-display text-lg font-bold text-ink-900">{courseDrawer.leadsMonat}</p></div>
              <div className="rounded-lg bg-ink-50 p-3"><span className="text-[10px] text-ink-500">Leads / Jahr</span><p className="font-display text-lg font-bold text-ink-900">{courseDrawer.leadsJahr.toLocaleString('de-DE')}</p></div>
              <div className="rounded-lg bg-ink-50 p-3"><span className="text-[10px] text-ink-500">QA offen</span><p className="font-display text-lg font-bold text-ink-900">{courseDrawer.qaOffen}</p></div>
              <div className="rounded-lg bg-ink-50 p-3"><span className="text-[10px] text-ink-500">Risiko</span><p className="font-display text-lg font-bold text-ink-900">{courseDrawer.risiko}</p></div>
            </div></div>
            <div><span className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Empfohlene Query-Verbesserungen</span><ul className="space-y-1.5 text-xs text-ink-600"><li className="flex items-start gap-1.5"><ChevronRight className="h-3.5 w-3.5 text-brand-500 mt-0.5 shrink-0" /> Zielberufe präzisieren</li><li className="flex items-start gap-1.5"><ChevronRight className="h-3.5 w-3.5 text-brand-500 mt-0.5 shrink-0" /> Ausschlüsse erweitern (Senior, Lead)</li><li className="flex items-start gap-1.5"><ChevronRight className="h-3.5 w-3.5 text-brand-500 mt-0.5 shrink-0" /> Deutsch-Anforderung als Filter</li></ul></div>
          </div>
        </Drawer>
      )}
    </div>
  );
}
