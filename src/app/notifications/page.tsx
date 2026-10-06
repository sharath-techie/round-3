import { NotificationList, NotificationItem } from '@/components/notifications/NotificationList';
import { requireAuthenticatedActor } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const { supabase, actor } = await requireAuthenticatedActor();
  const { data, error } = await supabase
    .from('notifications')
    .select('id, project_id, title, message, read_at, created_at')
    .eq('user_id', actor.id)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(`Notifications could not be loaded: ${error.message}`);

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">{actor.role}</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Notifications</h1>
        <p className="mt-2 text-sm text-slate-600">Updates about project access, work assignments, and contribution reviews.</p>
      </header>
      <NotificationList initialNotifications={(data ?? []) as NotificationItem[]} />
    </main>
  );
}
