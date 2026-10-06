import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse, requireAuthenticatedActor, requireRole } from '@/lib/auth';
import { optionalText, readJsonBody, requireText, requireUuid } from '@/lib/http';

const evidenceTypes = new Set([
  'RESEARCH_FINDING',
  'EXPERIMENT',
  'IMPLEMENTATION',
  'DOCUMENTATION',
  'DATASET',
  'ANALYSIS',
  'REVIEW',
  'OTHER',
]);

export async function POST(request: NextRequest) {
  try {
    const { supabase, actor } = await requireAuthenticatedActor();
    requireRole(actor, ['STUDENT', 'RESEARCHER']);
    const body = await readJsonBody(request);
    const projectId = requireUuid(body.projectId, 'projectId');
    const taskId = body.taskId == null || body.taskId === '' ? null : requireUuid(body.taskId, 'taskId');
    const aiProvenanceId = body.aiProvenanceId == null || body.aiProvenanceId === ''
      ? null
      : requireUuid(body.aiProvenanceId, 'aiProvenanceId');
    const title = requireText(body.title, 'title', 200);
    const summary = requireText(body.summary, 'summary', 8000);
    const artifactPath = optionalText(body.artifactPath, 'artifactPath', 1000);
    const creditsRequested = body.creditsRequested ?? 0;
    if (!Number.isSafeInteger(creditsRequested) || (creditsRequested as number) < 0) {
      return NextResponse.json({ error: 'creditsRequested must be a non-negative integer.' }, { status: 400 });
    }

    if (!Array.isArray(body.evidenceItems) || body.evidenceItems.length === 0 || body.evidenceItems.length > 50) {
      return NextResponse.json({ error: 'At least one evidence item is required (maximum 50).'}, { status: 400 });
    }
    const evidence = body.evidenceItems.map((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        throw new Error(`Evidence item ${index + 1} must be an object.`);
      }
      const record = item as Record<string, unknown>;
      const type = requireText(record.type, `evidenceItems[${index}].type`, 40).toUpperCase();
      if (!evidenceTypes.has(type)) throw new Error(`Evidence item ${index + 1} has an unsupported type.`);
      return {
        type,
        title: requireText(record.title, `evidenceItems[${index}].title`, 200),
        description: optionalText(record.description, `evidenceItems[${index}].description`, 4000) ?? '',
        objectPath: optionalText(record.objectPath, `evidenceItems[${index}].objectPath`, 1000),
        contentHash: optionalText(record.contentHash, `evidenceItems[${index}].contentHash`, 256),
        metadata: record.metadata && typeof record.metadata === 'object' && !Array.isArray(record.metadata)
          ? record.metadata
          : {},
      };
    });

    const { data: contributionId, error } = await supabase.rpc('submit_contribution', {
      p_project_id: projectId,
      p_task_id: taskId,
      p_title: title,
      p_summary: summary,
      p_artifact_path: artifactPath,
      p_credits_requested: creditsRequested as number,
      p_ai_provenance_id: aiProvenanceId,
      p_evidence: evidence,
    });
    if (error) {
      console.error('Contribution submission transaction failed:', error.message);
      return NextResponse.json({ error: 'Contribution could not be submitted. Verify project access, assigned task, and evidence.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, contributionId }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
