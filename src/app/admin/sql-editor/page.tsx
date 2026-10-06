import { redirect } from 'next/navigation';
import { SqlEditor } from '@/components/admin/SqlEditor';
import { requireAuthenticatedActor } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminSqlEditorPage() {
  const { actor } = await requireAuthenticatedActor();
  if (actor.role !== 'ADMIN') redirect(`/${actor.role.toLowerCase()}/dashboard`);

  return <SqlEditor />;
}
