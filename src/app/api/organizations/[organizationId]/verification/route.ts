import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiErrorResponse, requireAuthenticatedActor, requireRole } from '@/lib/auth';
import { readJsonBody, requireText, requireUuid } from '@/lib/http';

type RouteContext = { params: Promise<{ organizationId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    requireRole(actor, ['SPONSOR', 'ADMIN']);
    const { organizationId: rawOrganizationId } = await context.params;
    const organizationId = requireUuid(rawOrganizationId, 'organizationId');
    const body = await readJsonBody(request);
    const documentPath = requireText(body.documentPath, 'documentPath', 500);
    if (!documentPath.startsWith(`${organizationId}/${actor.id}/`) || documentPath.includes('..')) {
      throw new ApiError('Verification documents must be uploaded to your organization-specific private folder.', 400);
    }

    const { data, error } = await supabase
      .from('organization_verifications')
      .insert({
        organization_id: organizationId,
        document_path: documentPath,
        submitted_by: actor.id,
      })
      .select('id, organization_id, status, submitted_at')
      .single();
    if (error) {
      console.error('Organization verification submission failed:', error.message);
      throw new ApiError('Verification could not be submitted. Confirm the document upload and organization membership.', 400);
    }
    return NextResponse.json({ verification: data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
