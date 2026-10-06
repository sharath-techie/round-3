create table public.admin_sql_query_history (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete cascade,
  query_text text not null,
  status text not null check (status in ('SUCCESS', 'ERROR')),
  command text,
  result_count bigint check (result_count >= 0),
  duration_ms integer not null check (duration_ms >= 0),
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.admin_saved_sql_queries (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  query_text text not null check (length(trim(query_text)) between 1 and 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (admin_id, name)
);

create index admin_sql_history_admin_created_idx
  on public.admin_sql_query_history (admin_id, created_at desc);
create index admin_sql_history_status_created_idx
  on public.admin_sql_query_history (status, created_at desc);
create index admin_saved_queries_admin_updated_idx
  on public.admin_saved_sql_queries (admin_id, updated_at desc);

alter table public.admin_sql_query_history enable row level security;
alter table public.admin_saved_sql_queries enable row level security;

create policy "Admins can read SQL execution history"
  on public.admin_sql_query_history for select to authenticated
  using (
    admin_id = (select auth.uid())
    and exists (
      select 1 from public.profiles admin
      where admin.id = (select auth.uid()) and admin.role = 'ADMIN'
    )
  );
create policy "Admins can append SQL execution history"
  on public.admin_sql_query_history for insert to authenticated
  with check (
    admin_id = (select auth.uid())
    and exists (
      select 1 from public.profiles admin
      where admin.id = (select auth.uid()) and admin.role = 'ADMIN'
    )
  );
create policy "SQL execution history is immutable"
  on public.admin_sql_query_history for update to authenticated using (false) with check (false);
create policy "SQL execution history cannot be deleted"
  on public.admin_sql_query_history for delete to authenticated using (false);

create policy "Admins can manage their saved queries"
  on public.admin_saved_sql_queries for all to authenticated
  using (
    admin_id = (select auth.uid())
    and exists (
      select 1 from public.profiles admin
      where admin.id = (select auth.uid()) and admin.role = 'ADMIN'
    )
  )
  with check (
    admin_id = (select auth.uid())
    and exists (
      select 1 from public.profiles admin
      where admin.id = (select auth.uid()) and admin.role = 'ADMIN'
    )
  );

grant select, insert, update, delete on public.admin_saved_sql_queries to authenticated;
grant select, insert on public.admin_sql_query_history to authenticated;

create or replace function public.record_sql_editor_access_denied()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_role text;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  select profile.role::text into actor_role
  from public.profiles profile
  where profile.id = actor_id;

  if actor_role = 'ADMIN' then
    raise exception 'This event is reserved for denied SQL editor access';
  end if;

  insert into public.audit_events (
    actor_id, action, resource_type, outcome, details, metadata
  ) values (
    actor_id,
    'SQL_EDITOR_ACCESS_DENIED',
    'admin_sql_editor',
    'DENIED',
    'Authenticated user attempted to access the administrator SQL editor.',
    jsonb_build_object('actor_role', actor_role)
  );
end;
$$;

revoke all on function public.record_sql_editor_access_denied() from public, anon;
grant execute on function public.record_sql_editor_access_denied() to authenticated;
