-- Copied verbatim from the live migration history (supabase_migrations.schema_migrations).
alter table public.opportunities add column if not exists source_notes text, add column if not exists source_checked_at date;
create table if not exists public.opportunity_change_log (
 id bigint generated always as identity primary key,
 opportunity_id uuid not null,
 changed_at timestamptz not null default now(),
 changed_by uuid,
 prior jsonb,
 updated jsonb
);
alter table public.opportunity_change_log enable row level security;
revoke all on public.opportunity_change_log from anon,authenticated;
grant select on public.opportunity_change_log to authenticated;
create policy opportunity_change_log_editor_read on public.opportunity_change_log for select to authenticated using ((auth.jwt()->'app_metadata'->>'bdesh_role')='editor');
create or replace function public.record_bdesh_opportunity_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.opportunity_change_log(opportunity_id,changed_by,prior,updated) values(new.id,auth.uid(),to_jsonb(old),to_jsonb(new));
 return new;
end $$;
revoke all on function public.record_bdesh_opportunity_change() from public,anon,authenticated;
drop trigger if exists bdesh_opportunity_update_audit on public.opportunities;
create trigger bdesh_opportunity_update_audit after update on public.opportunities for each row when (old is distinct from new) execute function public.record_bdesh_opportunity_change();
