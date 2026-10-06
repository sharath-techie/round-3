import Link from 'next/link';
import { cn } from '@/lib/cn';

const sections = [
  ['Overview', ''],
  ['Charter', 'charter'],
  ['Team', 'team'],
  ['Research', 'research'],
  ['Implementation', 'implementation'],
  ['Experiments', 'experiments'],
  ['AI workspace', 'ai-workspace'],
  ['Evidence', 'evidence'],
  ['Access', 'access'],
  ['Milestones', 'milestones'],
  ['Contributions', 'contributions'],
  ['Activity', 'activity'],
] as const;

export function ProjectWorkspaceNav({
  projectId,
  activeSection,
}: {
  projectId: string;
  activeSection: string;
}) {
  return (
    <nav aria-label="Project workspace" className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex min-w-max gap-1">
        {sections.map(([label, path]) => {
          const active = (path || 'overview') === activeSection;
          return (
            <Link
              key={label}
              href={`/projects/${projectId}${path ? `/${path}` : ''}`}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'shrink-0 rounded-lg px-3 py-2 text-xs font-medium',
                active ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
