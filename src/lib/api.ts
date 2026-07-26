export type ApiTimeRange = 'tag' | 'woche' | 'monat' | 'jahr';

export interface BackendCeoCurrent {
  raw_jobs: number;
  duplicates: number;
  relevant_leads: number;
  created_leads: number;
  qa_open: number;
  reports: number;
  manual_hours: number;
  automated_hours: number;
  time_saved_hours: number;
  time_saved_percent: number;
  report_value: number;
  tool_costs: number;
  net_benefit: number;
  roi: number;
  automation_safety: number;
  arbeitsmarkt_fit: number;
  productivity_factor: number;
  manual_jobs_per_hour: number;
  source_quality: number;
  cost_control: number;
  qa_health: number;
}

export interface BackendSeriesPoint extends BackendCeoCurrent {
  label: string;
  month?: string;
}

export interface BackendCostBreakdownRow {
  tool_name: string;
  tool_type: string;
  source_name?: string;
  runs: number;
  units: number;
  cost: number;
}

export interface BackendSourceHealthRow {
  source_name: string;
  source_type: string;
  runs: number;
  raw_items: number;
  relevant_items: number;
  failed_items: number;
  success_rate: number;
  quality_score: number;
  risk_level: string;
  last_run: string;
}

export interface BackendCoursePerformanceRow {
  course_id: number;
  course: string;
  school: string;
  base_fit: number;
  leads: number;
  avg_score: number;
  qa_open: number;
  arbeitsmarkt_fit: number;
  risk: string;
  recommendation: string;
}

export interface BackendAiRoleBenchmarkRow {
  id: string;
  role: string;
  de: string;
  titles: string[];
  exclude: string[];
  courses: string[];
  fit: number;
  leads: number;
  entry_level: number;
  risk: string;
  recommendation: string;
}

export interface BackendActionRow {
  title: string;
  priority: string;
  impact: string;
}

export interface BackendCeoDashboard {
  ok: boolean;
  range: ApiTimeRange;
  period_label: string;
  current: BackendCeoCurrent;
  previous?: Partial<BackendCeoCurrent>;
  series?: BackendSeriesPoint[];
  cost_breakdown?: BackendCostBreakdownRow[];
  source_health?: BackendSourceHealthRow[];
  course_performance?: BackendCoursePerformanceRow[];
  ai_role_benchmark?: BackendAiRoleBenchmarkRow[];
  actions?: BackendActionRow[];
}

export async function getCeoDashboard(range: ApiTimeRange): Promise<BackendCeoDashboard> {
  const response = await fetch(`/api/ceo-dashboard?range=${range}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export function ceoReportDownloadUrl(range: ApiTimeRange, format: 'json' | 'xlsx' = 'json'): string {
  return `/download/ceo-report.${format}?range=${encodeURIComponent(range)}`;
}
