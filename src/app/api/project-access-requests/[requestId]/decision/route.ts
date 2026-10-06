import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiErrorResponse, requireAuthenticatedActor } from '@/lib/auth';
import { optionalText, readJsonBody, requireUuid } from '@/lib/http';

type RouteContext = { params: Promise<{ requestId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { supabase } = await requireAuthenticatedActor();
    const { requestId: rawRequestId } = await context.params;
    const requestId = requireUuid(rawRequestId, 'requestId');
    const body = await readJsonBody(request);
    if (body.decision !== 'APPROVED' && body.decision !== 'REJECTED') {
      throw new ApiError('decision must be APPROVED or REJECTED.', 400);
    }
    const decisionNotes = optionalText(body.decisionNotes, 'decisionNotes', 4000) ?? '';
    const expiresAt = body.expiresAt == null || body.expiresAt === ''
      ? null
      : typeof body.expiresAt === 'string' && !Number.isNaN(Date.parse(body.expiresAt))
        ? new Date(body.expiresAt).toISOString()
        : (() => { throw new ApiError('expiresAt must be a valid ISO date.', 400); })();

    const { error } = await supabase.rpc('decide_project_access_request', {
      p_request_id: requestId,
      p_decision: body.decision,
      p_decision_notes: decisionNotes,
      p_expires_at: expiresAt,
    });
    if (error) {
      console.error('Access request decision failed:', error.message);
      return NextResponse.json({ error: 'Access request decision could not be recorded. Confirm your project authority and that the request is pending.' }, { status: 403 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
