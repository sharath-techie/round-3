import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiErrorResponse, requireAuthenticatedActor, requireRole } from '@/lib/auth';
import { optionalText, readJsonBody, requireText } from '@/lib/http';

const organizationTypes = new Set(['COMPANY', 'ACADEMIC', 'FOUNDATION']);

export async function GET() {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    requireRole(actor, ['SPONSOR', 'ADMIN']);
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, type, registration_number, country, verification_status, verified_at, created_at, organization_verifications(id, status, review_notes, submitted_at)')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Organizations could not be loaded: ${error.message}`);
    return NextResponse.json({ organizations: data });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    requireRole(actor, ['SPONSOR', 'ADMIN']);
    const body = await readJsonBody(request);
    const name = requireText(body.name, 'name', 200);
    if (typeof body.type !== 'string' || !organizationTypes.has(body.type)) {
      throw new ApiError('type must be COMPANY, ACADEMIC, or FOUNDATION.', 400);
    }
    const registrationNumber = optionalText(body.registrationNumber, 'registrationNumber', 200);
    const country = optionalText(body.country, 'country', 100);
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name,
        type: body.type,
        registration_number: registrationNumber,
        country,
        created_by: actor.id,
      })
      .select('id, name, type, verification_status, created_at')
      .single();
    if (error) throw new Error(`Organization could not be created: ${error.message}`);
    return NextResponse.json({ organization: data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
