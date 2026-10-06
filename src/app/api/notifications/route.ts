import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse, requireAuthenticatedActor } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    if (request.nextUrl.searchParams.get('countOnly') === '1') {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', actor.id)
        .is('read_at', null);
      if (error) throw new Error(`Unread notification count could not be loaded: ${error.message}`);
      return NextResponse.json({ unreadCount: count ?? 0 });
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('id, project_id, title, message, read_at, created_at')
      .eq('user_id', actor.id)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw new Error(`Notifications could not be loaded: ${error.message}`);
    return NextResponse.json({
      notifications: data,
      unreadCount: data.filter((notification) => notification.read_at === null).length,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
