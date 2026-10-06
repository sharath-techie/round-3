import 'server-only';
import { Client } from 'pg';
import { SqlEditorConfigurationError } from '@/lib/sql-editor/errors';

const MAX_ROWS = 500;

export interface SqlStatementResult {
  command: string | null;
  rowCount: number | null;
  rows: Record<string, unknown>[];
  truncated: boolean;
}

export interface SqlExecutionResult {
  statements: SqlStatementResult[];
  command: string | null;
  rowCount: number;
}

export function createSqlEditorClient() {
  const connectionString = process.env.GARDENIA_SQL_EDITOR_DATABASE_URL;
  if (!connectionString) {
    throw new SqlEditorConfigurationError('The SQL editor database connection is not configured. Set GARDENIA_SQL_EDITOR_DATABASE_URL in the server environment.');
  }
  let protocol: string;
  try {
    protocol = new URL(connectionString).protocol;
  } catch {
    throw new SqlEditorConfigurationError('GARDENIA_SQL_EDITOR_DATABASE_URL must be a valid PostgreSQL connection URL.');
  }
  if (protocol !== 'postgres:' && protocol !== 'postgresql:') {
    throw new SqlEditorConfigurationError('GARDENIA_SQL_EDITOR_DATABASE_URL must use the postgres or postgresql protocol.');
  }

  return new Client({
    connectionString,
    ssl: { rejectUnauthorized: true },
    connectionTimeoutMillis: 10_000,
    query_timeout: 60_000,
    statement_timeout: 60_000,
    application_name: 'gardenia-admin-sql-editor',
  });
}

function normalizeResult(result: {
  command?: string;
  rowCount: number | null;
  rows: Record<string, unknown>[];
}): SqlStatementResult {
  return {
    command: result.command ?? null,
    rowCount: result.rowCount,
    rows: result.rows.slice(0, MAX_ROWS),
    truncated: result.rows.length > MAX_ROWS,
  };
}

export async function executeSql(query: string): Promise<SqlExecutionResult> {
  const client = createSqlEditorClient();
  await client.connect();
  try {
    const result = await client.query(query);
    const rawResults = Array.isArray(result) ? result : [result];
    const statements = rawResults.map(normalizeResult);
    return {
      statements,
      command: statements.at(-1)?.command ?? null,
      rowCount: statements.reduce((total, statement) => total + (statement.rowCount ?? 0), 0),
    };
  } finally {
    await client.end();
  }
}

export async function queryDatabase<T extends Record<string, unknown>>(
  query: string,
  values: unknown[] = [],
) {
  const client = createSqlEditorClient();
  await client.connect();
  try {
    return await client.query<T>(query, values);
  } finally {
    await client.end();
  }
}

export function quoteIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}
