import { NextResponse } from 'next/server';
import { apiErrorResponse, requireAuthenticatedActor } from '@/lib/auth';
import { requireUuid } from '@/lib/http';

type RouteContext = { params: Promise<{ notificationId: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    const { notificationId: rawNotificationId } = await context.params;
    const notificationId = requireUuid(rawNotificationId, 'notificationId');

    const { data, error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', actor.id)
      .is('read_at', null)
      .select('id')
      .maybeSingle();
    if (error) throw new Error(`Notification could not be marked as read: ${error.message}`);
    if (data) return NextResponse.json({ success: true });

    const { data: existing, error: lookupError } = await supabase
      .from('notifications')
      .select('id')
      .eq('id', notificationId)
      .eq('user_id', actor.id)
      .maybeSingle();
    if (lookupError) throw new Error(`Notification status could not be confirmed: ${lookupError.message}`);
    if (!existing) return NextResponse.json({ error: 'Notification not found.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
