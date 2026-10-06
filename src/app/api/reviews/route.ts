import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiErrorResponse, requireAuthenticatedActor, requireRole } from '@/lib/auth';
import { readJsonBody, requireText, requireUuid } from '@/lib/http';

const decisions = new Set(['APPROVE', 'REQUEST_CHANGES', 'REJECT', 'ESCALATE_DISPUTE']);

export async function POST(request: NextRequest) {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    requireRole(actor, ['MENTOR', 'RESEARCHER', 'ADMIN']);
    const body = await readJsonBody(request);
    const contributionId = requireUuid(body.contributionId, 'contributionId');
    if (typeof body.decision !== 'string' || !decisions.has(body.decision)) {
      throw new ApiError('decision must be a supported review decision.', 400);
    }
    if (typeof body.methodologyScore !== 'number' || !Number.isSafeInteger(body.methodologyScore) || body.methodologyScore < 1 || body.methodologyScore > 10) {
      throw new ApiError('methodologyScore must be an integer from 1 to 10.', 400);
    }
    if (typeof body.reproducibilityScore !== 'number' || !Number.isSafeInteger(body.reproducibilityScore) || body.reproducibilityScore < 1 || body.reproducibilityScore > 10) {
      throw new ApiError('reproducibilityScore must be an integer from 1 to 10.', 400);
    }
    if (typeof body.charterCompliance !== 'boolean') {
      throw new ApiError('charterCompliance must be a boolean.', 400);
    }
    const comments = requireText(body.comments, 'comments', 8000);
    let creditsAwarded: number | null = null;
    if (body.creditsAwarded !== undefined && body.creditsAwarded !== null && body.creditsAwarded !== '') {
      if (!Number.isSafeInteger(body.creditsAwarded) || (body.creditsAwarded as number) < 0) {
        throw new ApiError('creditsAwarded must be a non-negative integer.', 400);
      }
      creditsAwarded = body.creditsAwarded as number;
    }
    if (body.decision === 'APPROVE' && creditsAwarded === null) {
      throw new ApiError('An explicit human-approved creditsAwarded value is required for approval.', 400);
    }

    const { data: reviewId, error } = await supabase.rpc('review_contribution', {
      p_contribution_id: contributionId,
      p_decision: body.decision,
      p_methodology_score: body.methodologyScore,
      p_reproducibility_score: body.reproducibilityScore,
      p_charter_compliant: body.charterCompliance,
      p_comments: comments,
      p_credits_awarded: creditsAwarded,
    });
    if (error) {
      console.error('Contribution review transaction failed:', error.message);
      return NextResponse.json({ error: 'Review could not be recorded. Confirm the contribution is reviewable and you have project review access.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, reviewId });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
