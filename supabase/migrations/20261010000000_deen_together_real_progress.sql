-- Amanah: truthful, narrowly shared Deen Together progress.
-- This is additive: it does not update or delete existing progress rows.

create table if not exists public.deen_daily_quiz_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  date date not null,
  score integer not null default 0,
  total integer not null default 5,
  answered_count integer not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint deen_daily_quiz_scores_valid_score check (score >= 0 and score <= total),
  constraint deen_daily_quiz_scores_valid_total check (total > 0),
  constraint deen_daily_quiz_scores_valid_answer_count check (answered_count >= 0 and answered_count <= total),
  constraint deen_daily_quiz_scores_user_date_key unique (user_id, date)
);

alter table public.deen_daily_quiz_scores enable row level security;

revoke all on table public.deen_daily_quiz_scores from public, anon;
grant select, insert, update on table public.deen_daily_quiz_scores to authenticated;

drop policy if exists "Users can view own daily Deen challenge score" on public.deen_daily_quiz_scores;
create policy "Users can view own daily Deen challenge score"
  on public.deen_daily_quiz_scores
  for select
  to authenticated
  using (user_id = (select auth.uid())::text);

drop policy if exists "Users can insert own daily Deen challenge score" on public.deen_daily_quiz_scores;
create policy "Users can insert own daily Deen challenge score"
  on public.deen_daily_quiz_scores
  for insert
  to authenticated
  with check (user_id = (select auth.uid())::text);

drop policy if exists "Users can update own daily Deen challenge score" on public.deen_daily_quiz_scores;
create policy "Users can update own daily Deen challenge score"
  on public.deen_daily_quiz_scores
  for update
  to authenticated
  using (user_id = (select auth.uid())::text)
  with check (user_id = (select auth.uid())::text);

drop policy if exists "Accepted partners can view today's Deen challenge score" on public.deen_daily_quiz_scores;
create policy "Accepted partners can view today's Deen challenge score"
  on public.deen_daily_quiz_scores
  for select
  to authenticated
  using (
    date between current_date - 1 and current_date + 1
    and exists (
      select 1
      from public.relationships r
      where r.status = 'accepted'
        and (
          (r.user_a = (select auth.uid())::text and r.user_b = public.deen_daily_quiz_scores.user_id)
          or
          (r.user_b = (select auth.uid())::text and r.user_a = public.deen_daily_quiz_scores.user_id)
        )
    )
  );

drop policy if exists "Accepted partners can view current Quran progress" on public.qur_an_tasks;
create policy "Accepted partners can view current Quran progress"
  on public.qur_an_tasks
  for select
  to authenticated
  using (
    date between current_date - 1 and current_date + 1
    and exists (
      select 1
      from public.relationships r
      where r.status = 'accepted'
        and (
          (r.user_a = (select auth.uid())::text and r.user_b = public.qur_an_tasks.user_id)
          or
          (r.user_b = (select auth.uid())::text and r.user_a = public.qur_an_tasks.user_id)
        )
    )
  );

-- The app displays the current local day; allow a +/-1 day visibility window in
-- RLS so users near midnight in different time zones are not incorrectly hidden.
-- The app itself filters partner queries to the exact local date and never loads
-- the partner's historical Qur'an records.

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.qur_an_tasks;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.deen_daily_quiz_scores;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
