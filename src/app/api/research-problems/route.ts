import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse, requireAuthenticatedActor, requireRole } from '@/lib/auth';
import { readJsonBody, requireText, requireUuid } from '@/lib/http';

export async function GET() {
  try {
    const { supabase } = await requireAuthenticatedActor();
    const { data, error } = await supabase
      .from('research_problems')
      .select('id, sponsor_organization_id, sponsor_user_id, title, summary, problem_statement, domain, status, access_terms, created_at, updated_at')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Research problem listing failed: ${error.message}`);
    return NextResponse.json({ researchProblems: data });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    requireRole(actor, ['SPONSOR']);
    const body = await readJsonBody(request);
    const sponsorOrganizationId = requireUuid(body.sponsorOrganizationId, 'sponsorOrganizationId');
    const title = requireText(body.title, 'title', 200);
    const summary = requireText(body.summary, 'summary', 4000);
    const problemStatement = requireText(body.problemStatement, 'problemStatement', 20000);
    const domain = requireText(body.domain, 'domain', 100);
    const status = body.publish === true ? 'OPEN' : 'DRAFT';
    const accessTerms = body.accessTerms && typeof body.accessTerms === 'object' && !Array.isArray(body.accessTerms)
      ? body.accessTerms
      : {};

    const { data, error } = await supabase
      .from('research_problems')
      .insert({
        sponsor_organization_id: sponsorOrganizationId,
        sponsor_user_id: actor.id,
        title,
        summary,
        problem_statement: problemStatement,
        domain,
        status,
        access_terms: accessTerms,
      })
      .select('id, sponsor_organization_id, sponsor_user_id, title, summary, problem_statement, domain, status, access_terms, created_at')
      .single();
    if (error) {
      console.error('Research problem creation failed:', error.message);
      return NextResponse.json({ error: 'Research problem could not be created. A verified sponsor organization is required.' }, { status: 403 });
    }
    return NextResponse.json({ researchProblem: data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
