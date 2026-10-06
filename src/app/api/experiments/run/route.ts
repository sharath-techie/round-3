import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiErrorResponse, requireAuthenticatedActor, requireRole } from '@/lib/auth';
import { readJsonBody, requireUuid } from '@/lib/http';

export async function POST(request: NextRequest) {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    requireRole(actor, ['STUDENT', 'RESEARCHER']);
    const body = await readJsonBody(request);
    const experimentId = requireUuid(body.experimentId, 'experimentId');
    const { data: experiment, error } = await supabase
      .from('experiments')
      .select('id, project_id')
      .eq('id', experimentId)
      .maybeSingle();
    if (error) throw new Error(`Experiment lookup failed: ${error.message}`);
    if (!experiment) return NextResponse.json({ error: 'Experiment not found or unavailable.' }, { status: 404 });

    await supabase.from('audit_events').insert({
      actor_id: actor.id,
      project_id: experiment.project_id,
      action: 'EXPERIMENT_RUN_NOT_CONFIGURED',
      resource_type: 'experiment',
      resource_id: experiment.id,
      outcome: 'ERROR',
      details: 'No experiment worker is configured; no run was started.',
    });

    throw new ApiError('Experiment execution is unavailable because no worker runtime is configured. No run was created.', 503);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
