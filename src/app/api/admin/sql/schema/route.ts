import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/auth';
import { requireSqlEditorAdmin } from '@/lib/sql-editor/auth';
import { queryDatabase, quoteIdentifier } from '@/lib/sql-editor/database';

export const runtime = 'nodejs';

const catalogQueries: Record<string, string> = {
  tables: `
    select n.nspname as schema_name, c.relname as name,
      case c.relkind when 'v' then 'VIEW' when 'm' then 'MATERIALIZED VIEW'
        when 'p' then 'PARTITIONED TABLE' else 'TABLE' end as kind,
      c.relrowsecurity as rls_enabled, greatest(c.reltuples::bigint, 0) as estimated_rows
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname not in ('information_schema')
      and n.nspname not like 'pg_%'
      and c.relkind in ('r', 'v', 'm', 'p')
    order by n.nspname, c.relname
  `,
  functions: `
    select n.nspname as schema_name, p.proname as name,
      pg_get_function_identity_arguments(p.oid) as arguments,
      pg_get_function_result(p.oid) as returns, p.prosecdef as security_definer
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname not in ('information_schema') and n.nspname not like 'pg_%'
    order by n.nspname, p.proname
  `,
  triggers: `
    select event_object_schema as schema_name, event_object_table as table_name,
      trigger_name as name, event_manipulation as event, action_timing as timing,
      action_statement as definition
    from information_schema.triggers
    where event_object_schema not in ('information_schema')
      and event_object_schema not like 'pg_%'
    order by event_object_schema, event_object_table, trigger_name
  `,
  enums: `
    select n.nspname as schema_name, t.typname as name,
      array_agg(e.enumlabel order by e.enumsortorder) as values
    from pg_type t join pg_enum e on e.enumtypid = t.oid
      join pg_namespace n on n.oid = t.typnamespace
    group by n.nspname, t.typname order by n.nspname, t.typname
  `,
  extensions: `
    select e.extname as name, e.extversion as version,
      n.nspname as schema_name, e.extrelocatable as relocatable
    from pg_extension e join pg_namespace n on n.oid = e.extnamespace
    order by e.extname
  `,
  policies: `
    select schemaname as schema_name, tablename as table_name, policyname as name,
      permissive, roles, cmd as command, qual as using_expression,
      with_check as check_expression
    from pg_policies order by schemaname, tablename, policyname
  `,
  migrations: `
    select version, name, statements
    from supabase_migrations.schema_migrations
    order by version desc limit 200
  `,
};

export async function GET(request: NextRequest) {
  try {
    await requireSqlEditorAdmin();
    const kind = request.nextUrl.searchParams.get('kind') ?? 'tables';
    if (!Object.hasOwn(catalogQueries, kind)) {
      return NextResponse.json({ error: 'Unknown database explorer section.' }, { status: 400 });
    }
    const { rows } = await queryDatabase(catalogQueries[kind]);

    const schema = request.nextUrl.searchParams.get('schema');
    const table = request.nextUrl.searchParams.get('table');
    if (kind !== 'tables' || !schema || !table) {
      return NextResponse.json({ kind, items: rows });
    }

    const [tableCheck, columns, indexes, policies] = await Promise.all([
      queryDatabase<{ relkind: string; rls_enabled: boolean }>(
        `select c.relkind, c.relrowsecurity as rls_enabled
         from pg_class c join pg_namespace n on n.oid = c.relnamespace
         where n.nspname = $1 and c.relname = $2 and c.relkind in ('r','v','m','p')`,
        [schema, table],
      ),
      queryDatabase(
        `select a.attname as name, format_type(a.atttypid, a.atttypmod) as data_type,
          not a.attnotnull as nullable, pg_get_expr(d.adbin, d.adrelid) as default_value,
          exists (
            select 1 from pg_constraint pk
            where pk.conrelid = c.oid and pk.contype = 'p'
              and a.attnum = any(pk.conkey)
          ) as is_primary_key
         from pg_class c join pg_namespace n on n.oid = c.relnamespace
          join pg_attribute a on a.attrelid = c.oid
          left join pg_attrdef d on d.adrelid = c.oid and d.adnum = a.attnum
         where n.nspname = $1 and c.relname = $2 and a.attnum > 0 and not a.attisdropped
         order by a.attnum`,
        [schema, table],
      ),
      queryDatabase(
        `select indexname, indexdef from pg_indexes
         where schemaname = $1 and tablename = $2 order by indexname`,
        [schema, table],
      ),
      queryDatabase(
        `select policyname, permissive, roles, cmd, qual, with_check
         from pg_policies where schemaname = $1 and tablename = $2
         order by policyname`,
        [schema, table],
      ),
    ]);
    if (!tableCheck.rowCount) return NextResponse.json({ error: 'Table not found.' }, { status: 404 });

    const foreignKeys = await queryDatabase(
      `select constraint_row.conname as name,
        source_column.attname as column_name,
        target_namespace.nspname as referenced_schema,
        target_table.relname as referenced_table,
        target_column.attname as referenced_column
       from pg_constraint constraint_row
       join pg_class source_table on source_table.oid = constraint_row.conrelid
       join pg_namespace source_namespace on source_namespace.oid = source_table.relnamespace
       join pg_class target_table on target_table.oid = constraint_row.confrelid
       join pg_namespace target_namespace on target_namespace.oid = target_table.relnamespace
       join lateral unnest(constraint_row.conkey) with ordinality source_key(attnum, ord) on true
       join lateral unnest(constraint_row.confkey) with ordinality target_key(attnum, ord)
         on target_key.ord = source_key.ord
       join pg_attribute source_column on source_column.attrelid = source_table.oid and source_column.attnum = source_key.attnum
       join pg_attribute target_column on target_column.attrelid = target_table.oid and target_column.attnum = target_key.attnum
       where constraint_row.contype = 'f' and source_namespace.nspname = $1 and source_table.relname = $2
       order by constraint_row.conname, source_key.ord`,
      [schema, table],
    );
    const relation = `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;
    const count = await queryDatabase<{ row_count: string }>(`select count(*)::text as row_count from ${relation}`);

    return NextResponse.json({
      kind,
      items: rows,
      detail: {
        schema,
        table,
        kind: tableCheck.rows[0].relkind,
        rlsEnabled: tableCheck.rows[0].rls_enabled,
        rowCount: count.rows[0]?.row_count ?? '0',
        columns: columns.rows,
        indexes: indexes.rows,
        policies: policies.rows,
        foreignKeys: foreignKeys.rows,
      },
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
