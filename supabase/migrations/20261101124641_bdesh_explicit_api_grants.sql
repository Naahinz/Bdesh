-- Copied verbatim from the live migration history (supabase_migrations.schema_migrations).
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.student_profiles to authenticated;
grant select, insert, update, delete on public.student_progress to authenticated;
grant select on public.opportunities to anon, authenticated;
grant select, insert, delete on public.saved_opportunities to authenticated;
revoke insert, update, delete on public.opportunities from anon, authenticated;
revoke all on public.student_profiles, public.student_progress, public.saved_opportunities from anon;
