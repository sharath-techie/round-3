import { AdminUsers } from '@/components/admin/AdminUsers';
import { requireAuthenticatedActor, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const { supabase, actor } = await requireAuthenticatedActor();
  requireRole(actor, ['ADMIN']);
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, institution, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`User profiles could not be loaded: ${error.message}`);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-semibold text-white">Platform users</h1>
        <p className="mt-1 text-sm text-slate-400">Platform roles are administrator-assigned and every change is audited.</p>
      </header>
      <AdminUsers users={users ?? []} />
    </main>
  );
}
