import { OrganizationManager } from '@/components/organizations/OrganizationManager';
import { requireAuthenticatedActor, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function SponsorOrganizationsPage() {
  const { supabase, actor } = await requireAuthenticatedActor();
  requireRole(actor, ['SPONSOR', 'ADMIN']);
  const { data: organizations, error } = await supabase
    .from('organizations')
    .select('id, name, type, verification_status, organization_verifications(id, status, review_notes, submitted_at)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Organizations could not be loaded: ${error.message}`);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-semibold text-white">Sponsor organizations</h1>
        <p className="mt-1 text-sm text-slate-400">Register an organization and submit private verification documents before creating sponsored projects.</p>
      </header>
      <OrganizationManager organizations={organizations ?? []} />
    </main>
  );
}
