create or replace function public.notify_access_request_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient_id uuid;
begin
  select project.sponsor_user_id
  into recipient_id
  from public.projects project
  where project.id = new.project_id;

  if recipient_id is not null and recipient_id <> new.requester_id then
    insert into public.notifications (user_id, project_id, title, message)
    values (
      recipient_id,
      new.project_id,
      'Project access requested',
      'A user requested access to ' || new.resource_key || '.'
    );
  end if;
  return new;
end;
$$;

create trigger project_access_request_notification
  after insert on public.project_access_requests
  for each row execute function public.notify_access_request_created();

create or replace function public.notify_access_request_decided()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status and new.status in ('APPROVED', 'REJECTED', 'EXPIRED') then
    insert into public.notifications (user_id, project_id, title, message)
    values (
      new.requester_id,
      new.project_id,
      'Project access ' || lower(new.status::text),
      coalesce(nullif(trim(new.decision_notes), ''), 'Your project access request was ' || lower(new.status::text) || '.')
    );
  end if;
  return new;
end;
$$;

create trigger project_access_request_decision_notification
  after update of status on public.project_access_requests
  for each row execute function public.notify_access_request_decided();

create or replace function public.notify_contribution_submitted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient record;
begin
  for recipient in
    select distinct candidates.user_id
    from (
      select project.lead_researcher_id as user_id
      from public.projects project
      where project.id = new.project_id
      union all
      select project.sponsor_user_id as user_id
      from public.projects project
      where project.id = new.project_id
      union all
      select member.user_id
      from public.project_members member
      where member.project_id = new.project_id
        and member.role = 'MENTOR'
        and member.status = 'ACTIVE'
    ) candidates
    where candidates.user_id is not null
      and candidates.user_id <> new.author_id
  loop
    insert into public.notifications (user_id, project_id, title, message)
    values (
      recipient.user_id,
      new.project_id,
      'Contribution submitted',
      '"' || new.title || '" is ready for review.'
    );
  end loop;
  return new;
end;
$$;

create trigger contribution_submitted_notification
  after insert on public.contributions
  for each row execute function public.notify_contribution_submitted();

create or replace function public.notify_contribution_reviewed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications (user_id, project_id, title, message)
    values (
      new.author_id,
      new.project_id,
      'Contribution ' || lower(replace(new.status::text, '_', ' ')),
      'Your contribution "' || new.title || '" has a new review status.'
    );
  end if;
  return new;
end;
$$;

create trigger contribution_review_notification
  after update of status on public.contributions
  for each row execute function public.notify_contribution_reviewed();

create or replace function public.notify_task_assignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.assigned_to is not null and new.assigned_to is distinct from old.assigned_to then
    insert into public.notifications (user_id, project_id, title, message)
    values (
      new.assigned_to,
      new.project_id,
      'Task assigned',
      'You have been assigned "' || new.title || '".'
    );
  end if;
  return new;
end;
$$;

create trigger project_task_assignment_notification
  after update of assigned_to on public.project_tasks
  for each row execute function public.notify_task_assignment();

create or replace function public.notify_organization_verification_decided()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient_id uuid;
  organization_name text;
begin
  if new.status is distinct from old.status and new.status in ('APPROVED', 'REJECTED') then
    select organization.created_by, organization.name
    into recipient_id, organization_name
    from public.organizations organization
    where organization.id = new.organization_id;

    if recipient_id is not null then
      insert into public.notifications (user_id, title, message)
      values (
        recipient_id,
        'Organization verification ' || lower(new.status::text),
        'Verification for "' || organization_name || '" was ' || lower(new.status::text) || '.'
      );
    end if;
  end if;
  return new;
end;
$$;

create trigger organization_verification_notification
  after update of status on public.organization_verifications
  for each row execute function public.notify_organization_verification_decided();

revoke all on function public.notify_access_request_created() from public, anon, authenticated;
revoke all on function public.notify_access_request_decided() from public, anon, authenticated;
revoke all on function public.notify_contribution_submitted() from public, anon, authenticated;
revoke all on function public.notify_contribution_reviewed() from public, anon, authenticated;
revoke all on function public.notify_task_assignment() from public, anon, authenticated;
revoke all on function public.notify_organization_verification_decided() from public, anon, authenticated;
