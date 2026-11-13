-- Copied verbatim from the live migration history (supabase_migrations.schema_migrations).
begin;
revoke insert on table public.beta_feedback from anon, authenticated;
revoke insert (category, message, reply_email, page_path) on table public.beta_feedback from anon, authenticated;
drop policy if exists "Public feedback submission" on public.beta_feedback;
commit;
