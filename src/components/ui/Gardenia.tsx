import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Atom, BatteryCharging, Brain, Check, Clock3, FileText, Globe2, Wind } from 'lucide-react';
import { cn } from '@/lib/cn';

const accentClasses: Record<string, string> = {
  teal: 'bg-teal-50 text-teal-700',
  blue: 'bg-blue-50 text-blue-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  violet: 'bg-violet-50 text-violet-700',
  rose: 'bg-rose-50 text-rose-700',
  amber: 'bg-amber-50 text-amber-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  slate: 'bg-slate-100 text-slate-700',
};

export function StatusBadge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: string }) {
  return <span className={cn('inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[10px] font-semibold', accentClasses[tone] ?? accentClasses.slate)}>{children}</span>;
}

export function UserAvatar({ name, tone = 'indigo', size = 'size-8' }: { name: string; tone?: string; size?: string }) {
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return <span aria-hidden="true" className={cn('inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-bold', size, accentClasses[tone] ?? accentClasses.indigo)}>{initials}</span>;
}

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'teal',
  href,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
  tone?: string;
  href?: string;
}) {
  const content = (
    <article className="h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-950">{value}</p>
        </div>
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', accentClasses[tone] ?? accentClasses.teal)}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      {detail && <p className="mt-2 truncate text-[10px] text-slate-500">{detail}</p>}
    </article>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}

export function ProgressBar({ value, tone = 'teal', label }: { value: number; tone?: string; label?: string }) {
  const fills: Record<string, string> = { teal: 'bg-teal-600', violet: 'bg-violet-500', blue: 'bg-blue-500', amber: 'bg-amber-500', emerald: 'bg-emerald-500' };
  const bounded = Math.min(100, Math.max(0, value));
  return (
    <div>
      {label && <div className="mb-1 flex justify-between text-[10px] text-slate-500"><span>{label}</span><span className="tabular-nums">{bounded}%</span></div>}
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={label ?? 'Project progress'} aria-valuenow={bounded} aria-valuemin={0} aria-valuemax={100}>
        <div className={cn('h-full rounded-full', fills[tone] ?? fills.teal)} style={{ width: `${bounded}%` }} />
      </div>
    </div>
  );
}

export function ProjectCard({ project, href = `/projects/${project.id}/overview` }: {
  project: { id: string; title: string; sponsor: string; domain: string; summary: string; status: string; progress: number; deadline: string; reward: string; members: number; tags: string[]; icon: string; color: string };
  href?: string;
}) {
  const tone = project.color === 'violet' ? 'violet' : project.color;
  const ProjectIcon = project.id === 'medical-image-analysis'
    ? Brain
    : project.id === 'battery-materials'
      ? BatteryCharging
      : project.id === 'climate-data-analysis'
        ? Globe2
        : project.id === 'quantum-materials'
          ? Atom
          : Wind;
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-lg', accentClasses[tone] ?? accentClasses.teal)} aria-hidden="true"><ProjectIcon className="size-6" /></span>
        <div className="min-w-0 flex-1">
          <Link href={href} className="line-clamp-2 text-xs font-bold leading-5 text-slate-900 hover:text-teal-800">{project.title}</Link>
          <p className="mt-0.5 truncate text-[10px] text-slate-500">Sponsored by {project.sponsor}</p>
        </div>
        <StatusBadge tone={project.status === 'In progress' ? 'emerald' : project.status === 'Recruiting' ? 'blue' : 'amber'}>{project.status}</StatusBadge>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.tags.slice(0, 2).map((tag) => <StatusBadge key={tag} tone="teal">{tag}</StatusBadge>)}
      </div>
      <p className="text-pretty mt-2 line-clamp-2 text-[10px] leading-4 text-slate-600">{project.summary}</p>
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
        <span>Next milestone</span><span>{project.deadline}</span>
      </div>
      <div className="mt-1"><ProgressBar value={project.progress} label="Project progress" /></div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500">
        <span>{project.members} members</span><span>{project.reward}</span>
      </div>
      <Link href={href} className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-teal-800">
        Open project <ArrowRight className="size-3" aria-hidden="true" />
      </Link>
    </article>
  );
}

export function SkillCard({ name, score, status, tone, detail }: { name: string; score: number; status: string; tone: string; detail: string }) {
  return (
    <article className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-white p-2.5">
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-md text-[10px] font-bold', accentClasses[tone] ?? accentClasses.teal)}>{name.slice(0, 2).toUpperCase()}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-semibold text-slate-800">{name}</p>
        <p className={cn('text-[9px] font-medium', status === 'Verified' ? 'text-emerald-700' : 'text-amber-700')}>{status}{score > 0 ? ` · ${score}%` : ''}</p>
        <span className="sr-only">{detail}</span>
      </div>
      {status === 'Verified' && <Check className="size-3.5 shrink-0 text-emerald-600" aria-label="Verified" />}
    </article>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3">
        <h2 className="text-xs font-bold text-slate-900">{title}</h2>
        {action}
      </div>
      <div className="px-4 pb-4">{children}</div>
    </section>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 hover:text-indigo-900">{children}<ArrowRight className="size-3" aria-hidden="true" /></Link>;
}

export function ActivityFeed({ items }: { items: { name: string; detail: string; time: string; initials: string; tone: string }[] }) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item, index) => (
        <li key={`${item.name}-${index}`} className="flex items-start gap-2.5 py-2.5 first:pt-1 last:pb-1">
          <UserAvatar name={item.initials} tone={item.tone} size="size-7" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold text-slate-800">{item.name}</p>
            <p className="truncate text-[9px] text-slate-500">{item.detail}</p>
          </div>
          <span className="shrink-0 text-[9px] text-slate-400">{item.time}</span>
        </li>
      ))}
    </ul>
  );
}

export function NotificationPanel({ items }: { items: { title: string; detail: string; time: string; tone: string }[] }) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => (
        <li key={item.title} className="flex items-start gap-2.5 py-2.5 first:pt-1 last:pb-1">
          <span className={cn('mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md', accentClasses[item.tone] ?? accentClasses.teal)}>
            <Clock3 className="size-3" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[10px] font-semibold leading-4 text-slate-800">{item.title}</p>
            <p className="truncate text-[9px] text-slate-500">{item.detail}</p>
          </div>
          <span className="shrink-0 text-[9px] text-slate-400">{item.time}</span>
        </li>
      ))}
    </ul>
  );
}

export function DocumentCard({ title, kind, access = 'Team' }: { title: string; kind: string; access?: string }) {
  return (
    <article className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
      <span className="flex size-8 items-center justify-center rounded-md bg-rose-50 text-rose-700"><FileText className="size-4" aria-hidden="true" /></span>
      <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-slate-800">{title}</p><p className="text-[9px] text-slate-500">{kind}</p></div>
      <StatusBadge tone={access === 'Public' ? 'emerald' : 'blue'}>{access}</StatusBadge>
    </article>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"><h3 className="text-sm font-semibold text-slate-900">{title}</h3><p className="text-pretty mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">{description}</p><div className="mt-4">{action}</div></div>;
}

export function MockAction({ children, onClick, tone = 'teal' }: { children: React.ReactNode; onClick?: () => void; tone?: 'teal' | 'neutral' }) {
  return <button type="button" onClick={onClick} className={cn('rounded-lg px-3 py-2 text-[10px] font-semibold', tone === 'teal' ? 'bg-teal-700 text-white hover:bg-teal-800' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}>{children}</button>;
}
