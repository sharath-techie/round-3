import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiErrorResponse, requireAuthenticatedActor, requireRole } from '@/lib/auth';
import { readJsonBody, requireUuid } from '@/lib/http';

type RouteContext = { params: Promise<{ userId: string }> };
const roles = new Set(['STUDENT', 'RESEARCHER', 'MENTOR', 'SPONSOR', 'ADMIN']);

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    requireRole(actor, ['ADMIN']);
    const { userId: rawUserId } = await context.params;
    const userId = requireUuid(rawUserId, 'userId');
    const body = await readJsonBody(request);
    if (typeof body.role !== 'string' || !roles.has(body.role)) {
      throw new ApiError('role must be a supported platform role.', 400);
    }
    const { error } = await supabase.rpc('admin_assign_role', {
      p_user_id: userId,
      p_role: body.role,
    });
    if (error) {
      console.error('Admin role assignment failed:', error.message);
      throw new ApiError('The account role could not be changed.', 400);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
