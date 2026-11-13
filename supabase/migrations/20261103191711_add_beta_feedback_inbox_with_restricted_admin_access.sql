-- Copied verbatim from the live migration history (supabase_migrations.schema_migrations).
create table if not exists public.beta_feedback (
 id uuid primary key default gen_random_uuid(),
 category text not null check (category in ('Bug or broken feature','Incorrect university information','Suggestion or new idea','Other feedback')),
 message text not null check (char_length(btrim(message)) between 12 and 5000),
 reply_email text check (reply_email is null or (char_length(reply_email)<=254 and reply_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
 page_path text not null default '/feedback.html' check (char_length(page_path) <= 300 and page_path like '/%'),
 status text not null default 'new' check (status in ('new','reviewing','resolved')),
 created_at timestamptz not null default now(),
 reviewed_at timestamptz
);
alter table public.beta_feedback enable row level security;
revoke all on table public.beta_feedback from public, anon, authenticated;
grant insert (category,message,reply_email,page_path) on public.beta_feedback to anon, authenticated;
grant select on public.beta_feedback to authenticated;
grant update (status,reviewed_at) on public.beta_feedback to authenticated;
create policy "Public feedback submission" on public.beta_feedback
 for insert to anon, authenticated with check (status='new' and reviewed_at is null);
create policy "Administrator reads feedback" on public.beta_feedback
 for select to authenticated
 using ((auth.jwt() -> 'app_metadata' ->> 'bdesh_analytics_admin') = 'true');
create policy "Administrator updates feedback status" on public.beta_feedback
 for update to authenticated
 using ((auth.jwt() -> 'app_metadata' ->> 'bdesh_analytics_admin') = 'true')
 with check ((auth.jwt() -> 'app_metadata' ->> 'bdesh_analytics_admin') = 'true');
