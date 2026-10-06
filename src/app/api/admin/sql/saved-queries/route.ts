import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiErrorResponse } from '@/lib/auth';
import { requireSqlEditorAdmin } from '@/lib/sql-editor/auth';
import { optionalText, readJsonBody, requireText } from '@/lib/http';

export async function GET() {
  try {
    const { supabase, actor } = await requireSqlEditorAdmin();
    const { data, error } = await supabase
      .from('admin_saved_sql_queries')
      .select('id, name, query_text, created_at, updated_at')
      .eq('admin_id', actor.id)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(`Saved queries could not be loaded: ${error.message}`);
    return NextResponse.json({ queries: data });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, actor } = await requireSqlEditorAdmin();
    const body = await readJsonBody(request);
    const name = requireText(body.name, 'name', 120);
    const queryText = requireText(body.query, 'query', 100_000);
    const { data, error } = await supabase
      .from('admin_saved_sql_queries')
      .insert({ admin_id: actor.id, name, query_text: queryText })
      .select('id, name, query_text, created_at, updated_at')
      .single();
    if (error) {
      if (error.code === '23505') throw new ApiError('A saved query with this name already exists.', 409);
      throw new Error(`Query could not be saved: ${error.message}`);
    }
    return NextResponse.json({ query: data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
