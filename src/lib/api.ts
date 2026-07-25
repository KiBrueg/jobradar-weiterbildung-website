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

export interface BackendCostBreakdownRow {
  tool_name: string;
  tool_type: string;
  source_name?: string;
  runs: number;
  units: number;
  cost: number;
}

export interface BackendCeoDashboard {
  ok: boolean;
  range: ApiTimeRange;
  period_label: string;
  current: BackendCeoCurrent;
  previous?: Partial<BackendCeoCurrent>;
  cost_breakdown?: BackendCostBreakdownRow[];
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
