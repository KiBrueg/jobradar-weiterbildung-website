import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent?: 'brand' | 'accent' | 'cyanx' | 'ink';
  trend?: string;
}

const accentMap = {
  brand: { bg: 'bg-brand-50', text: 'text-brand-700', ring: 'ring-brand-100' },
  accent: { bg: 'bg-accent-50', text: 'text-accent-700', ring: 'ring-accent-100' },
  cyanx: { bg: 'bg-cyanx-50', text: 'text-cyanx-600', ring: 'ring-cyanx-100' },
  ink: { bg: 'bg-ink-100', text: 'text-ink-700', ring: 'ring-ink-200' },
};

export default function KpiCard({ label, value, icon: Icon, hint, accent = 'ink', trend }: KpiCardProps) {
  const a = accentMap[accent];
  return (
    <div className="card p-5 flex flex-col gap-3 animate-fade-up">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${a.bg} ${a.text} ring-1 ${a.ring}`}>
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="font-display text-3xl font-semibold tracking-tight text-ink-900 tabular-nums">{value}</span>
        {trend && (
          <span className="mb-1 inline-flex items-center gap-0.5 text-xs font-semibold text-accent-600">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {trend}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-ink-500 leading-relaxed">{hint}</p>}
    </div>
  );
}
