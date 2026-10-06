create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum ('STUDENT', 'RESEARCHER', 'MENTOR', 'SPONSOR', 'ADMIN');
create type public.organization_type as enum ('COMPANY', 'ACADEMIC', 'FOUNDATION');
create type public.organization_member_role as enum ('OWNER', 'ADMIN', 'MEMBER');
create type public.verification_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type public.problem_status as enum ('DRAFT', 'OPEN', 'UNDER_REVIEW', 'ASSIGNED', 'CLOSED');
create type public.project_status as enum ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'SUSPENDED', 'ARCHIVED');
create type public.membership_status as enum ('INVITED', 'ACTIVE', 'SUSPENDED', 'LEFT');
create type public.access_request_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
create type public.task_status as enum ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE');
create type public.project_document_type as enum ('RESEARCH', 'IMPLEMENTATION', 'EXPERIMENT_NOTES', 'CHARTER_NOTE');
create type public.contribution_status as enum ('SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'DISPUTED');
create type public.review_decision as enum ('APPROVE', 'REQUEST_CHANGES', 'REJECT', 'ESCALATE_DISPUTE');
create type public.evidence_type as enum ('RESEARCH_FINDING', 'EXPERIMENT', 'IMPLEMENTATION', 'DOCUMENTATION', 'DATASET', 'ANALYSIS', 'REVIEW', 'OTHER');
create type public.skill_verification_status as enum ('PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'STUDENT',
  institution text,
  bio text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.organization_type not null,
  registration_number text,
  country text,
  verification_status public.verification_status not null default 'PENDING',
  verified_at timestamptz,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.organization_member_role not null default 'MEMBER',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.organization_verifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  document_path text not null,
  status public.verification_status not null default 'PENDING',
  submitted_by uuid not null references public.profiles (id),
  reviewed_by uuid references public.profiles (id),
  review_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create unique index organization_verifications_one_pending_per_org
  on public.organization_verifications (organization_id)
  where status = 'PENDING';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'organization-verification',
  'organization-verification',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table public.research_problems (
  id uuid primary key default gen_random_uuid(),
  sponsor_organization_id uuid not null references public.organizations (id),
  sponsor_user_id uuid not null references public.profiles (id),
  title text not null,
  summary text not null,
  problem_statement text not null,
  domain text not null,
  status public.problem_status not null default 'DRAFT',
  access_terms jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  research_problem_id uuid references public.research_problems (id),
  sponsor_organization_id uuid references public.organizations (id),
  sponsor_user_id uuid not null references public.profiles (id),
  lead_researcher_id uuid references public.profiles (id),
  title text not null,
  objective text not null,
  status public.project_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_charters (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  version integer not null check (version > 0),
  charter jsonb not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (project_id, version)
);

create table public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.app_role not null,
  status public.membership_status not null default 'INVITED',
  invited_by uuid references public.profiles (id),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table public.project_access_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  requester_id uuid not null references public.profiles (id),
  resource_key text not null default 'overview',
  reason text not null,
  status public.access_request_status not null default 'PENDING',
  decided_by uuid references public.profiles (id),
  decision_notes text,
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (project_id, requester_id, resource_key, status)
);

create table public.project_access_grants (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  resource_key text not null,
  granted_by uuid not null references public.profiles (id),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (project_id, user_id, resource_key)
);

create table public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text not null default '',
  due_at timestamptz,
  status text not null default 'PENDING',
  created_at timestamptz not null default now()
);

create table public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  milestone_id uuid references public.project_milestones (id) on delete set null,
  title text not null,
  description text not null default '',
  assigned_to uuid references public.profiles (id),
  status public.task_status not null default 'TODO',
  required_skills text[] not null default '{}',
  required_evidence public.evidence_type[] not null default '{}',
  due_at timestamptz,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  task_id uuid references public.project_tasks (id) on delete set null,
  type public.project_document_type not null,
  resource_key text not null,
  title text not null,
  body text,
  object_path text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_name text not null,
  claimed_at timestamptz not null default now(),
  unique (user_id, skill_name)
);

create table public.skill_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_name text not null,
  status public.skill_verification_status not null default 'PENDING',
  assessment_id text,
  score numeric(5, 2) check (score between 0 and 100),
  evidence_summary text,
  reviewed_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  task_id uuid references public.project_tasks (id) on delete set null,
  created_by uuid not null references public.profiles (id),
  title text not null,
  hypothesis text not null,
  methodology text not null,
  parameters jsonb not null default '{}'::jsonb,
  status text not null default 'DRAFT',
  created_at timestamptz not null default now()
);

create table public.experiment_runs (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.experiments (id) on delete cascade,
  executed_by uuid not null references public.profiles (id),
  status text not null,
  metrics jsonb not null default '{}'::jsonb,
  logs_path text,
  artifact_path text,
  created_at timestamptz not null default now()
);

create table public.ai_provenance (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  task_id uuid references public.project_tasks (id) on delete set null,
  user_id uuid not null references public.profiles (id),
  agent_id text not null,
  action text not null,
  prompt_hash text not null,
  output_hash text,
  tools_used text[] not null default '{}',
  charter_version integer not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  task_id uuid references public.project_tasks (id) on delete set null,
  author_id uuid not null references public.profiles (id),
  title text not null,
  summary text not null,
  artifact_path text,
  status public.contribution_status not null default 'SUBMITTED',
  credits_requested integer not null default 0 check (credits_requested >= 0),
  credits_awarded integer check (credits_awarded >= 0),
  ai_provenance_id uuid references public.ai_provenance (id) on delete set null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  contribution_id uuid references public.contributions (id) on delete cascade,
  task_id uuid references public.project_tasks (id) on delete set null,
  submitted_by uuid not null references public.profiles (id),
  type public.evidence_type not null,
  title text not null,
  description text not null default '',
  object_path text,
  content_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.contribution_reviews (
  id uuid primary key default gen_random_uuid(),
  contribution_id uuid not null references public.contributions (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id),
  decision public.review_decision not null,
  methodology_score integer check (methodology_score between 1 and 10),
  reproducibility_score integer check (reproducibility_score between 1 and 10),
  charter_compliant boolean not null,
  comments text not null,
  credits_awarded integer check (credits_awarded >= 0),
  created_at timestamptz not null default now()
);

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id),
  contribution_id uuid not null references public.contributions (id),
  user_id uuid not null references public.profiles (id),
  amount integer not null check (amount > 0),
  reason text not null,
  approved_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (contribution_id)
);

create table public.contribution_ledger (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects (id),
  contribution_id uuid not null unique references public.contributions (id),
  previous_hash text not null,
  entry_hash text not null unique,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id),
  project_id uuid references public.projects (id),
  action text not null,
  resource_type text not null,
  resource_id text,
  outcome text not null check (outcome in ('SUCCESS', 'DENIED', 'ERROR')),
  details text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index projects_sponsor_idx on public.projects (sponsor_user_id, status);
create index project_members_user_status_idx on public.project_members (user_id, status);
create index access_requests_project_status_idx on public.project_access_requests (project_id, status);
create index tasks_assigned_status_idx on public.project_tasks (assigned_to, status);
create index contributions_project_status_idx on public.contributions (project_id, status);
create index evidence_contribution_idx on public.evidence (contribution_id);
create index audit_events_project_created_idx on public.audit_events (project_id, created_at desc);
create index notifications_user_created_idx on public.notifications (user_id, created_at desc);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.add_organization_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.organization_members (organization_id, user_id, role)
  values (new.id, new.created_by, 'OWNER');
  return new;
end;
$$;

create trigger on_organization_created
  after insert on public.organizations
  for each row execute function public.add_organization_owner();

create or replace function public.can_access_project(p_project_id uuid, p_resource_key text default 'overview')
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = p_project_id
      and (
        (
          p.sponsor_user_id = (select auth.uid())
          and p_resource_key in ('overview', 'charter', 'reports', 'milestones', 'contributions', 'activity')
        )
        or p.lead_researcher_id = (select auth.uid())
        or exists (
          select 1 from public.profiles admin
          where admin.id = (select auth.uid()) and admin.role = 'ADMIN'
        )
        or exists (
          select 1
          from public.project_members member
          where member.project_id = p.id
            and member.user_id = (select auth.uid())
            and member.status = 'ACTIVE'
            and (
              p_resource_key = 'overview'
              or member.role = 'SPONSOR' and p_resource_key in ('charter', 'reports', 'milestones', 'contributions', 'activity')
              or exists (
                select 1 from public.project_access_grants grant_row
                where grant_row.project_id = p.id
                  and grant_row.user_id = (select auth.uid())
                  and (
                    grant_row.resource_key = p_resource_key
                    or grant_row.resource_key = '*'
                    or (grant_row.resource_key = 'contributions' and p_resource_key like 'contribution:%')
                  )
                  and grant_row.revoked_at is null
                  and (grant_row.expires_at is null or grant_row.expires_at > now())
              )
              or exists (
                select 1 from public.project_tasks task
                where task.project_id = p.id
                  and task.assigned_to = (select auth.uid())
                  and p_resource_key = 'task:' || task.id::text
              )
            )
        )
      )
  );
$$;

create or replace function public.can_manage_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id
      and (
        p.sponsor_user_id = (select auth.uid())
        or p.lead_researcher_id = (select auth.uid())
        or exists (
          select 1 from public.profiles admin
          where admin.id = (select auth.uid()) and admin.role = 'ADMIN'
        )
      )
  );
$$;

create or replace function public.is_organization_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members member
    where member.organization_id = p_organization_id
      and member.user_id = (select auth.uid())
  );
$$;

create or replace function public.can_manage_organization(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members member
    where member.organization_id = p_organization_id
      and member.user_id = (select auth.uid())
      and member.role in ('OWNER', 'ADMIN')
  );
$$;

create or replace function public.can_view_profile(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_profile_id = (select auth.uid())
    or exists (
      select 1 from public.profiles admin
      where admin.id = (select auth.uid()) and admin.role = 'ADMIN'
    )
    or exists (
      select 1
      from public.project_members viewer
      join public.project_members subject on subject.project_id = viewer.project_id
      where viewer.user_id = (select auth.uid())
        and subject.user_id = p_profile_id
        and viewer.status = 'ACTIVE'
        and subject.status = 'ACTIVE'
        and public.can_access_project(viewer.project_id, 'team')
    )
    or exists (
      select 1
      from public.project_access_requests request_row
      where request_row.requester_id = p_profile_id
        and (
          request_row.requester_id = (select auth.uid())
          or public.can_manage_project(request_row.project_id)
          or exists (
            select 1 from public.project_members mentor
            where mentor.project_id = request_row.project_id
              and mentor.user_id = (select auth.uid())
              and mentor.role = 'MENTOR'
              and mentor.status = 'ACTIVE'
          )
        )
    );
$$;

create or replace function public.get_ai_charter(p_project_id uuid)
returns table (version integer, charter jsonb)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null
    or not public.can_access_project(p_project_id, 'ai-workspace') then
    raise exception 'AI workspace access is required';
  end if;

  return query
  select charter_row.version, charter_row.charter
  from public.project_charters charter_row
  where charter_row.project_id = p_project_id
  order by charter_row.version desc
  limit 1;
end;
$$;

create or replace function public.list_open_task_opportunities(p_project_id uuid default null)
returns table (
  task_id uuid,
  project_id uuid,
  project_title text,
  task_title text,
  task_description text,
  required_skills text[],
  due_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select task.id, project.id, project.title, task.title, task.description, task.required_skills, task.due_at
  from public.project_tasks task
  join public.projects project on project.id = task.project_id
  join public.research_problems problem on problem.id = project.research_problem_id
  where (p_project_id is null or project.id = p_project_id)
    and project.status = 'ACTIVE'
    and problem.status in ('OPEN', 'ASSIGNED')
    and task.status = 'TODO'
    and task.assigned_to is null
    and exists (
      select 1 from public.profiles profile
      where profile.id = (select auth.uid()) and profile.role in ('STUDENT', 'RESEARCHER')
    );
$$;

create or replace function public.review_contribution(
  p_contribution_id uuid,
  p_decision public.review_decision,
  p_methodology_score integer,
  p_reproducibility_score integer,
  p_charter_compliant boolean,
  p_comments text,
  p_credits_awarded integer default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  contribution_row public.contributions%rowtype;
  reviewer_role public.app_role;
  review_id uuid;
  previous_entry public.contribution_ledger%rowtype;
  ledger_payload jsonb;
  next_hash text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if p_methodology_score not between 1 and 10
    or p_reproducibility_score not between 1 and 10
    or length(trim(coalesce(p_comments, ''))) < 3 then
    raise exception 'Review scores and comments are invalid';
  end if;

  select role into reviewer_role from public.profiles where id = (select auth.uid());
  if reviewer_role not in ('MENTOR', 'RESEARCHER', 'ADMIN') then
    raise exception 'Reviewer role is not authorized';
  end if;

  select * into contribution_row
  from public.contributions
  where id = p_contribution_id
  for update;

  if not found then
    raise exception 'Contribution not found';
  end if;
  if not public.can_access_project(contribution_row.project_id, 'contribution:' || p_contribution_id::text) then
    raise exception 'Reviewer does not have project access';
  end if;
  if contribution_row.author_id = (select auth.uid()) then
    raise exception 'Contributors cannot review their own submissions';
  end if;
  if contribution_row.status not in ('SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED') then
    raise exception 'Contribution is not reviewable';
  end if;
  if p_decision = 'APPROVE' and not p_charter_compliant then
    raise exception 'A contribution that fails charter compliance cannot be approved';
  end if;
  if p_decision = 'APPROVE'
    and (p_credits_awarded is null or p_credits_awarded < 0
      or p_credits_awarded > contribution_row.credits_requested) then
    raise exception 'Award must be provided and cannot exceed credits requested';
  end if;

  insert into public.contribution_reviews (
    contribution_id, reviewer_id, decision, methodology_score,
    reproducibility_score, charter_compliant, comments, credits_awarded
  ) values (
    p_contribution_id, (select auth.uid()), p_decision, p_methodology_score,
    p_reproducibility_score, p_charter_compliant, trim(p_comments),
    case when p_decision = 'APPROVE' then p_credits_awarded else null end
  ) returning id into review_id;

  update public.contributions
  set status = case p_decision
        when 'APPROVE' then 'APPROVED'::public.contribution_status
        when 'REQUEST_CHANGES' then 'CHANGES_REQUESTED'::public.contribution_status
        when 'REJECT' then 'REJECTED'::public.contribution_status
        else 'DISPUTED'::public.contribution_status
      end,
      credits_awarded = case when p_decision = 'APPROVE' then p_credits_awarded else null end,
      updated_at = now()
  where id = p_contribution_id;

  if p_decision = 'APPROVE' then
    if p_credits_awarded > 0 then
      insert into public.credit_ledger (
        project_id, contribution_id, user_id, amount, reason, approved_by
      ) values (
        contribution_row.project_id, contribution_row.id, contribution_row.author_id,
        p_credits_awarded, trim(p_comments), (select auth.uid())
      );
    end if;

    perform pg_catalog.pg_advisory_xact_lock(902106060001);

    select * into previous_entry
    from public.contribution_ledger
    order by id desc
    limit 1;

    ledger_payload := jsonb_build_object(
      'project_id', contribution_row.project_id,
      'contribution_id', contribution_row.id,
      'author_id', contribution_row.author_id,
      'review_id', review_id,
      'credits_awarded', p_credits_awarded,
      'approved_by', (select auth.uid())
    );
    next_hash := encode(
      extensions.digest(
        convert_to(
          coalesce(previous_entry.entry_hash, repeat('0', 64)) || ledger_payload::text,
          'UTF8'
        ),
        'sha256'
      ),
      'hex'
    );

    insert into public.contribution_ledger (
      project_id, contribution_id, previous_hash, entry_hash, payload
    ) values (
      contribution_row.project_id, contribution_row.id,
      coalesce(previous_entry.entry_hash, repeat('0', 64)), next_hash, ledger_payload
    );
  end if;

  insert into public.audit_events (
    actor_id, project_id, action, resource_type, resource_id, outcome, details, metadata
  ) values (
    (select auth.uid()), contribution_row.project_id, 'CONTRIBUTION_REVIEWED',
    'contribution', contribution_row.id::text, 'SUCCESS', trim(p_comments),
    jsonb_build_object('decision', p_decision, 'review_id', review_id, 'credits_awarded', p_credits_awarded)
  );

  return review_id;
end;
$$;

create or replace function public.submit_contribution(
  p_project_id uuid,
  p_task_id uuid,
  p_title text,
  p_summary text,
  p_artifact_path text,
  p_credits_requested integer,
  p_ai_provenance_id uuid,
  p_evidence jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role public.app_role;
  contribution_id uuid;
  evidence_row jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if length(trim(coalesce(p_title, ''))) = 0
    or length(trim(coalesce(p_summary, ''))) = 0
    or p_credits_requested < 0
    or jsonb_typeof(coalesce(p_evidence, '[]'::jsonb)) <> 'array'
    or jsonb_array_length(coalesce(p_evidence, '[]'::jsonb)) = 0 then
    raise exception 'Contribution details and at least one evidence item are required';
  end if;

  select role into actor_role from public.profiles where id = (select auth.uid());
  if actor_role not in ('STUDENT', 'RESEARCHER') then
    raise exception 'Only researchers and student contributors may submit contributions';
  end if;
  if p_task_id is not null and not exists (
    select 1 from public.project_tasks task
    where task.id = p_task_id and task.project_id = p_project_id
      and (
        task.assigned_to = (select auth.uid())
        or (actor_role = 'RESEARCHER' and public.can_manage_project(p_project_id))
      )
  ) then
    raise exception 'Task is unavailable or is not assigned to this contributor';
  end if;
  if actor_role = 'STUDENT' and p_task_id is null then
    raise exception 'Student contributors must submit work against an assigned task';
  end if;
  if not public.can_access_project(p_project_id, 'research')
    and (p_task_id is null or not exists (
      select 1 from public.project_tasks task
      where task.id = p_task_id
        and task.project_id = p_project_id
        and task.assigned_to = (select auth.uid())
    )) then
    raise exception 'Project research access or an assigned task is required';
  end if;
  if p_ai_provenance_id is not null and not exists (
    select 1 from public.ai_provenance provenance
    where provenance.id = p_ai_provenance_id
      and provenance.project_id = p_project_id
      and provenance.user_id = (select auth.uid())
  ) then
    raise exception 'AI provenance does not belong to this user and project';
  end if;

  insert into public.contributions (
    project_id, task_id, author_id, title, summary, artifact_path,
    credits_requested, ai_provenance_id
  ) values (
    p_project_id, p_task_id, (select auth.uid()), trim(p_title), trim(p_summary),
    nullif(trim(coalesce(p_artifact_path, '')), ''), p_credits_requested, p_ai_provenance_id
  ) returning id into contribution_id;

  for evidence_row in select value from jsonb_array_elements(p_evidence)
  loop
    insert into public.evidence (
      project_id, contribution_id, task_id, submitted_by, type, title,
      description, object_path, content_hash, metadata
    ) values (
      p_project_id, contribution_id, p_task_id, (select auth.uid()),
      (evidence_row ->> 'type')::public.evidence_type,
      trim(evidence_row ->> 'title'),
      coalesce(evidence_row ->> 'description', ''),
      nullif(trim(coalesce(evidence_row ->> 'objectPath', '')), ''),
      nullif(trim(coalesce(evidence_row ->> 'contentHash', '')), ''),
      coalesce(evidence_row -> 'metadata', '{}'::jsonb)
    );
  end loop;

  insert into public.audit_events (
    actor_id, project_id, action, resource_type, resource_id, outcome, details, metadata
  ) values (
    (select auth.uid()), p_project_id, 'CONTRIBUTION_SUBMITTED',
    'contribution', contribution_id::text, 'SUCCESS', 'Contribution submitted for human review.',
    jsonb_build_object('task_id', p_task_id, 'evidence_count', jsonb_array_length(p_evidence))
  );
  return contribution_id;
end;
$$;

create or replace function public.create_sponsored_project(
  p_organization_id uuid,
  p_title text,
  p_objective text,
  p_research_problem_id uuid,
  p_charter jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  project_id uuid;
  charter_version integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if not exists (
    select 1 from public.profiles profile
    where profile.id = (select auth.uid()) and profile.role in ('SPONSOR', 'ADMIN')
  ) then
    raise exception 'Only verified sponsor accounts can create projects';
  end if;
  if length(trim(coalesce(p_title, ''))) = 0 or length(trim(coalesce(p_objective, ''))) = 0
    or jsonb_typeof(p_charter) <> 'object' then
    raise exception 'Project title, objective, and charter are required';
  end if;
  if not exists (
    select 1 from public.organizations org
    join public.organization_members member on member.organization_id = org.id
    where org.id = p_organization_id
      and org.verification_status = 'APPROVED'
      and member.user_id = (select auth.uid())
      and member.role in ('OWNER', 'ADMIN')
  ) then
    raise exception 'A verified organization membership is required';
  end if;
  if p_research_problem_id is not null and not exists (
    select 1 from public.research_problems problem
    where problem.id = p_research_problem_id
      and problem.sponsor_user_id = (select auth.uid())
      and problem.sponsor_organization_id = p_organization_id
      and problem.status in ('DRAFT', 'OPEN')
  ) then
    raise exception 'Research problem is unavailable';
  end if;

  insert into public.projects (
    research_problem_id, sponsor_organization_id, sponsor_user_id,
    title, objective, status
  ) values (
    p_research_problem_id, p_organization_id, (select auth.uid()),
    trim(p_title), trim(p_objective), 'DRAFT'
  ) returning id into project_id;

  insert into public.project_charters (project_id, version, charter, created_by)
  values (project_id, 1, p_charter, (select auth.uid()));

  insert into public.project_members (project_id, user_id, role, status, invited_by, joined_at)
  values (project_id, (select auth.uid()), 'SPONSOR', 'ACTIVE', (select auth.uid()), now());

  insert into public.audit_events (
    actor_id, project_id, action, resource_type, resource_id, outcome, details
  ) values (
    (select auth.uid()), project_id, 'PROJECT_CREATED', 'project', project_id::text,
    'SUCCESS', 'Sponsor created a project and its initial charter.'
  );
  return project_id;
end;
$$;

create or replace function public.decide_organization_verification(
  p_verification_id uuid,
  p_decision public.verification_status,
  p_review_notes text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  verification_row public.organization_verifications%rowtype;
begin
  if (select auth.uid()) is null
    or not exists (
      select 1 from public.profiles admin
      where admin.id = (select auth.uid()) and admin.role = 'ADMIN'
    ) then
    raise exception 'Administrator access is required';
  end if;
  if p_decision not in ('APPROVED', 'REJECTED') then
    raise exception 'Verification decision must be APPROVED or REJECTED';
  end if;

  select * into verification_row
  from public.organization_verifications
  where id = p_verification_id
  for update;
  if not found or verification_row.status <> 'PENDING' then
    raise exception 'Pending organization verification not found';
  end if;

  update public.organization_verifications
  set status = p_decision,
      reviewed_by = (select auth.uid()),
      review_notes = nullif(trim(coalesce(p_review_notes, '')), ''),
      reviewed_at = now()
  where id = p_verification_id;

  update public.organizations
  set verification_status = p_decision,
      verified_at = case when p_decision = 'APPROVED' then now() else null end,
      updated_at = now()
  where id = verification_row.organization_id;

  insert into public.audit_events (
    actor_id, action, resource_type, resource_id, outcome, details, metadata
  ) values (
    (select auth.uid()), 'ORGANIZATION_VERIFICATION_DECIDED',
    'organization_verification', p_verification_id::text, 'SUCCESS',
    coalesce(nullif(trim(p_review_notes), ''), 'Organization verification decision recorded.'),
    jsonb_build_object('organization_id', verification_row.organization_id, 'decision', p_decision)
  );
end;
$$;

create or replace function public.admin_assign_role(
  p_user_id uuid,
  p_role public.app_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous_role public.app_role;
begin
  if (select auth.uid()) is null
    or not exists (
      select 1 from public.profiles admin
      where admin.id = (select auth.uid()) and admin.role = 'ADMIN'
    ) then
    raise exception 'Administrator access is required';
  end if;

  select role into previous_role
  from public.profiles
  where id = p_user_id
  for update;
  if not found then
    raise exception 'User profile not found';
  end if;
  if previous_role = p_role then
    return;
  end if;

  update public.profiles set role = p_role, updated_at = now() where id = p_user_id;
  insert into public.audit_events (
    actor_id, action, resource_type, resource_id, outcome, details, metadata
  ) values (
    (select auth.uid()), 'USER_ROLE_CHANGED', 'profile', p_user_id::text, 'SUCCESS',
    'Administrator changed the platform role.',
    jsonb_build_object('previous_role', previous_role, 'new_role', p_role)
  );
end;
$$;

create or replace function public.decide_project_access_request(
  p_request_id uuid,
  p_decision public.access_request_status,
  p_decision_notes text default '',
  p_expires_at timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.project_access_requests%rowtype;
  requester_role public.app_role;
  approver_role public.app_role;
  can_decide boolean;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if p_decision not in ('APPROVED', 'REJECTED', 'EXPIRED') then
    raise exception 'Invalid access request decision';
  end if;

  select * into request_row
  from public.project_access_requests
  where id = p_request_id
  for update;
  if not found or request_row.status <> 'PENDING' then
    raise exception 'Pending access request not found';
  end if;

  select role into requester_role from public.profiles where id = request_row.requester_id;
  select role into approver_role from public.profiles where id = (select auth.uid());
  select (
    approver_role = 'ADMIN'
    or (requester_role = 'RESEARCHER' and exists (
      select 1 from public.projects project
      where project.id = request_row.project_id and project.sponsor_user_id = (select auth.uid())
    ))
    or (requester_role in ('MENTOR', 'STUDENT') and exists (
      select 1 from public.projects project
      where project.id = request_row.project_id and project.lead_researcher_id = (select auth.uid())
    ))
    or (requester_role = 'STUDENT' and exists (
      select 1 from public.project_members mentor
      where mentor.project_id = request_row.project_id
        and mentor.user_id = (select auth.uid())
        and mentor.role = 'MENTOR'
        and mentor.status = 'ACTIVE'
    ))
  ) into can_decide;
  if not coalesce(can_decide, false) then
    raise exception 'This role is not authorized to decide the request';
  end if;
  if requester_role = 'RESEARCHER' and request_row.resource_key <> 'research' then
    raise exception 'Researcher access must be requested for the research-lead scope';
  end if;
  if requester_role = 'MENTOR' and request_row.resource_key not in (
    'overview', 'charter', 'research', 'team', 'ai-workspace',
    'contributions', 'activity', 'reports', 'milestones'
  ) then
    raise exception 'Mentor access request scope is invalid';
  end if;

  update public.project_access_requests
  set status = p_decision,
      decided_by = (select auth.uid()),
      decision_notes = nullif(trim(coalesce(p_decision_notes, '')), ''),
      decided_at = now()
  where id = p_request_id;

  if p_decision = 'APPROVED' then
    if requester_role = 'STUDENT' then
      if request_row.resource_key not like 'application:%' then
        raise exception 'Student approval must be scoped to a task application';
      end if;
      update public.project_tasks
      set assigned_to = request_row.requester_id,
          status = case when status = 'TODO' then 'IN_PROGRESS'::public.task_status else status end,
          updated_at = now()
      where id = substring(request_row.resource_key from length('application:') + 1)::uuid
        and project_id = request_row.project_id
        and (assigned_to is null or assigned_to = request_row.requester_id);
      if not found then
        raise exception 'Task is no longer available for assignment';
      end if;
    end if;

    insert into public.project_members (project_id, user_id, role, status, invited_by, joined_at)
    values (
      request_row.project_id, request_row.requester_id, requester_role, 'ACTIVE',
      (select auth.uid()), now()
    )
    on conflict (project_id, user_id)
    do update set role = excluded.role, status = 'ACTIVE', invited_by = excluded.invited_by, joined_at = excluded.joined_at;

    insert into public.project_access_grants (
      project_id, user_id, resource_key, granted_by, expires_at
    ) values (
      request_row.project_id,
      request_row.requester_id,
      case
        when requester_role = 'STUDENT' then 'task:' || substring(request_row.resource_key from length('application:') + 1)
        when requester_role = 'RESEARCHER' then 'research'
        else request_row.resource_key
      end,
      (select auth.uid()), p_expires_at
    )
    on conflict (project_id, user_id, resource_key)
    do update set granted_by = excluded.granted_by, expires_at = excluded.expires_at, revoked_at = null;

    if requester_role = 'RESEARCHER' then
      update public.projects
      set lead_researcher_id = request_row.requester_id, status = 'ACTIVE', updated_at = now()
      where id = request_row.project_id and lead_researcher_id is null;
    end if;
  end if;

  insert into public.audit_events (
    actor_id, project_id, action, resource_type, resource_id, outcome, details, metadata
  ) values (
    (select auth.uid()), request_row.project_id, 'PROJECT_ACCESS_DECIDED',
    'project_access_request', request_row.id::text, 'SUCCESS',
    coalesce(nullif(trim(p_decision_notes), ''), 'Project access request decision recorded.'),
    jsonb_build_object('decision', p_decision, 'requester_id', request_row.requester_id, 'resource_key', request_row.resource_key)
  );
end;
$$;

create or replace function public.prevent_immutable_record_changes()
returns trigger
language plpgsql
as $$
begin
  raise exception 'This record is append-only';
end;
$$;

create trigger contribution_ledger_is_append_only
  before update or delete on public.contribution_ledger
  for each row execute function public.prevent_immutable_record_changes();
create trigger credit_ledger_is_append_only
  before update or delete on public.credit_ledger
  for each row execute function public.prevent_immutable_record_changes();
create trigger audit_events_are_append_only
  before update or delete on public.audit_events
  for each row execute function public.prevent_immutable_record_changes();

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_verifications enable row level security;
alter table public.research_problems enable row level security;
alter table public.projects enable row level security;
alter table public.project_charters enable row level security;
alter table public.project_members enable row level security;
alter table public.project_access_requests enable row level security;
alter table public.project_access_grants enable row level security;
alter table public.project_documents enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_tasks enable row level security;
alter table public.user_skills enable row level security;
alter table public.skill_verifications enable row level security;
alter table public.experiments enable row level security;
alter table public.experiment_runs enable row level security;
alter table public.ai_provenance enable row level security;
alter table public.contributions enable row level security;
alter table public.evidence enable row level security;
alter table public.contribution_reviews enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.contribution_ledger enable row level security;
alter table public.audit_events enable row level security;
alter table public.notifications enable row level security;

create policy "Profiles are visible to their owner and admins"
  on public.profiles for select to authenticated
  using (public.can_view_profile(id));
create policy "Users can update their own non-role profile fields"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Organization members can view their organizations"
  on public.organizations for select to authenticated
  using (public.is_organization_member(id) or exists (
    select 1 from public.profiles admin
    where admin.id = (select auth.uid()) and admin.role = 'ADMIN'
  ));
create policy "Authenticated users can create organizations for themselves"
  on public.organizations for insert to authenticated
  with check (created_by = (select auth.uid()) and verification_status = 'PENDING' and verified_at is null);
create policy "Organization owners and admins can update organization details"
  on public.organizations for update to authenticated
  using (public.can_manage_organization(id))
  with check (verification_status = 'PENDING' and verified_at is null);
create policy "Organization membership is visible to organization members"
  on public.organization_members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_organization_member(organization_id));
create policy "Organization owners can add members"
  on public.organization_members for insert to authenticated
  with check (public.can_manage_organization(organization_id) and role = 'MEMBER');
create policy "Verification records are visible to organization members and admins"
  on public.organization_verifications for select to authenticated
  using (submitted_by = (select auth.uid()) or public.can_manage_organization(organization_id) or exists (
    select 1 from public.profiles admin
    where admin.id = (select auth.uid()) and admin.role = 'ADMIN'
  ));
create policy "Organization members can submit verification documents"
  on public.organization_verifications for insert to authenticated
  with check (
    submitted_by = (select auth.uid())
    and status = 'PENDING'
    and reviewed_by is null
    and public.can_manage_organization(organization_id)
    and exists (
      select 1 from public.organizations organization
      where organization.id = organization_id
        and organization.verification_status in ('PENDING', 'REJECTED')
    )
    and exists (
      select 1 from storage.objects object
      where object.bucket_id = 'organization-verification'
        and object.name = document_path
    )
  );
create policy "Only admins can decide organization verification"
  on public.organization_verifications for update to authenticated using (false) with check (false);

create policy "Open problems are discoverable; private problems are restricted"
  on public.research_problems for select to authenticated
  using (
    status = 'OPEN'
    or sponsor_user_id = (select auth.uid())
    or exists (select 1 from public.profiles admin where admin.id = (select auth.uid()) and admin.role = 'ADMIN')
    or exists (select 1 from public.projects project where project.research_problem_id = id and public.can_access_project(project.id, 'overview'))
  );
create policy "Verified organization sponsors can create research problems"
  on public.research_problems for insert to authenticated
  with check (
    sponsor_user_id = (select auth.uid())
    and status in ('DRAFT', 'OPEN')
    and exists (
      select 1 from public.organizations org
      join public.organization_members member on member.organization_id = org.id
      where org.id = sponsor_organization_id
        and org.verification_status = 'APPROVED'
        and member.user_id = (select auth.uid())
        and member.role in ('OWNER', 'ADMIN')
    )
  );
create policy "Problem owners and admins can update research problems"
  on public.research_problems for update to authenticated
  using (sponsor_user_id = (select auth.uid()) or exists (
    select 1 from public.profiles admin where admin.id = (select auth.uid()) and admin.role = 'ADMIN'
  ))
  with check (
    (sponsor_user_id = (select auth.uid()) and status in ('DRAFT', 'OPEN'))
    or exists (select 1 from public.profiles admin where admin.id = (select auth.uid()) and admin.role = 'ADMIN')
  );

create policy "Projects are visible only with overview access"
  on public.projects for select to authenticated
  using (public.can_access_project(id, 'overview'));
create policy "Verified sponsors can create projects"
  on public.projects for insert to authenticated with check (false);
create policy "Project owners can update projects"
  on public.projects for update to authenticated
  using (public.can_manage_project(id))
  with check (public.can_manage_project(id));

create policy "Authorized participants can view charter versions"
  on public.project_charters for select to authenticated
  using (public.can_access_project(project_id, 'charter'));
create policy "Project owners can create immutable charter versions"
  on public.project_charters for insert to authenticated
  with check (false);
create policy "Project charters cannot be changed or deleted"
  on public.project_charters for update to authenticated using (false);
create policy "Project charters cannot be deleted"
  on public.project_charters for delete to authenticated using (false);

create policy "Team visibility follows project access"
  on public.project_members for select to authenticated
  using (public.can_access_project(project_id, 'team'));
create policy "Project owners can manage team membership"
  on public.project_members for insert to authenticated
  with check (public.can_manage_project(project_id) and invited_by = (select auth.uid()));
create policy "Project owners can update team membership"
  on public.project_members for update to authenticated
  using (public.can_manage_project(project_id))
  with check (public.can_manage_project(project_id));

create policy "Requesters and project owners can view access requests"
  on public.project_access_requests for select to authenticated
  using (
    requester_id = (select auth.uid())
    or public.can_manage_project(project_id)
    or exists (
      select 1 from public.project_members mentor
      where mentor.project_id = project_id
        and mentor.user_id = (select auth.uid())
        and mentor.role = 'MENTOR'
        and mentor.status = 'ACTIVE'
    )
    or exists (select 1 from public.profiles admin where admin.id = (select auth.uid()) and admin.role = 'ADMIN')
  );
create policy "Authenticated users can request project resource access"
  on public.project_access_requests for insert to authenticated
  with check (requester_id = (select auth.uid()) and status = 'PENDING');
create policy "Project owners can decide access requests"
  on public.project_access_requests for update to authenticated using (false) with check (false);
create policy "Access grants are visible to their owner and project owners"
  on public.project_access_grants for select to authenticated
  using (
    user_id = (select auth.uid())
    or granted_by = (select auth.uid())
    or public.can_manage_project(project_id)
  );
create policy "Project owners can grant resource access"
  on public.project_access_grants for insert to authenticated with check (false);
create policy "Project owners can revoke access grants"
  on public.project_access_grants for update to authenticated using (false) with check (false);

create policy "Project documents are visible only at their approved resource scope"
  on public.project_documents for select to authenticated
  using (
    public.can_access_project(project_id, resource_key)
    or (task_id is not null and exists (
      select 1 from public.project_tasks task
      where task.id = task_id and task.assigned_to = (select auth.uid())
    ))
  );
create policy "Project owners and assigned contributors can add scoped documents"
  on public.project_documents for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (
      (
        public.can_manage_project(project_id)
        and exists (
          select 1 from public.profiles author
          where author.id = (select auth.uid()) and author.role in ('RESEARCHER', 'ADMIN')
        )
      )
      or (task_id is not null and resource_key = 'task:' || task_id::text and exists (
        select 1 from public.project_tasks task
        where task.id = task_id and task.project_id = project_id
          and task.assigned_to = (select auth.uid())
          and type in ('IMPLEMENTATION', 'EXPERIMENT_NOTES')
      ))
    )
  );
create policy "Project documents cannot be silently overwritten"
  on public.project_documents for update to authenticated using (false);
create policy "Project documents cannot be deleted"
  on public.project_documents for delete to authenticated using (false);

create policy "Milestones are visible with project access"
  on public.project_milestones for select to authenticated
  using (public.can_access_project(project_id, 'milestones'));
create policy "Project owners can manage milestones"
  on public.project_milestones for all to authenticated
  using (public.can_manage_project(project_id))
  with check (public.can_manage_project(project_id));
create policy "Tasks are visible to assignees or authorized project participants"
  on public.project_tasks for select to authenticated
  using (assigned_to = (select auth.uid()) or public.can_access_project(project_id, 'task:' || id::text));
create policy "Project owners can manage tasks"
  on public.project_tasks for all to authenticated
  using (public.can_manage_project(project_id))
  with check (created_by = (select auth.uid()) and public.can_manage_project(project_id));

create policy "Users can manage their own claimed skills"
  on public.user_skills for select to authenticated using (user_id = (select auth.uid()));
create policy "Users can claim their own skills"
  on public.user_skills for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Users can remove their own skill claims"
  on public.user_skills for delete to authenticated using (user_id = (select auth.uid()));
create policy "Skill verification is visible to the subject and admins"
  on public.skill_verifications for select to authenticated
  using (user_id = (select auth.uid()) or exists (
    select 1 from public.profiles admin where admin.id = (select auth.uid()) and admin.role = 'ADMIN'
  ));
create policy "Users can request verification of their own skills"
  on public.skill_verifications for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'PENDING');
create policy "Admins and project leads can review skill verification"
  on public.skill_verifications for update to authenticated
  using (exists (select 1 from public.profiles admin where admin.id = (select auth.uid()) and admin.role = 'ADMIN'))
  with check (
    reviewed_by = (select auth.uid())
    and exists (select 1 from public.profiles admin where admin.id = (select auth.uid()) and admin.role = 'ADMIN')
  );

create policy "Experiments are visible to authorized project participants"
  on public.experiments for select to authenticated
  using (public.can_access_project(project_id, 'research'));
create policy "Authorized project participants can create experiments"
  on public.experiments for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and public.can_access_project(project_id, 'research')
  );
create policy "Experiment runs follow their experiment project scope"
  on public.experiment_runs for select to authenticated
  using (exists (
    select 1 from public.experiments experiment
    where experiment.id = experiment_id and public.can_access_project(experiment.project_id, 'research')
  ));
create policy "Authorized project participants can record real experiment runs"
  on public.experiment_runs for insert to authenticated with check (false);

create policy "Provenance is visible only within its authorized project scope"
  on public.ai_provenance for select to authenticated
  using (public.can_access_project(project_id, 'ai-workspace'));
create policy "Authenticated project members can record scoped AI provenance"
  on public.ai_provenance for insert to authenticated with check (false);

create policy "Contributions are visible to their author and authorized reviewers"
  on public.contributions for select to authenticated
  using (
    author_id = (select auth.uid())
    or public.can_access_project(project_id, 'contribution:' || id::text)
  );
create policy "Authorized project members can submit their own contributions"
  on public.contributions for insert to authenticated with check (false);
create policy "Contribution status and credits change only through review"
  on public.contributions for update to authenticated using (false);
create policy "Evidence follows its project and resource scope"
  on public.evidence for select to authenticated
  using (
    submitted_by = (select auth.uid())
    or public.can_access_project(project_id, 'evidence:' || id::text)
    or (task_id is not null and exists (
      select 1 from public.project_tasks task
      where task.id = task_id and task.assigned_to = (select auth.uid())
    ))
  );
create policy "Authorized users can attach evidence to their own work"
  on public.evidence for insert to authenticated with check (false);
create policy "Evidence cannot be silently changed or deleted"
  on public.evidence for update to authenticated using (false);
create policy "Evidence cannot be deleted"
  on public.evidence for delete to authenticated using (false);

create policy "Reviews are visible to authorized contribution participants"
  on public.contribution_reviews for select to authenticated
  using (exists (
    select 1 from public.contributions contribution
    where contribution.id = contribution_id
      and (
        contribution.author_id = (select auth.uid())
        or public.can_access_project(contribution.project_id, 'contribution:' || contribution.id::text)
      )
  ));
create policy "Review records are created only by the review transaction"
  on public.contribution_reviews for insert to authenticated with check (false);
create policy "Review records are immutable"
  on public.contribution_reviews for update to authenticated using (false);
create policy "Review records cannot be deleted"
  on public.contribution_reviews for delete to authenticated using (false);

create policy "Credit records are visible to the recipient or project owners"
  on public.credit_ledger for select to authenticated
  using (user_id = (select auth.uid()) or public.can_manage_project(project_id));
create policy "Credit awards are recorded only by the review transaction"
  on public.credit_ledger for insert to authenticated with check (false);
create policy "Contribution ledger is visible within project scope"
  on public.contribution_ledger for select to authenticated
  using (public.can_access_project(project_id, 'contributions'));
create policy "Ledger entries are recorded only by the review transaction"
  on public.contribution_ledger for insert to authenticated with check (false);
create policy "Audit events are visible to admins or authorized project participants"
  on public.audit_events for select to authenticated
  using (
    exists (select 1 from public.profiles admin where admin.id = (select auth.uid()) and admin.role = 'ADMIN')
    or (project_id is not null and public.can_access_project(project_id, 'activity'))
  );
create policy "Audit events are created by authenticated actors"
  on public.audit_events for insert to authenticated with check (false);
create policy "Notifications are private to their recipient"
  on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy "Recipients can mark notifications read"
  on public.notifications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Organization owners can upload private verification documents"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'organization-verification'
    and (storage.foldername(name))[2] = (select auth.uid())::text
    and public.can_manage_organization(((storage.foldername(name))[1])::uuid)
  );
create policy "Organization owners and admins can read verification documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'organization-verification'
    and (
      public.can_manage_organization(((storage.foldername(name))[1])::uuid)
      or exists (
        select 1 from public.profiles admin
        where admin.id = (select auth.uid()) and admin.role = 'ADMIN'
      )
    )
  );

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.add_organization_owner() from public, anon, authenticated;
revoke all on function public.can_access_project(uuid, text) from public, anon;
revoke all on function public.can_manage_project(uuid) from public, anon;
grant execute on function public.can_access_project(uuid, text) to authenticated;
grant execute on function public.can_manage_project(uuid) to authenticated;
revoke all on function public.is_organization_member(uuid) from public, anon;
grant execute on function public.is_organization_member(uuid) to authenticated;
revoke all on function public.can_manage_organization(uuid) from public, anon;
grant execute on function public.can_manage_organization(uuid) to authenticated;
revoke all on function public.can_view_profile(uuid) from public, anon;
grant execute on function public.can_view_profile(uuid) to authenticated;
revoke all on function public.get_ai_charter(uuid) from public, anon;
grant execute on function public.get_ai_charter(uuid) to authenticated;
revoke all on function public.list_open_task_opportunities(uuid) from public, anon;
grant execute on function public.list_open_task_opportunities(uuid) to authenticated;
revoke all on function public.review_contribution(uuid, public.review_decision, integer, integer, boolean, text, integer) from public, anon;
grant execute on function public.review_contribution(uuid, public.review_decision, integer, integer, boolean, text, integer) to authenticated;
revoke all on function public.submit_contribution(uuid, uuid, text, text, text, integer, uuid, jsonb) from public, anon;
grant execute on function public.submit_contribution(uuid, uuid, text, text, text, integer, uuid, jsonb) to authenticated;
revoke all on function public.create_sponsored_project(uuid, text, text, uuid, jsonb) from public, anon;
grant execute on function public.create_sponsored_project(uuid, text, text, uuid, jsonb) to authenticated;
revoke all on function public.decide_organization_verification(uuid, public.verification_status, text) from public, anon;
grant execute on function public.decide_organization_verification(uuid, public.verification_status, text) to authenticated;
revoke all on function public.admin_assign_role(uuid, public.app_role) from public, anon;
grant execute on function public.admin_assign_role(uuid, public.app_role) to authenticated;
revoke all on function public.decide_project_access_request(uuid, public.access_request_status, text, timestamptz) from public, anon;
grant execute on function public.decide_project_access_request(uuid, public.access_request_status, text, timestamptz) to authenticated;

revoke update on public.profiles from authenticated;
grant update (full_name, institution, bio, avatar_path, updated_at) on public.profiles to authenticated;
