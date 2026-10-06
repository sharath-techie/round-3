import { OrganizationVerificationQueue } from '@/components/organizations/OrganizationVerificationQueue';
import { requireAuthenticatedActor, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminVerificationPage() {
  const { supabase, actor } = await requireAuthenticatedActor();
  requireRole(actor, ['ADMIN']);
  const { data: verifications, error } = await supabase
    .from('organization_verifications')
    .select('id, organization_id, document_path, submitted_at, organization:organizations!organization_verifications_organization_id_fkey(name)')
    .eq('status', 'PENDING')
    .order('submitted_at', { ascending: true });
  if (error) throw new Error(`Organization verifications could not be loaded: ${error.message}`);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header>
        <p className="text-xs font-semibold uppercase text-teal-800">Platform administration</p>
        <h1 className="text-balance mt-2 text-3xl font-semibold text-slate-950">Organization verification</h1>
        <p className="text-pretty mt-2 text-sm text-slate-600">Review private documents before sponsors can create projects.</p>
      </header>
      <OrganizationVerificationQueue verifications={verifications ?? []} />
    </main>
  );
}
