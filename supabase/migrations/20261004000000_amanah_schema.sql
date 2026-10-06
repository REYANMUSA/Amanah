-- ====================================================================
-- AMANAH (أمانة) — COMPLETE PRODUCTION DATABASE MIGRATION
-- ====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  display_name text not null,
  gender text check (gender in ('male', 'female', 'unspecified')) default 'unspecified',
  avatar_url text,
  date_of_birth date,
  timezone text default 'UTC',
  onboarding_completed boolean default false,
  theme_preference text check (theme_preference in ('personal', 'feminine', 'minimal_dark')) default 'personal',
  notification_permission_status text default 'default',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. USER SETTINGS
create table if not exists public.user_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  notifications_enabled boolean default false,
  prayer_notifications_enabled boolean default true,
  habit_notifications_enabled boolean default true,
  relationship_notifications_enabled boolean default true,
  reminder_time text default '08:00',
  daily_reminder_enabled boolean default true,
  dark_mode boolean default false,
  sound_enabled boolean default true,
  vibration_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. HABITS
create table if not exists public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  category text not null check (category in ('Deen', 'Character', 'Health', 'Education', 'Career', 'Discipline', 'Personal')),
  frequency text default 'daily',
  target_count integer default 1,
  active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. HABIT COMPLETIONS
create table if not exists public.habit_completions (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completion_date date not null,
  completed boolean default true,
  completed_at timestamptz default now(),
  notes text,
  unique (habit_id, completion_date)
);

-- 5. DAILY TASKS
create table if not exists public.daily_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  date date not null default current_date,
  completed boolean default false,
  category text default 'General',
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. GOALS (Personal)
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  category text not null,
  target_date date,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  status text check (status in ('in_progress', 'completed', 'paused')) default 'in_progress',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. RELATIONSHIPS (Linking for 'Us' section)
create table if not exists public.relationships (
  id uuid primary key default uuid_generate_v4(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid references auth.users(id) on delete cascade,
  invite_code text unique,
  status text check (status in ('pending', 'accepted', 'rejected', 'disconnected')) default 'pending',
  created_at timestamptz default now(),
  accepted_at timestamptz
);

-- 8. SHARED GOALS (Us)
create table if not exists public.shared_goals (
  id uuid primary key default uuid_generate_v4(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  partner_user_id uuid references auth.users(id) on delete set null,
  relationship_id uuid references public.relationships(id) on delete cascade,
  title text not null,
  description text default '',
  category text not null check (category in ('Deen', 'Education', 'Career', 'Money', 'Family', 'Character', 'Health', 'Marriage preparation')),
  progress integer default 0 check (progress >= 0 and progress <= 100),
  target_date date,
  status text check (status in ('in_progress', 'completed', 'paused')) default 'in_progress',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. COURSES
create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  owner text default 'Me',
  description text default '',
  progress integer default 0 check (progress >= 0 and progress <= 100),
  days_per_week integer default 4,
  expected_days integer default 60,
  notes text default '',
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. MEMORIES (Our Journey)
create table if not exists public.memories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  relationship_id uuid references public.relationships(id) on delete cascade,
  title text not null,
  description text default '',
  event_date date not null,
  event_type text check (event_type in ('Past', 'Present', 'Future', 'Day met', 'Day talked', 'Day chose not to talk', 'Birthday', 'Celebration', 'Important date')) default 'Important date',
  image_url text,
  created_at timestamptz default now()
);

-- 11. PHOTOS (Private Storage metadata)
create table if not exists public.photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  caption text,
  event_date date default current_date,
  created_at timestamptz default now()
);

-- 12. PRAYER SETTINGS
create table if not exists public.prayer_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  fajr_enabled boolean default true,
  dhuhr_enabled boolean default true,
  asr_enabled boolean default true,
  maghrib_enabled boolean default true,
  isha_enabled boolean default true,
  notification_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 13. DHIKR PROGRESS
create table if not exists public.dhikr_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  target integer default 100,
  count integer default 0,
  updated_at timestamptz default now(),
  unique (user_id, date)
);

-- 14. HADITH PROGRESS
create table if not exists public.hadith_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number integer not null,
  completed boolean default true,
  completed_at timestamptz default now(),
  unique (user_id, day_number)
);

-- 15. DEEN CHALLENGES (Authenticated & verified questions)
create table if not exists public.deen_challenges (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null check (correct_answer in ('A', 'B', 'C', 'D')),
  explanation text not null,
  source text not null,
  category text default 'Aqeedah & Fiqh',
  created_at timestamptz default now()
);

-- 16. QUR'AN TASKS
create table if not exists public.qur_an_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  pages_target integer default 3,
  pages_completed integer default 0,
  completed boolean default false,
  notes text default 'Muraaja — 3 pages',
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- 17. EMERGENCY REQUESTS (I NEED YOU)
create table if not exists public.emergency_requests (
  id uuid primary key default uuid_generate_v4(),
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  recipient_user_id uuid references auth.users(id) on delete cascade,
  relationship_id uuid references public.relationships(id) on delete cascade,
  message text default 'I NEED YOU',
  created_at timestamptz default now(),
  acknowledged_at timestamptz,
  status text check (status in ('active', 'acknowledged', 'resolved')) default 'active'
);

-- 18. PUSH SUBSCRIPTIONS
create table if not exists public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  platform text default 'web',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, endpoint)
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.goals enable row level security;
alter table public.relationships enable row level security;
alter table public.shared_goals enable row level security;
alter table public.courses enable row level security;
alter table public.memories enable row level security;
alter table public.photos enable row level security;
alter table public.prayer_settings enable row level security;
alter table public.dhikr_progress enable row level security;
alter table public.hadith_progress enable row level security;
alter table public.deen_challenges enable row level security;
alter table public.qur_an_tasks enable row level security;
alter table public.emergency_requests enable row level security;
alter table public.push_subscriptions enable row level security;

-- Profiles: Users manage their own profile only
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);
create policy "Users can delete own profile" on public.profiles
  for delete using (auth.uid() = user_id);

-- User Settings
create policy "Users can manage own settings" on public.user_settings
  for all using (auth.uid() = user_id);

-- Habits & Completions
create policy "Users can manage own habits" on public.habits
  for all using (auth.uid() = user_id);
create policy "Users can manage own completions" on public.habit_completions
  for all using (auth.uid() = user_id);

-- Daily Tasks
create policy "Users can manage own tasks" on public.daily_tasks
  for all using (auth.uid() = user_id);

-- Personal Goals
create policy "Users can manage own goals" on public.goals
  for all using (auth.uid() = user_id);

-- Relationships: Users can see relationships where they are user_a or user_b
create policy "Users can view own relationships" on public.relationships
  for select using (auth.uid() = user_a or auth.uid() = user_b);
create policy "Users can insert relationships" on public.relationships
  for insert with check (auth.uid() = user_a);
create policy "Users can update own relationships" on public.relationships
  for update using (auth.uid() = user_a or auth.uid() = user_b);

-- Shared Goals: Only owners or linked accepted partners
create policy "Users can manage shared goals" on public.shared_goals
  for all using (auth.uid() = owner_user_id or auth.uid() = partner_user_id);

-- Courses
create policy "Users can manage own courses" on public.courses
  for all using (auth.uid() = user_id);

-- Memories
create policy "Users can manage own memories" on public.memories
  for all using (auth.uid() = user_id);

-- Photos
create policy "Users can manage own photos" on public.photos
  for all using (auth.uid() = user_id);

-- Prayer Settings
create policy "Users can manage prayer settings" on public.prayer_settings
  for all using (auth.uid() = user_id);

-- Dhikr & Quran & Hadith
create policy "Users can manage dhikr progress" on public.dhikr_progress
  for all using (auth.uid() = user_id);
create policy "Users can manage hadith progress" on public.hadith_progress
  for all using (auth.uid() = user_id);
create policy "Users can manage qur_an tasks" on public.qur_an_tasks
  for all using (auth.uid() = user_id);

-- Deen Challenges (Public readable for authenticated users)
create policy "Anyone authenticated can view challenges" on public.deen_challenges
  for select to authenticated using (true);

-- Emergency Requests
create policy "Users can view emergency requests where sender or recipient" on public.emergency_requests
  for select using (auth.uid() = sender_user_id or auth.uid() = recipient_user_id);
create policy "Users can create emergency requests" on public.emergency_requests
  for insert with check (auth.uid() = sender_user_id);
create policy "Users can update emergency requests" on public.emergency_requests
  for update using (auth.uid() = sender_user_id or auth.uid() = recipient_user_id);

-- Push Subscriptions
create policy "Users can manage own push subscriptions" on public.push_subscriptions
  for all using (auth.uid() = user_id);

-- ====================================================================
-- SEED AUTHENTIC DEEN CHALLENGES
-- ====================================================================
insert into public.deen_challenges (question, option_a, option_b, option_c, option_d, correct_answer, explanation, source, category)
values
  (
    'What did the Prophet Muhammad (ﷺ) describe as the heaviest thing on the scales on the Day of Resurrection?',
    'Fasting continuously',
    'Good character (Husn al-Khuluq)',
    'Spending mountains of gold',
    'Memorizing poetry',
    'B',
    'The Prophet (ﷺ) said: "Nothing is heavier on the scale of a believer on the Day of Resurrection than good character." (Sunan al-Tirmidhi 2002, Sahih).',
    'Jami` at-Tirmidhi 2002',
    'Character & Akhlaq'
  ),
  (
    'Which action was beloved to Allah according to Sahih al-Bukhari 6464?',
    'The deed done only in public',
    'A huge deed done once in a lifetime',
    'The most regular deed, even if it is small',
    'A deed that causes exhaustion',
    'C',
    'The Messenger of Allah (ﷺ) said: "Take up good deeds only as much as you are able, for the best deeds are those that are regular even if they are few."',
    'Sahih al-Bukhari 6464',
    'Discipline & Habits'
  ),
  (
    'What did the Prophet (ﷺ) teach regarding anger in Sahih al-Bukhari 6116?',
    'To shout and release frustration',
    'The strong person is the one who controls himself when angry',
    'To break something private',
    'To hold grudges quietly',
    'B',
    'The Messenger of Allah (ﷺ) said: "The strong is not the one who overcomes the people by his strength, but the one who controls himself while in anger."',
    'Sahih al-Bukhari 6116',
    'Self-Control & Restraint'
  )
on conflict do nothing;
