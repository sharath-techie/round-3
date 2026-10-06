import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiErrorResponse, requireAuthenticatedActor, requireRole } from '@/lib/auth';
import { optionalText, readJsonBody, requireUuid } from '@/lib/http';

type RouteContext = { params: Promise<{ verificationId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    requireRole(actor, ['ADMIN']);
    const { verificationId: rawVerificationId } = await context.params;
    const verificationId = requireUuid(rawVerificationId, 'verificationId');
    const body = await readJsonBody(request);
    if (body.decision !== 'APPROVED' && body.decision !== 'REJECTED') {
      throw new ApiError('decision must be APPROVED or REJECTED.', 400);
    }
    const notes = optionalText(body.notes, 'notes', 4000) ?? '';
    const { error } = await supabase.rpc('decide_organization_verification', {
      p_verification_id: verificationId,
      p_decision: body.decision,
      p_review_notes: notes,
    });
    if (error) {
      console.error('Organization verification decision failed:', error.message);
      throw new ApiError('The organization verification decision could not be recorded.', 400);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
