-- Copied verbatim from the live migration history (supabase_migrations.schema_migrations).
revoke insert,update,delete on public.opportunities from anon,authenticated;
grant select on public.opportunities to anon,authenticated;
grant insert,update on public.opportunities to authenticated;
create policy opportunities_editor_insert on public.opportunities for insert to authenticated with check ((auth.jwt() -> 'app_metadata' ->> 'bdesh_role') = 'editor');
create policy opportunities_editor_update on public.opportunities for update to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'bdesh_role') = 'editor') with check ((auth.jwt() -> 'app_metadata' ->> 'bdesh_role') = 'editor');
create policy opportunities_editor_select on public.opportunities for select to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'bdesh_role') = 'editor');
