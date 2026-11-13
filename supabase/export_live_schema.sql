-- Read-only. Lists the live Bdesh schema (tables, constraints, RLS policies, grants,
-- functions, triggers) as SQL text, so it can be saved into supabase/migrations/.
-- Run in the Supabase SQL Editor, then use "Export > Download CSV" on the result.
with tables as (
  select c.oid, n.nspname as schema, c.relname as name, c.relrowsecurity as rls
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where c.relkind = 'r' and n.nspname in ('public', 'bdesh_private')
)
select section, ord, statement from (
  select 1 as section, t.schema || '.' || t.name as ord,
    format(E'create table if not exists %I.%I (\n%s\n);', t.schema, t.name,
      (select string_agg(format('  %I %s%s%s', a.attname, format_type(a.atttypid, a.atttypmod),
                case when a.attnotnull then ' not null' else '' end,
                coalesce(' default ' || pg_get_expr(d.adbin, d.adrelid), '')), E',\n' order by a.attnum)
       from pg_attribute a left join pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
       where a.attrelid = t.oid and a.attnum > 0 and not a.attisdropped)) as statement
  from tables t
  union all
  select 2, t.schema || '.' || t.name || '.' || con.conname,
    format('alter table %I.%I add constraint %I %s;', t.schema, t.name, con.conname, pg_get_constraintdef(con.oid))
  from tables t join pg_constraint con on con.conrelid = t.oid
  union all
  select 3, t.schema || '.' || t.name,
    format('alter table %I.%I enable row level security;', t.schema, t.name)
  from tables t where t.rls
  union all
  select 4, p.schemaname || '.' || p.tablename || '.' || p.policyname,
    format('create policy %I on %I.%I as %s for %s to %s%s%s;', p.policyname, p.schemaname, p.tablename,
      p.permissive, p.cmd, array_to_string(p.roles, ', '),
      coalesce(' using (' || p.qual || ')', ''), coalesce(' with check (' || p.with_check || ')', ''))
  from pg_policies p where p.schemaname in ('public', 'bdesh_private')
  union all
  select 5, g.table_schema || '.' || g.table_name || '.' || g.grantee,
    format('grant %s on %I.%I to %I;', string_agg(g.privilege_type, ', ' order by g.privilege_type),
      g.table_schema, g.table_name, g.grantee)
  from information_schema.role_table_grants g
  where g.table_schema in ('public', 'bdesh_private') and g.grantee in ('anon', 'authenticated', 'service_role')
  group by g.table_schema, g.table_name, g.grantee
  union all
  select 6, n.nspname || '.' || p.proname, pg_get_functiondef(p.oid) || ';'
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'bdesh_private') and p.prokind = 'f'
  union all
  select 7, n.nspname || '.' || p.proname || '.' || r.rolname,
    format('grant execute on function %s to %I;', p.oid::regprocedure, r.rolname)
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  cross join (values ('anon'), ('authenticated'), ('service_role')) as r(rolname)
  where n.nspname in ('public', 'bdesh_private') and p.prokind = 'f'
    and has_function_privilege(r.rolname, p.oid, 'EXECUTE')
  union all
  select 8, t.schema || '.' || t.name || '.' || tg.tgname, pg_get_triggerdef(tg.oid) || ';'
  from tables t join pg_trigger tg on tg.tgrelid = t.oid where not tg.tgisinternal
) s
order by section, ord;
