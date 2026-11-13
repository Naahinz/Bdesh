-- Copied verbatim from the live migration history (supabase_migrations.schema_migrations).
-- Bdesh initial schema. Review before applying to Nahin's Supabase project.
-- All student data remains private to its owner. Public opportunity data is read-only.
create table if not exists public.student_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 academic_stage text not null default '11' check (academic_stage in ('9','10','11','12','gap')),
 nctb_group text check (nctb_group in ('science','business','humanities','undecided')),
 target_intake integer check (target_intake between 2027 and 2040),
 preferred_language text not null default 'bn' check (preferred_language in ('bn','en')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.student_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 task_id text not null check (length(task_id) between 1 and 100),
 is_complete boolean not null default false,
 updated_at timestamptz not null default now(),
 primary key (user_id,task_id)
);
create table if not exists public.opportunities (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 country text not null,
 degree_level text not null default 'undergraduate' check (degree_level='undergraduate'),
 official_url text not null check (official_url ~ '^https://'),
 funding_notes text,
 eligibility_notes text,
 deadline_notes text,
 verified_at date,
 published boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.saved_opportunities (
 user_id uuid not null references auth.users(id) on delete cascade,
 opportunity_id uuid not null references public.opportunities(id) on delete cascade,
 saved_at timestamptz not null default now(),
 primary key(user_id, opportunity_id)
);
alter table public.student_profiles enable row level security;
alter table public.student_progress enable row level security;
alter table public.opportunities enable row level security;
alter table public.saved_opportunities enable row level security;
create policy "profiles_owner_select" on public.student_profiles for select to authenticated using ((select auth.uid())=user_id);
create policy "profiles_owner_insert" on public.student_profiles for insert to authenticated with check ((select auth.uid())=user_id);
create policy "profiles_owner_update" on public.student_profiles for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "profiles_owner_delete" on public.student_profiles for delete to authenticated using ((select auth.uid())=user_id);
create policy "progress_owner_select" on public.student_progress for select to authenticated using ((select auth.uid())=user_id);
create policy "progress_owner_insert" on public.student_progress for insert to authenticated with check ((select auth.uid())=user_id);
create policy "progress_owner_update" on public.student_progress for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "progress_owner_delete" on public.student_progress for delete to authenticated using ((select auth.uid())=user_id);
create policy "opportunities_public_read" on public.opportunities for select to anon,authenticated using (published=true);
create policy "saved_owner_select" on public.saved_opportunities for select to authenticated using ((select auth.uid())=user_id);
create policy "saved_owner_insert" on public.saved_opportunities for insert to authenticated with check ((select auth.uid())=user_id);
create policy "saved_owner_delete" on public.saved_opportunities for delete to authenticated using ((select auth.uid())=user_id);
-- No student can publish or edit opportunities from the client.
-- No automatic user signup trigger. Age/guardian consent must be implemented and reviewed first.
