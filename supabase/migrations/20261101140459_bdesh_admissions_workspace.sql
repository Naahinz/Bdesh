-- Copied verbatim from the live migration history (supabase_migrations.schema_migrations).
create table if not exists public.student_admissions_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text check (char_length(display_name)<=100),
 school_name text check (char_length(school_name)<=160),
 graduation_year integer check (graduation_year between 2020 and 2045),
 ssc_gpa numeric(3,2) check (ssc_gpa between 0 and 5),
 hsc_gpa numeric(3,2) check (hsc_gpa between 0 and 5),
 sat_total integer check (sat_total between 400 and 1600),
 english_test text check (english_test in ('none','ielts','det','toefl','other')),
 english_score text check (char_length(english_score)<=30),
 intended_majors text check (char_length(intended_majors)<=250),
 countries text[] not null default '{}'::text[],
 funding_need text not null default 'full_ride' check (funding_need in ('full_ride','full_tuition','partial','unsure')),
 activities jsonb not null default '[]'::jsonb check (jsonb_typeof(activities)='array' and pg_column_size(activities)<=12000),
 awards jsonb not null default '[]'::jsonb check (jsonb_typeof(awards)='array' and pg_column_size(awards)<=8000),
 updated_at timestamptz not null default now()
);
create table if not exists public.student_readiness (
 user_id uuid not null references auth.users(id) on delete cascade,
 milestone_id text not null check (length(milestone_id) between 1 and 80),
 state text not null default 'todo' check (state in ('todo','in_progress','done','not_applicable')),
 notes text check (char_length(notes)<=800),
 updated_at timestamptz not null default now(),
 primary key(user_id,milestone_id)
);
create table if not exists public.student_applications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 institution_name text not null check (char_length(institution_name) between 1 and 160),
 opportunity_id uuid references public.opportunities(id) on delete set null,
 application_round text not null default 'undecided' check(application_round in ('undecided','ED','ED2','EA','REA','RD','rolling','other')),
 status text not null default 'researching' check(status in ('researching','shortlisted','preparing','submitted','decision_received')),
 application_deadline date,
 aid_deadline date,
 checklist jsonb not null default '{}'::jsonb check(jsonb_typeof(checklist)='object' and pg_column_size(checklist)<=5000),
 notes text check(char_length(notes)<=2000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists bdesh_applications_user_idx on public.student_applications(user_id,application_deadline);
alter table public.student_admissions_profiles enable row level security;
alter table public.student_readiness enable row level security;
alter table public.student_applications enable row level security;
create policy "admissions_profile_own" on public.student_admissions_profiles for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "readiness_own" on public.student_readiness for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "applications_own" on public.student_applications for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
grant select,insert,update,delete on public.student_admissions_profiles,public.student_readiness,public.student_applications to authenticated;
revoke all on public.student_admissions_profiles,public.student_readiness,public.student_applications from anon;
