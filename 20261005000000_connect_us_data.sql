alter table if exists public.emergency_requests
  add column if not exists recipient_user_id text;

-- Amanah connection sync: link the existing accounts and make shared Us data database-backed.
-- This migration is intentionally additive; it does not change the existing UI or delete user data.

create or replace function public.connect_by_invite_code(p_invite_code text)
returns public.relationships
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_relationship public.relationships;
  v_user_id text := (select auth.uid())::text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
    into v_relationship
  from public.relationships
  where upper(invite_code) = upper(trim(p_invite_code))
    and status = 'pending'
    and user_b is null
  for update;

  if not found then
    raise exception 'Invitation code not found or already used';
  end if;

  if v_relationship.user_a = v_user_id then
    raise exception 'You cannot connect to your own invitation code';
  end if;

  update public.relationships
  set user_b = v_user_id,
      status = 'accepted',
      accepted_at = now()
  where id = v_relationship.id
  returning * into v_relationship;

  return v_relationship;
end;
$$;

revoke execute on function public.connect_by_invite_code(text) from public, anon;
grant execute on function public.connect_by_invite_code(text) to authenticated;

drop policy if exists "Users can view linked partner goals" on public.goals;
create policy "Users can view linked partner goals"
  on public.goals
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.relationships r
      where r.status = 'accepted'
        and (
          (r.user_a = (select auth.uid())::text and r.user_b = public.goals.user_id::text)
          or
          (r.user_b = (select auth.uid())::text and r.user_a = public.goals.user_id::text)
        )
    )
  );

drop policy if exists "Users can view linked partner memories" on public.memories;
create policy "Users can view linked partner memories"
  on public.memories
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.relationships r
      where r.status = 'accepted'
        and r.id = public.memories.relationship_id
        and ((r.user_a = (select auth.uid())::text) or (r.user_b = (select auth.uid())::text))
    )
  );

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.relationships;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.shared_goals;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.goals;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.memories;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.emergency_requests;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
