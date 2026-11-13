-- Copied verbatim from the live migration history (supabase_migrations.schema_migrations).
create table if not exists public.student_profile_portfolios (
 user_id uuid primary key references auth.users(id) on delete cascade,
 activities jsonb not null default '[]'::jsonb check (jsonb_typeof(activities)='array' and pg_column_size(activities)<=32000),
 honors jsonb not null default '[]'::jsonb check (jsonb_typeof(honors)='array' and pg_column_size(honors)<=12000),
 essays jsonb not null default '[]'::jsonb check (jsonb_typeof(essays)='array' and pg_column_size(essays)<=50000),
 academic_context text check (char_length(academic_context)<=8000),
 brag_sheet text check (char_length(brag_sheet)<=18000),
 future_goals text check (char_length(future_goals)<=12000),
 additional_notes text check (char_length(additional_notes)<=12000),
 updated_at timestamptz not null default now()
);
alter table public.student_profile_portfolios enable row level security;
create policy "portfolio_select_owner" on public.student_profile_portfolios for select to authenticated using ((select auth.uid())=user_id);
create policy "portfolio_insert_owner" on public.student_profile_portfolios for insert to authenticated with check ((select auth.uid())=user_id);
create policy "portfolio_update_owner" on public.student_profile_portfolios for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "portfolio_delete_owner" on public.student_profile_portfolios for delete to authenticated using ((select auth.uid())=user_id);
grant select,insert,update,delete on public.student_profile_portfolios to authenticated;
revoke all on public.student_profile_portfolios from anon;
