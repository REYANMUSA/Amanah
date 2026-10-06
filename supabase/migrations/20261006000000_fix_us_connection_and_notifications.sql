-- Amanah: fix connected partner identity lookup and emergency delivery.
-- Additive only: no existing Us data is deleted or redesigned.

create schema if not exists private;

create or replace function private.get_partner_profile()
returns table (
  id text,
  display_name text,
  avatar_url text,
  gender text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id text := (select auth.uid())::text;
  v_partner_id text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select
    case
      when r.user_a = v_user_id then r.user_b
      else r.user_a
    end
  into v_partner_id
  from public.relationships r
  where r.status = 'accepted'
    and (r.user_a = v_user_id or r.user_b = v_user_id)
  order by r.created_at desc
  limit 1;

  if v_partner_id is null then
    return;
  end if;

  return query
  select
    u.id::text,
    coalesce(
      p.display_name,
      u.raw_user_meta_data ->> 'display_name',
      nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
      'Connected Person'
    )::text,
    p.avatar_url::text,
    coalesce(p.gender, 'unspecified')::text
  from auth.users u
  left join public.profiles p on p.user_id = u.id
  where u.id::text = v_partner_id;
end;
$$;

revoke all on function private.get_partner_profile() from public, anon;
grant execute on function private.get_partner_profile() to authenticated;

create or replace function public.get_partner_profile()
returns table (
  id text,
  display_name text,
  avatar_url text,
  gender text
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.get_partner_profile();
$$;

revoke execute on function public.get_partner_profile() from public, anon;
grant execute on function public.get_partner_profile() to authenticated;
