import { notFound, redirect } from 'next/navigation';
import { requireAuthenticatedActor, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ id?: string }> };

export default async function MentorReviewPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const { supabase, actor } = await requireAuthenticatedActor();
  requireRole(actor, ['MENTOR', 'RESEARCHER', 'ADMIN']);

  let query = supabase.from('contributions').select('id, project_id').order('submitted_at', { ascending: true }).limit(1);
  if (id) query = query.eq('id', id);
  const { data: contribution, error } = await query.maybeSingle();
  if (error) throw new Error(`Contribution review could not be loaded: ${error.message}`);
  if (id && !contribution) notFound();
  if (!contribution) redirect('/projects');
  redirect(`/projects/${contribution.project_id}/contributions?review=${contribution.id}`);
}
