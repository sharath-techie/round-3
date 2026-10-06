import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse, requireAuthenticatedActor, requireRole } from '@/lib/auth';
import { optionalText, readJsonBody, requireText, requireUuid } from '@/lib/http';

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAuthenticatedActor();
    const projectId = request.nextUrl.searchParams.get('id');

    if (projectId) {
      const { data, error } = await supabase
        .from('projects')
        .select('id, research_problem_id, sponsor_organization_id, sponsor_user_id, lead_researcher_id, title, objective, status, created_at, updated_at')
        .eq('id', requireUuid(projectId, 'id'))
        .maybeSingle();
      if (error) throw new Error(`Project lookup failed: ${error.message}`);
      if (!data) return NextResponse.json({ error: 'Project not found or unavailable.' }, { status: 404 });

      const { data: charter, error: charterError } = await supabase
        .from('project_charters')
        .select('id, version, charter, created_by, created_at')
        .eq('project_id', data.id)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (charterError) throw new Error(`Project charter lookup failed: ${charterError.message}`);

      return NextResponse.json({ project: data, charter });
    }

    const { data, error } = await supabase
      .from('projects')
      .select('id, research_problem_id, sponsor_organization_id, sponsor_user_id, lead_researcher_id, title, objective, status, created_at, updated_at')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Project listing failed: ${error.message}`);

    return NextResponse.json({ projects: data });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    requireRole(actor, ['SPONSOR', 'ADMIN']);
    const body = await readJsonBody(request);

    const organizationId = requireUuid(body.sponsorOrganizationId, 'sponsorOrganizationId');
    const title = requireText(body.title, 'title', 200);
    const objective = requireText(body.objective, 'objective', 8000);
    const researchProblemId = body.researchProblemId == null || body.researchProblemId === ''
      ? null
      : requireUuid(body.researchProblemId, 'researchProblemId');
    if (!body.charter || typeof body.charter !== 'object' || Array.isArray(body.charter)) {
      return NextResponse.json({ error: 'charter must be a structured JSON object.' }, { status: 400 });
    }
    const charter = body.charter as Record<string, unknown>;
    const { data: projectId, error } = await supabase.rpc('create_sponsored_project', {
      p_organization_id: organizationId,
      p_title: title,
      p_objective: objective,
      p_research_problem_id: researchProblemId,
      p_charter: charter,
    });
    if (error) {
      console.error('Project creation transaction failed:', error.message);
      return NextResponse.json({ error: 'Project creation failed. Confirm sponsor organization verification and charter details.' }, { status: 400 });
    }

    const id = requireUuid(projectId, 'created project id');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, research_problem_id, sponsor_organization_id, sponsor_user_id, lead_researcher_id, title, objective, status, created_at, updated_at')
      .eq('id', id)
      .single();
    if (projectError) throw new Error(`Created project could not be loaded: ${projectError.message}`);

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
