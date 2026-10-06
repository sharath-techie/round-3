import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiErrorResponse, requireAuthenticatedActor } from '@/lib/auth';
import { readJsonBody, requireText, requireUuid } from '@/lib/http';

type RouteContext = { params: Promise<{ projectId: string }> };

const requestableResources = new Set([
  'overview',
  'charter',
  'research',
  'team',
  'ai-workspace',
  'contributions',
  'activity',
  'reports',
  'milestones',
]);

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { supabase } = await requireAuthenticatedActor();
    const { projectId: rawProjectId } = await context.params;
    const projectId = requireUuid(rawProjectId, 'projectId');
    const { data, error } = await supabase
      .from('project_access_requests')
      .select('id, project_id, requester_id, resource_key, reason, status, decided_by, decision_notes, requested_at, decided_at, requester:profiles!project_access_requests_requester_id_fkey(full_name, role)')
      .eq('project_id', projectId)
      .order('requested_at', { ascending: false });
    if (error) throw new Error(`Access request lookup failed: ${error.message}`);
    return NextResponse.json({ requests: data });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    const { projectId: rawProjectId } = await context.params;
    const projectId = requireUuid(rawProjectId, 'projectId');
    const body = await readJsonBody(request);
    const resourceKey = requireText(body.resourceKey, 'resourceKey', 80);
    const reason = requireText(body.reason, 'reason', 4000);

    if (actor.role === 'STUDENT') {
      const match = /^application:([0-9a-f-]{36})$/i.exec(resourceKey);
      if (!match) {
        throw new ApiError('Student access requests must apply for a specific project task.', 400);
      }
      const taskId = requireUuid(match[1], 'taskId');
      const { data: opportunities, error: taskError } = await supabase.rpc('list_open_task_opportunities', {
        p_project_id: projectId,
      });
      if (taskError) throw new Error(`Task opportunity lookup failed: ${taskError.message}`);
      if (!opportunities?.some((task: { task_id: string }) => task.task_id === taskId)) {
        throw new ApiError('This task is not available for an access request.', 404);
      }
    } else if (actor.role === 'RESEARCHER') {
      if (resourceKey !== 'research') {
        throw new ApiError('Researcher access requests must request the research-lead scope.', 400);
      }
    } else if (!requestableResources.has(resourceKey)) {
      throw new ApiError('The requested resource scope is not supported.', 400);
    }

    const { data, error } = await supabase
      .from('project_access_requests')
      .insert({
        project_id: projectId,
        requester_id: actor.id,
        resource_key: resourceKey,
        reason,
      })
      .select('id, project_id, requester_id, resource_key, reason, status, requested_at')
      .single();
    if (error) {
      console.error('Access request creation failed:', error.message);
      return NextResponse.json({ error: 'Access request could not be created. Confirm the project is available and no matching request is already pending.' }, { status: 400 });
    }
    return NextResponse.json({ request: data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
