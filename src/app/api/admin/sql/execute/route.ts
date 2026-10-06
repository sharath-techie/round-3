import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiErrorResponse } from '@/lib/auth';
import { requireSqlEditorAdmin } from '@/lib/sql-editor/auth';
import { executeSql } from '@/lib/sql-editor/database';

export const runtime = 'nodejs';
export const maxDuration = 70;

const MAX_QUERY_LENGTH = 100_000;

function errorProperties(error: unknown) {
  if (!(error instanceof Error)) return { message: 'Database query failed.', code: null };
  const code = 'code' in error && typeof error.code === 'string' ? error.code : null;
  return { message: error.message, code };
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).origin !== request.nextUrl.origin) {
      throw new ApiError('Cross-origin SQL editor requests are not allowed.', 403);
    }
    const { supabase, actor } = await requireSqlEditorAdmin();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError('Request body must be valid JSON.', 400);
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new ApiError('Request body must be an object.', 400);
    }
    const query = (body as Record<string, unknown>).query;
    if (typeof query !== 'string' || !query.trim()) {
      throw new ApiError('Enter a SQL query to execute.', 400);
    }
    if (query.length > MAX_QUERY_LENGTH) {
      throw new ApiError(`SQL query cannot exceed ${MAX_QUERY_LENGTH.toLocaleString()} characters.`, 413);
    }

    const startedAt = Date.now();
    let execution: Awaited<ReturnType<typeof executeSql>> | null = null;
    let executionError: { message: string; code: string | null } | null = null;
    try {
      execution = await executeSql(query);
    } catch (error) {
      executionError = errorProperties(error);
    }
    const durationMs = Date.now() - startedAt;
    const status = execution ? 'SUCCESS' : 'ERROR';
    const commands = execution?.statements.map((statement) => statement.command).filter(Boolean) ?? [];
    const resultCount = execution?.rowCount ?? 0;
    const { data: history, error: historyError } = await supabase
      .from('admin_sql_query_history')
      .insert({
        admin_id: actor.id,
        query_text: query,
        status,
        command: commands.join(', ') || null,
        result_count: resultCount,
        duration_ms: durationMs,
        error_message: executionError?.message ?? null,
        metadata: {
          statement_count: execution?.statements.length ?? 0,
          statements: execution?.statements.map(({ command, rowCount, truncated }) => ({ command, rowCount, truncated })) ?? [],
          error_code: executionError?.code ?? null,
        },
      })
      .select('id')
      .maybeSingle();

    if (historyError) {
      console.error('SQL editor execution history could not be stored:', {
        adminId: actor.id,
        status,
        error: historyError.message,
      });
    }

    return NextResponse.json({
      status,
      command: execution?.command ?? null,
      rowCount: resultCount,
      statements: execution?.statements ?? [],
      durationMs,
      error: executionError,
      historyId: history?.id ?? null,
      historyPersisted: !historyError,
      warning: historyError
        ? `The SQL was ${status === 'SUCCESS' ? 'executed' : 'rejected'}, but its history entry could not be saved: ${historyError.message}`
        : null,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
