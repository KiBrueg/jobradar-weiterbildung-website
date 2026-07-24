import type { ReactNode } from 'react';

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-accent-50 text-accent-700 ring-1 ring-accent-200',
    draft: 'bg-ink-100 text-ink-600 ring-1 ring-ink-200',
    archived: 'bg-ink-100 text-ink-500 ring-1 ring-ink-200',
    review: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    completed: 'bg-accent-50 text-accent-700 ring-1 ring-accent-200',
    running: 'bg-brand-50 text-brand-700 ring-1 ring-brand-200',
    paused: 'bg-ink-100 text-ink-600 ring-1 ring-ink-200',
    failed: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    open: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    approved: 'bg-accent-50 text-accent-700 ring-1 ring-accent-200',
    rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  };
  const cls = map[status] ?? 'bg-ink-100 text-ink-600 ring-1 ring-ink-200';
  return <span className={`badge ${cls} capitalize`}>{status}</span>;
}

export function LeadStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Candidate: 'bg-brand-50 text-brand-700 ring-1 ring-brand-200',
    'QA Needed': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    Approved: 'bg-accent-50 text-accent-700 ring-1 ring-accent-200',
    Rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  };
  const cls = map[status] ?? 'bg-ink-100 text-ink-600 ring-1 ring-ink-200';
  return <span className={`badge ${cls}`}>{status}</span>;
}

export function ScorePill({ score }: { score: number }) {
  let cls = 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
  if (score >= 80) cls = 'bg-accent-50 text-accent-700 ring-1 ring-accent-200';
  else if (score >= 70) cls = 'bg-brand-50 text-brand-700 ring-1 ring-brand-200';
  else if (score >= 60) cls = 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
  return <span className={`badge ${cls} tabular-nums`}>{score}</span>;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg card p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
          <button onClick={onClose} className="btn-ghost px-2 py-1" aria-label="Schliessen">
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-xl',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative h-full w-full ${width} bg-white shadow-lift flex flex-col animate-slide-in`}>
        <div className="flex items-start justify-between border-b border-ink-200 px-6 py-5">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="btn-ghost px-2 py-1" aria-label="Schliessen">
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">{children}</div>
        {footer && <div className="border-t border-ink-200 px-6 py-4 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Bestaetigen',
  danger = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button
            className={danger ? 'btn bg-rose-600 text-white hover:bg-rose-700' : 'btn-primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-ink-600 leading-relaxed">{message}</p>
    </Modal>
  );
}

export function EmptyState({ icon: Icon, title, hint }: { icon: LucideIconType; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-100 text-ink-400 mb-3">
        <Icon className="h-6 w-6" />
      </span>
      <p className="text-sm font-semibold text-ink-700">{title}</p>
      {hint && <p className="mt-1 text-xs text-ink-500 max-w-xs">{hint}</p>}
    </div>
  );
}

type LucideIconType = import('lucide-react').LucideIcon;
