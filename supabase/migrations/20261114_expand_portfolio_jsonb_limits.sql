-- Increase byte-size limits for multilingual student portfolio JSONB.
-- Run this migration manually in the Supabase SQL Editor before deploying
-- the matching profile.js limits.
-- The original constraints combine JSONB array type and pg_column_size().
begin;

alter table public.student_profile_portfolios
  drop constraint if exists student_profile_portfolios_activities_check,
  drop constraint if exists student_profile_portfolios_honors_check,
  drop constraint if exists student_profile_portfolios_essays_check;

alter table public.student_profile_portfolios
  add constraint student_profile_portfolios_activities_check
    check (jsonb_typeof(activities) = 'array' and pg_column_size(activities) <= 120000),
  add constraint student_profile_portfolios_honors_check
    check (jsonb_typeof(honors) = 'array' and pg_column_size(honors) <= 40000),
  add constraint student_profile_portfolios_essays_check
    check (jsonb_typeof(essays) = 'array' and pg_column_size(essays) <= 200000);

commit;
