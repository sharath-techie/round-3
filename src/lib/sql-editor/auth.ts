import { ApiError, requireAuthenticatedActor } from '@/lib/auth';

export async function requireSqlEditorAdmin() {
  const session = await requireAuthenticatedActor();
  if (session.actor.role !== 'ADMIN') {
    const { error } = await session.supabase.rpc('record_sql_editor_access_denied');
    if (error) {
      console.error('Denied SQL editor access could not be audited:', {
        actorId: session.actor.id,
        error: error.message,
      });
    }
    throw new ApiError('Administrator access is required to use the SQL editor.', 403);
  }
  return session;
}
