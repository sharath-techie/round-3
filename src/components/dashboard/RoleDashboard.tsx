import Link from 'next/link';
import { ArrowRight, FolderKanban, Users, ClipboardCheck, BriefcaseBusiness, ShieldCheck } from 'lucide-react';
import { ApiError, requireAuthenticatedActor, requireRole } from '@/lib/auth';
import type { UserRole } from '@/types';

const titleByRole: Record<UserRole, string> = {
  STUDENT: 'Contributor dashboard',
  RESEARCHER: 'Research dashboard',
  MENTOR: 'Mentor dashboard',
  SPONSOR: 'Sponsor dashboard',
  ADMIN: 'Platform administration',
};

type CountResult = { count: number | null; error: { message: string } | null };

async function readCount(result: PromiseLike<CountResult>, label: string) {
  const { count, error } = await result;
  if (error) throw new Error(`${label} could not be loaded: ${error.message}`);
  return count ?? 0;
}

export async function RoleDashboard({ role }: { role: UserRole }) {
  const { supabase, actor } = await requireAuthenticatedActor();
  requireRole(actor, [role]);

  const projectCountQuery = supabase.from('projects').select('id', { count: 'exact', head: true });
  const projectListQuery = supabase
    .from('projects')
    .select('id, title, status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5);

  const jobs: PromiseLike<unknown>[] = [
    readCount(projectCountQuery, 'Project count'),
    projectListQuery,
  ];

  if (role === 'STUDENT') {
    jobs.push(
      readCount(supabase.from('project_tasks').select('id', { count: 'exact', head: true }).eq('assigned_to', actor.id).neq('status', 'DONE'), 'Assigned task count'),
      readCount(supabase.from('contributions').select('id', { count: 'exact', head: true }).eq('author_id', actor.id), 'Contribution count'),
    );
  } else if (role === 'MENTOR') {
    jobs.push(readCount(
      supabase.from('contributions').select('id', { count: 'exact', head: true }).eq('status', 'UNDER_REVIEW'),
      'Review queue count',
    ));
  } else if (role === 'SPONSOR') {
    jobs.push(readCount(
      supabase.from('project_access_requests').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
      'Pending access request count',
    ));
  } else if (role === 'ADMIN') {
    jobs.push(
      readCount(supabase.from('profiles').select('id', { count: 'exact', head: true }), 'User count'),
      readCount(supabase.from('organization_verifications').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'), 'Organization verification count'),
    );
  } else {
    jobs.push(
      readCount(supabase.from('contributions').select('id', { count: 'exact', head: true }).eq('status', 'UNDER_REVIEW'), 'Pending contribution count'),
      readCount(supabase.from('project_access_requests').select('id', { count: 'exact', head: true }).eq('requester_id', actor.id).eq('status', 'PENDING'), 'Pending access request count'),
    );
  }

  const results = await Promise.all(jobs);
  const projects = results[1] as {
    data: { id: string; title: string; status: string; updated_at: string }[] | null;
    error: { message: string } | null;
  };
  if (projects.error) throw new ApiError(`Recent projects could not be loaded: ${projects.error.message}`, 503);

  const metrics = results.filter((value, index) => index !== 1) as number[];
  const cards = [
    { label: 'Projects you can access', value: metrics[0] },
    ...(role === 'STUDENT'
      ? [{ label: 'Open assigned tasks', value: metrics[1] }, { label: 'Your contributions', value: metrics[2] }]
      : role === 'MENTOR'
        ? [{ label: 'Contributions awaiting review', value: metrics[1] }]
        : role === 'SPONSOR'
          ? [{ label: 'Pending access requests', value: metrics[1] }]
          : role === 'ADMIN'
            ? [{ label: 'Registered users', value: metrics[1] }, { label: 'Organizations awaiting verification', value: metrics[2] }]
            : [{ label: 'Contributions awaiting review', value: metrics[1] }, { label: 'Your pending access requests', value: metrics[2] }]),
  ];
  const metricIcons = role === 'ADMIN'
    ? [FolderKanban, Users, ShieldCheck]
    : role === 'SPONSOR'
      ? [FolderKanban, BriefcaseBusiness]
      : role === 'MENTOR'
        ? [FolderKanban, ClipboardCheck]
        : [FolderKanban, ClipboardCheck, BriefcaseBusiness];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-700">{actor.role}</p>
          <h1 className="text-balance mt-2 text-3xl font-semibold text-slate-950">{titleByRole[role]}</h1>
          <p className="text-pretty mt-2 max-w-2xl text-sm text-slate-600">
            Welcome, {actor.fullName}. Here is a view of the work connected to your account.
          </p>
        </div>
        <Link className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800" href="/projects">
          Browse projects <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </header>

      <section aria-label="Workspace summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = metricIcons[index] ?? FolderKanban;
          return (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-600">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-950">{card.value}</p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                <Icon className="size-5" aria-hidden="true" />
              </span>
            </div>
          </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-balance text-base font-semibold text-slate-950">Recent projects</h2>
              <p className="mt-1 text-sm text-slate-500">Projects visible to your account</p>
            </div>
            <Link className="inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:text-teal-950" href="/projects">
              View all <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        {projects.data?.length ? (
          <ul className="divide-y divide-slate-100">
            {projects.data.map((project) => (
              <li key={project.id} className="flex items-center gap-4 px-5 py-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <FolderKanban className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={`/projects/${project.id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-teal-800">
                    {project.title}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    Updated {new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(project.updated_at))}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {project.status.replaceAll('_', ' ')}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-slate-800">No projects are available yet</p>
            <p className="text-pretty mt-1 text-sm text-slate-500">Browse the directory to find a project or collaboration opportunity.</p>
            <Link className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" href="/projects">
              Explore projects <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        )}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
            <Users className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-balance mt-4 text-base font-semibold text-slate-950">Build something together</h2>
          <p className="text-pretty mt-2 text-sm leading-6 text-slate-600">
            Find a research project that matches your goals, or open a project workspace to see its charter, evidence, and team activity.
          </p>
          <Link href="/projects" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-950">
            Explore the directory <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </aside>
      </section>
    </div>
  );
}
