import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiErrorResponse, requireAuthenticatedActor } from '@/lib/auth';
import { readJsonBody, requireText, requireUuid } from '@/lib/http';

const agentTypes = new Set([
  'RESEARCH_AGENT',
  'ANALYSIS_AGENT',
  'IMPLEMENTATION_AGENT',
  'INTEGRITY_AGENT',
  'CONTRIBUTION_AGENT',
  'REPORTING_AGENT',
  'CODING_AGENT',
  'DATA_AGENT',
  'EXPERIMENT_AGENT',
  'DOC_AGENT',
]);

type JsonObject = Record<string, unknown>;

function objectValue(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    const body = await readJsonBody(request);
    const projectId = requireUuid(body.projectId, 'projectId');
    const agentType = requireText(body.agentType, 'agentType', 40).toUpperCase();
    const prompt = requireText(body.prompt, 'prompt', 24000);
    if (!agentTypes.has(agentType)) throw new ApiError('agentType is not supported.', 400);
    if (body.requestedTools !== undefined
      && (!Array.isArray(body.requestedTools)
        || body.requestedTools.length > 20
        || body.requestedTools.some((tool) => typeof tool !== 'string' || tool.length > 100))) {
      throw new ApiError('requestedTools must be an array of at most 20 tool names.', 400);
    }
    const requestedTools = (body.requestedTools ?? []) as string[];

    const { data: hasAccess, error: accessError } = await supabase.rpc('can_access_project', {
      p_project_id: projectId,
      p_resource_key: 'ai-workspace',
    });
    if (accessError) throw new Error(`AI workspace authorization failed: ${accessError.message}`);
    if (!hasAccess) throw new ApiError('You do not have access to this project AI workspace.', 403);

    const { data: charterData, error: charterError } = await supabase.rpc('get_ai_charter', {
      p_project_id: projectId,
    });
    if (charterError) throw new Error(`AI charter lookup failed: ${charterError.message}`);
    const charterRow = Array.isArray(charterData) ? charterData[0] : charterData;
    if (!charterRow) throw new ApiError('Project charter is unavailable for this AI request.', 403);

    const charter = objectValue(charterRow.charter);
    const humanPermissions = objectValue(charter.humanPermissions);
    const aiPermissions = objectValue(charter.aiPermissions);
    const agentPermissions = objectValue(charter.agentPermissions);
    const toolPermissions = objectValue(charter.toolPermissions);
    const allowedRoles = Array.isArray(humanPermissions.allowedRoles) ? humanPermissions.allowedRoles : [];
    const allowedAgents = Array.isArray(agentPermissions.allowedAgents) ? agentPermissions.allowedAgents : [];
    const restrictedAgents = Array.isArray(agentPermissions.restrictedAgents) ? agentPermissions.restrictedAgents : [];
    const allowedTools = Array.isArray(toolPermissions.allowedTools) ? toolPermissions.allowedTools : [];
    const bannedTools = Array.isArray(toolPermissions.bannedTools) ? toolPermissions.bannedTools : [];
    const violations: string[] = [];

    if (allowedRoles.length && !allowedRoles.includes(actor.role)) violations.push('Your role is not allowed by the project charter.');
    if (aiPermissions.aiAssistanceAllowed !== true) violations.push('AI assistance is disabled by the project charter.');
    if (!allowedAgents.includes(agentType) || restrictedAgents.includes(agentType)) violations.push('This agent is not allowed by the project charter.');
    for (const tool of requestedTools) {
      if (bannedTools.includes(tool)) violations.push(`Tool "${tool}" is banned by the project charter.`);
      else if (!allowedTools.includes(tool)) violations.push(`Tool "${tool}" is not allowed by the project charter.`);
    }
    const maxTokens = typeof aiPermissions.maxTokensPerSession === 'number' ? aiPermissions.maxTokensPerSession : 0;
    const tokenEstimate = Math.ceil(prompt.length / 3) + 2000;
    if (!maxTokens || tokenEstimate > maxTokens) violations.push('The prompt exceeds the project charter token limit.');

    if (violations.length) {
      const { error: auditError } = await supabase.from('audit_events').insert({
        actor_id: actor.id,
        project_id: projectId,
        action: 'AI_INVOCATION_DENIED',
        resource_type: 'ai_agent',
        resource_id: agentType,
        outcome: 'DENIED',
        details: violations.join(' '),
        metadata: { requestedTools, charterVersion: charterRow.version },
      });
      if (auditError) throw new Error(`AI denial audit write failed: ${auditError.message}`);
      return NextResponse.json({ error: 'The project charter denied this AI request.', violations }, { status: 403 });
    }

    const { error: auditError } = await supabase.from('audit_events').insert({
      actor_id: actor.id,
      project_id: projectId,
      action: 'AI_INVOCATION_NOT_CONFIGURED',
      resource_type: 'ai_agent',
      resource_id: agentType,
      outcome: 'ERROR',
      details: 'Charter checks passed, but no AI runtime is configured; the prompt was not sent to a model.',
      metadata: { requestedTools, charterVersion: charterRow.version },
    });
    if (auditError) throw new Error(`AI runtime audit write failed: ${auditError.message}`);

    throw new ApiError('No AI runtime is configured. The prompt was not dispatched or stored.', 503);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
