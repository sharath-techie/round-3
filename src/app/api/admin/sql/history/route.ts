import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiErrorResponse } from '@/lib/auth';
import { requireSqlEditorAdmin } from '@/lib/sql-editor/auth';

export async function GET(request: NextRequest) {
  try {
    const { supabase, actor } = await requireSqlEditorAdmin();
    const rawLimit = Number(request.nextUrl.searchParams.get('limit') ?? '50');
    if (!Number.isSafeInteger(rawLimit) || rawLimit < 1 || rawLimit > 100) {
      throw new ApiError('History limit must be between 1 and 100.', 400);
    }
    const { data, error } = await supabase
      .from('admin_sql_query_history')
      .select('id, query_text, status, command, result_count, duration_ms, error_message, metadata, created_at')
      .eq('admin_id', actor.id)
      .order('created_at', { ascending: false })
      .limit(rawLimit);
    if (error) throw new Error(`SQL execution history could not be loaded: ${error.message}`);
    return NextResponse.json({ history: data });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
