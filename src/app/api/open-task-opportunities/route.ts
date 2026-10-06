import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse, requireAuthenticatedActor, requireRole } from '@/lib/auth';
import { requireUuid } from '@/lib/http';

export async function GET(request: NextRequest) {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    requireRole(actor, ['STUDENT', 'RESEARCHER']);
    const rawProjectId = request.nextUrl.searchParams.get('projectId');
    const projectId = rawProjectId ? requireUuid(rawProjectId, 'projectId') : null;
    const { data, error } = await supabase.rpc('list_open_task_opportunities', {
      p_project_id: projectId,
    });
    if (error) throw new Error(`Task opportunities could not be loaded: ${error.message}`);
    return NextResponse.json({ opportunities: data });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
