import Link from 'next/link';
import { ArrowRight, FolderKanban, Plus } from 'lucide-react';
import { requireAuthenticatedActor, requireRole } from '@/lib/auth';
import type { UserRole } from '@/types';

const titleByRole: Record<UserRole, string> = {
  STUDENT: 'Projects and research opportunities',
  RESEARCHER: 'Projects and research opportunities',
  MENTOR: 'Projects',
  SPONSOR: 'Projects',
  ADMIN: 'Projects',
};

export async function ProjectDirectory({ role }: { role: UserRole }) {
  const { supabase, actor } = await requireAuthenticatedActor();
  requireRole(actor, [role]);

  const [{ data: projects, error: projectsError }, { data: problems, error: problemsError }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, objective, status, updated_at')
      .order('updated_at', { ascending: false }),
    supabase
      .from('research_problems')
      .select('id, title, summary, domain, status, created_at')
      .in('status', role === 'SPONSOR' ? ['DRAFT', 'OPEN', 'UNDER_REVIEW', 'ASSIGNED'] : ['OPEN'])
      .order('created_at', { ascending: false }),
  ]);
  if (projectsError) throw new Error(`Projects could not be loaded: ${projectsError.message}`);
  if (problemsError) throw new Error(`Research opportunities could not be loaded: ${problemsError.message}`);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-700">{actor.role}</p>
          <h1 className="text-balance mt-2 text-3xl font-semibold text-slate-950">{titleByRole[role]}</h1>
          <p className="text-pretty mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Lists include only records visible to your authenticated account. Confidential project resources require separate approval.
          </p>
        </div>
        {role === 'SPONSOR' && (
          <Link className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800" href="/sponsor/create">
            <Plus className="size-4" aria-hidden="true" /> Create project
          </Link>
        )}
      </header>

      <section aria-labelledby="projects-heading">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 id="projects-heading" className="text-lg font-semibold text-slate-950">Projects you can access</h2>
            <p className="mt-1 text-sm text-slate-500">Open a workspace to continue your collaboration.</p>
          </div>
          <span className="text-sm tabular-nums text-slate-500">{projects?.length ?? 0} projects</span>
        </div>
        {projects?.length ? (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <li key={project.id} className="flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                    <FolderKanban className="size-5" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{project.status.replaceAll('_', ' ')}</span>
                </div>
                <h3 className="text-balance mt-4 font-semibold text-slate-950">
                  <Link className="hover:text-teal-800" href={`/projects/${project.id}`}>{project.title}</Link>
                </h3>
                <p className="text-pretty mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">{project.objective || 'Project details will appear here.'}</p>
                <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-950" href={`/projects/${project.id}`}>
                  Open workspace <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <FolderKanban className="mx-auto size-8 text-slate-400" aria-hidden="true" />
            <h3 className="mt-3 font-semibold text-slate-900">No projects to show yet</h3>
            <p className="text-pretty mt-1 text-sm text-slate-500">When a project becomes available to your account, it will appear here.</p>
            {(role === 'STUDENT' || role === 'RESEARCHER') && (
              <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-950" href="#open-research-problems">
                View open research problems <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        )}
      </section>

      {(role === 'STUDENT' || role === 'RESEARCHER' || role === 'SPONSOR') && (
        <section id="open-research-problems">
          <h2 className="mb-4 text-lg font-semibold text-slate-950">{role === 'SPONSOR' ? 'Your research problems' : 'Open research problems'}</h2>
          {problems?.length ? (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {problems.map((problem) => (
                <li key={problem.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">{problem.title}</h3>
                    <p className="text-pretty mt-1 text-sm leading-6 text-slate-600">{problem.summary}</p>
                    <p className="mt-2 text-xs text-slate-500">{problem.domain} · {problem.status.replaceAll('_', ' ')}</p>
                  </div>
                  {role === 'SPONSOR' && (
                    <Link className="text-sm font-medium text-teal-800 hover:underline" href={`/sponsor/research-problems/${problem.id}`}>
                      Manage
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-slate-200 bg-white px-5 py-5 text-sm text-slate-600">
              {role === 'SPONSOR' ? 'No research problems have been created for this organization.' : 'There are no open research problems at this time.'}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
