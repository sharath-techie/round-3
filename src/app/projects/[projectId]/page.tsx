import { notFound } from 'next/navigation';
import { AccessRequestForm } from '@/components/projects/AccessRequestForm';
import { AccessRequestQueue } from '@/components/projects/AccessRequestQueue';
import { ProjectWorkspaceNav } from '@/components/projects/ProjectWorkspaceNav';
import { requireAuthenticatedActor } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ projectId: string }> };

export default async function ProjectWorkspacePage({ params }: RouteContext) {
  const { projectId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) notFound();

  const { supabase, actor } = await requireAuthenticatedActor();
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, title, objective, status, sponsor_user_id, lead_researcher_id, created_at, updated_at')
    .eq('id', projectId)
    .maybeSingle();
  if (projectError) throw new Error(`Project could not be loaded: ${projectError.message}`);
  if (!project) notFound();

  const [{ data: charters, error: charterError }, { data: milestones, error: milestoneError }, { data: tasks, error: taskError }] = await Promise.all([
    supabase.from('project_charters').select('id, version, created_at').eq('project_id', project.id).order('version', { ascending: false }).limit(1),
    supabase.from('project_milestones').select('id, title, status, due_at').eq('project_id', project.id).order('due_at'),
    supabase.from('project_tasks').select('id, title, description, status, due_at, assigned_to').eq('project_id', project.id).order('created_at', { ascending: false }).limit(10),
  ]);
  if (charterError) throw new Error(`Project charter access check failed: ${charterError.message}`);
  if (milestoneError) throw new Error(`Milestones could not be loaded: ${milestoneError.message}`);
  if (taskError) throw new Error(`Tasks could not be loaded: ${taskError.message}`);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-teal-800">Shared project workspace</p>
            <h1 className="text-balance mt-2 text-3xl font-semibold text-slate-950">{project.title}</h1>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">{project.status.replaceAll('_', ' ')}</span>
        </div>
        <p className="text-pretty mt-3 max-w-3xl text-sm leading-6 text-slate-600">{project.objective}</p>
        <p className="mt-4 break-all text-xs text-slate-400">Project ID: {project.id}</p>
      </header>

      <ProjectWorkspaceNav projectId={project.id} activeSection="overview" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">Project overview</h2>
            <p className="text-pretty mt-2 text-sm leading-6 text-slate-600">
              Confidential research records are served only when the project access policy grants the current account the matching resource scope.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">Sponsor project owner</span>
              {project.lead_researcher_id && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">Research lead assigned</span>}
              {charters?.[0] && <span className="rounded-full bg-teal-50 px-3 py-1.5 text-teal-900">Charter version {charters[0].version}</span>}
              {!charters?.[0] && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-900">Charter details require access</span>}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">Milestones</h2>
            {milestones?.length ? (
              <ul className="mt-3 divide-y divide-slate-100">
                {milestones.map((milestone) => (
                  <li key={milestone.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="text-sm font-medium text-slate-800">{milestone.title}</span>
                    <span className="text-right text-xs text-slate-500">{milestone.status.replaceAll('_', ' ')}{milestone.due_at ? ` · ${new Date(milestone.due_at).toLocaleDateString()}` : ''}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-pretty mt-3 text-sm text-slate-500">No milestones are visible to this account.</p>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">Tasks available to your account</h2>
            {tasks?.length ? (
              <ul className="mt-3 divide-y divide-slate-100">
                {tasks.map((task) => (
                  <li key={task.id} className="py-3">
                    <div className="flex flex-wrap justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">{task.title}</p>
                      <span className="text-xs text-slate-500">{task.status.replaceAll('_', ' ')}</span>
                    </div>
                    <p className="text-pretty mt-1 text-xs leading-5 text-slate-600">{task.description}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-pretty mt-3 text-sm text-slate-500">No task details are assigned or shared with this account.</p>}
          </section>
        </div>

        <aside className="space-y-4">
          {(actor.role === 'STUDENT' || actor.role === 'RESEARCHER' || actor.role === 'MENTOR') && (
            <AccessRequestForm projectId={project.id} role={actor.role} />
          )}
          <AccessRequestQueue projectId={project.id} role={actor.role} />
        </aside>
      </div>
    </div>
  );
}
