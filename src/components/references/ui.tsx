import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export function PageSection({
  id,
  children,
  className = '',
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-7xl px-5 sm:px-8 py-16 md:py-20 ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''} mb-10`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-500 shadow-soft">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 font-display text-3xl md:text-4xl font-semibold tracking-tight text-ink-900 text-balance">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-ink-600 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

export function IconCard({
  icon: Icon,
  title,
  children,
  accent = 'brand',
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  accent?: 'brand' | 'accent' | 'cyanx' | 'ink';
}) {
  const map = {
    brand: 'bg-brand-50 text-brand-700 ring-brand-100',
    accent: 'bg-accent-50 text-accent-700 ring-accent-100',
    cyanx: 'bg-cyanx-50 text-cyanx-600 ring-cyanx-100',
    ink: 'bg-ink-100 text-ink-700 ring-ink-200',
  };
  return (
    <div className="card-soft p-6 hover:shadow-lift transition-shadow animate-fade-up">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${map[accent]} mb-4`}>
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="font-semibold text-ink-900">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">{children}</p>
    </div>
  );
}

export function PlaceholderBanner({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      {children}
    </span>
  );
}
