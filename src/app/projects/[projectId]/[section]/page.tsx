import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AccessRequestForm } from '@/components/projects/AccessRequestForm';
import { AccessRequestQueue } from '@/components/projects/AccessRequestQueue';
import { AgentInvocationForm } from '@/components/projects/AgentInvocationForm';
import { ContributionReviewForm } from '@/components/projects/ContributionReviewForm';
import { ContributionSubmissionForm } from '@/components/projects/ContributionSubmissionForm';
import { ProjectWorkspaceNav } from '@/components/projects/ProjectWorkspaceNav';
import { requireAuthenticatedActor } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ projectId: string; section: string }> };

const headings: Record<string, string> = {
  charter: 'Charter',
  team: 'Team',
  research: 'Research',
  implementation: 'Implementation',
  experiments: 'Experiments',
  'ai-workspace': 'AI Workspace',
  evidence: 'Evidence',
  access: 'Access',
  milestones: 'Milestones',
  contributions: 'Contributions',
  activity: 'Activity',
};

function display(value: unknown) {
  if (value == null) return '—';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

export default async function ProjectSectionPage({ params }: RouteContext) {
  const { projectId, section } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) notFound();
  if (section === 'overview') redirect(`/projects/${projectId}`);
  if (!headings[section]) notFound();

  const { supabase, actor } = await requireAuthenticatedActor();
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, title')
    .eq('id', projectId)
    .maybeSingle();
  if (projectError) throw new Error(`Project could not be loaded: ${projectError.message}`);
  if (!project) notFound();

  let records: Record<string, unknown>[] = [];
  let explanatoryNote: string | null = null;
  let canSubmitContribution = false;
  let assignedTasks: { id: string; title: string }[] = [];

  if (section === 'charter') {
    const { data, error } = await supabase.from('project_charters').select('version, charter, created_at').eq('project_id', project.id).order('version', { ascending: false });
    if (error) throw new Error(`Charter history could not be loaded: ${error.message}`);
    records = data ?? [];
    explanatoryNote = 'Charter versions are immutable; updates are stored as new versions.';
  } else if (section === 'team') {
    const { data, error } = await supabase.from('project_members')
      .select('user_id, role, status, joined_at, profile:profiles!project_members_user_id_fkey(full_name)')
      .eq('project_id', project.id)
      .order('created_at');
    if (error) throw new Error(`Project team could not be loaded: ${error.message}`);
    records = data ?? [];
  } else if (section === 'research' || section === 'implementation') {
    const docType = section === 'research' ? 'RESEARCH' : 'IMPLEMENTATION';
    const { data, error } = await supabase.from('project_documents')
      .select('type, resource_key, title, body, object_path, created_by, created_at')
      .eq('project_id', project.id)
      .eq('type', docType)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`${headings[section]} records could not be loaded: ${error.message}`);
    records = data ?? [];
    explanatoryNote = 'Only documents covered by an approved project resource grant are returned.';
  } else if (section === 'experiments') {
    const { data, error } = await supabase.from('experiments')
      .select('id, title, hypothesis, methodology, parameters, status, created_at')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Experiments could not be loaded: ${error.message}`);
    records = data ?? [];
    explanatoryNote = 'Execution is unavailable until a real experiment worker is configured; this page does not synthesize metrics.';
  } else if (section === 'evidence') {
    const { data, error } = await supabase.from('evidence')
      .select('id, type, title, description, object_path, content_hash, created_by, created_at')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Evidence could not be loaded: ${error.message}`);
    records = data ?? [];
  } else if (section === 'milestones') {
    const { data, error } = await supabase.from('project_milestones')
      .select('id, title, description, status, due_at, created_at')
      .eq('project_id', project.id)
      .order('due_at');
    if (error) throw new Error(`Milestones could not be loaded: ${error.message}`);
    records = data ?? [];
  } else if (section === 'contributions') {
    const { data, error } = await supabase.from('contributions')
      .select('id, title, summary, status, credits_requested, credits_awarded, author_id, submitted_at')
      .eq('project_id', project.id)
      .order('submitted_at', { ascending: false });
    if (error) throw new Error(`Contributions could not be loaded: ${error.message}`);
    records = data ?? [];
    if (actor.role === 'STUDENT' || actor.role === 'RESEARCHER') {
      const { data: hasResearchAccess, error: accessError } = await supabase.rpc('can_access_project', {
        p_project_id: project.id,
        p_resource_key: 'research',
      });
      if (accessError) throw new Error(`Contribution access could not be checked: ${accessError.message}`);
      const { data: tasks, error: taskError } = await supabase.from('project_tasks')
        .select('id, title')
        .eq('project_id', project.id)
        .eq('assigned_to', actor.id)
        .order('created_at');
      if (taskError) throw new Error(`Assigned contribution tasks could not be loaded: ${taskError.message}`);
      assignedTasks = tasks ?? [];
      canSubmitContribution = actor.role === 'STUDENT'
        ? assignedTasks.length > 0
        : hasResearchAccess === true || assignedTasks.length > 0;
      explanatoryNote = 'Credit requests are reviewed by a human. File upload is not configured; evidence is currently descriptive metadata only.';
    }
  } else if (section === 'activity') {
    const { data, error } = await supabase.from('audit_events')
      .select('action, resource_type, resource_id, outcome, details, created_at, actor_id')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw new Error(`Project activity could not be loaded: ${error.message}`);
    records = data ?? [];
  } else if (section === 'ai-workspace') {
    const { data: hasAccess, error } = await supabase.rpc('can_access_project', {
      p_project_id: project.id,
      p_resource_key: 'ai-workspace',
    });
    if (error) throw new Error(`AI workspace access could not be checked: ${error.message}`);
    if (hasAccess) {
      return (
        <main className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <PageHeading projectId={project.id} section={section} projectTitle={project.title} heading={headings[section]} />
          <AgentInvocationForm projectId={project.id} />
        </main>
      );
    }
    explanatoryNote = 'AI workspace access is not granted to this account.';
  }

  return (
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <PageHeading projectId={project.id} section={section} projectTitle={project.title} heading={headings[section]} />
      {section === 'access' && (
        <div className="grid gap-5 lg:grid-cols-2">
          {(actor.role === 'STUDENT' || actor.role === 'RESEARCHER' || actor.role === 'MENTOR') && (
            <AccessRequestForm projectId={project.id} role={actor.role} />
          )}
          {(actor.role === 'SPONSOR' || actor.role === 'RESEARCHER' || actor.role === 'MENTOR' || actor.role === 'ADMIN') && (
            <AccessRequestQueue projectId={project.id} role={actor.role} />
          )}
        </div>
      )}
      {section === 'contributions' && canSubmitContribution && (
        <ContributionSubmissionForm
          projectId={project.id}
          tasks={assignedTasks}
          isStudent={actor.role === 'STUDENT'}
        />
      )}
      {explanatoryNote && <p className="text-pretty rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-950">{explanatoryNote}</p>}
      {section !== 'access' && records.length > 0 && (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {records.map((record, index) => {
            const label = String(record.title ?? record.full_name ?? record.action ?? record.type ?? record.id ?? `${headings[section]} ${index + 1}`);
            const details = Object.entries(record).filter(([key, value]) => key !== 'title' && value != null);
            return (
              <li key={String(record.id ?? `${section}-${index}`)} className="px-5 py-5">
                <h2 className="text-sm font-semibold text-slate-900">{label}</h2>
                <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                  {details.map(([key, value]) => (
                    <div key={key} className="min-w-0">
                      <dt className="text-[10px] uppercase text-slate-500">{key.replaceAll('_', ' ')}</dt>
                      <dd className="text-pretty mt-0.5 break-words whitespace-pre-wrap text-xs leading-5 text-slate-700">{display(value)}</dd>
                    </div>
                  ))}
                </dl>
                {section === 'contributions'
                  && (actor.role === 'MENTOR' || actor.role === 'RESEARCHER' || actor.role === 'ADMIN')
                  && ['SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED'].includes(String(record.status))
                  && typeof record.id === 'string'
                  && typeof record.credits_requested === 'number'
                  && <ContributionReviewForm contributionId={record.id} creditsRequested={record.credits_requested} />}
              </li>
            );
          })}
        </ul>
      )}
      {section !== 'access' && records.length === 0 && (
        <p className="text-pretty rounded-2xl border border-slate-200 bg-white px-5 py-8 text-sm text-slate-600">
          No {headings[section].toLowerCase()} records are available to this account.
        </p>
      )}
      <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:underline">Back to project overview</Link>
    </main>
  );
}

function PageHeading({
  projectId,
  section,
  projectTitle,
  heading,
}: {
  projectId: string;
  section: string;
  projectTitle: string;
  heading: string;
}) {
  return (
    <>
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="truncate text-sm font-medium text-teal-800">{projectTitle}</p>
        <h1 className="text-balance mt-1 text-2xl font-semibold text-slate-950">{heading}</h1>
      </header>
      <ProjectWorkspaceNav projectId={projectId} activeSection={section} />
    </>
  );
}
