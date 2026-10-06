import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiErrorResponse } from '@/lib/auth';
import { requireSqlEditorAdmin } from '@/lib/sql-editor/auth';
import { readJsonBody, requireText, requireUuid } from '@/lib/http';

type RouteContext = { params: Promise<{ queryId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { supabase, actor } = await requireSqlEditorAdmin();
    const { queryId: rawId } = await context.params;
    const queryId = requireUuid(rawId, 'queryId');
    const body = await readJsonBody(request);
    const name = requireText(body.name, 'name', 120);
    const queryText = requireText(body.query, 'query', 100_000);
    const { data, error } = await supabase
      .from('admin_saved_sql_queries')
      .update({ name, query_text: queryText, updated_at: new Date().toISOString() })
      .eq('id', queryId)
      .eq('admin_id', actor.id)
      .select('id, name, query_text, created_at, updated_at')
      .maybeSingle();
    if (error) {
      if (error.code === '23505') throw new ApiError('A saved query with this name already exists.', 409);
      throw new Error(`Saved query could not be updated: ${error.message}`);
    }
    if (!data) throw new ApiError('Saved query not found.', 404);
    return NextResponse.json({ query: data });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { supabase, actor } = await requireSqlEditorAdmin();
    const { queryId: rawId } = await context.params;
    const queryId = requireUuid(rawId, 'queryId');
    const { data, error } = await supabase
      .from('admin_saved_sql_queries')
      .delete()
      .eq('id', queryId)
      .eq('admin_id', actor.id)
      .select('id')
      .maybeSingle();
    if (error) throw new Error(`Saved query could not be deleted: ${error.message}`);
    if (!data) throw new ApiError('Saved query not found.', 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
