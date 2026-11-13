-- Bdesh privacy test. Paste the whole file into the Supabase SQL Editor and click Run.
-- PASS: "Success. No rows returned".  FAIL: a red error that starts with "RLS FAIL".
-- Everything runs inside one transaction that is rolled back, so no test data is kept.
begin;

-- Two throwaway accounts: A is the attacker, B owns private data.
insert into auth.users (id, email, aud, role)
values
  ('00000000-0000-4000-8000-00000000000a', 'rls-test-a@example.invalid', 'authenticated', 'authenticated'),
  ('00000000-0000-4000-8000-00000000000b', 'rls-test-b@example.invalid', 'authenticated', 'authenticated');

insert into public.student_profiles (user_id) values ('00000000-0000-4000-8000-00000000000b');
insert into public.student_admissions_profiles (user_id, display_name)
  values ('00000000-0000-4000-8000-00000000000b', 'Private B');
insert into public.student_profile_portfolios (user_id, brag_sheet)
  values ('00000000-0000-4000-8000-00000000000b', 'Private B');
insert into public.student_applications (user_id, institution_name)
  values ('00000000-0000-4000-8000-00000000000b', 'Private B College');
insert into public.student_readiness (user_id, milestone_id)
  values ('00000000-0000-4000-8000-00000000000b', 'foundation');

-- Act as student A.
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-00000000000a","role":"authenticated"}', true);

do $$
declare
  t text;
  n bigint;
  b constant uuid := '00000000-0000-4000-8000-00000000000b';
begin
  -- A owns no rows, so an unfiltered update/delete that touches anything reached someone else's data.
  foreach t in array array['student_profiles', 'student_admissions_profiles',
    'student_profile_portfolios', 'student_applications', 'student_readiness'] loop
    execute format('select count(*) from public.%I where user_id = $1', t) into n using b;
    if n <> 0 then raise exception 'RLS FAIL: student A can READ student B rows in %', t; end if;

    execute format('update public.%I set updated_at = now()', t);
    get diagnostics n = row_count;
    if n <> 0 then raise exception 'RLS FAIL: student A can UPDATE student B rows in %', t; end if;

    execute format('delete from public.%I', t);
    get diagnostics n = row_count;
    if n <> 0 then raise exception 'RLS FAIL: student A can DELETE student B rows in %', t; end if;
  end loop;

  begin
    insert into public.student_applications (user_id, institution_name) values (b, 'Forged');
    raise exception 'RLS FAIL: student A can INSERT rows owned by student B';
  exception when insufficient_privilege then null;  -- expected: blocked by RLS
  end;

  select count(*) into n from public.beta_feedback;
  if n <> 0 then raise exception 'RLS FAIL: an ordinary student can read the feedback inbox'; end if;

  update public.opportunities set title = title;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'RLS FAIL: an ordinary student can edit the college directory'; end if;

  select count(*) into n from public.opportunities where published = false;
  if n <> 0 then raise exception 'RLS FAIL: an ordinary student can see unpublished college drafts'; end if;
end $$;

-- Act as a signed-out visitor.
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
declare
  t text;
  n bigint;
begin
  foreach t in array array['student_profiles', 'student_admissions_profiles',
    'student_profile_portfolios', 'student_applications', 'student_readiness'] loop
    begin
      execute format('select count(*) from public.%I', t) into n;
      if n <> 0 then raise exception 'RLS FAIL: signed-out visitors can READ %', t; end if;
    exception when insufficient_privilege then null;  -- also fine: no access at all
    end;
  end loop;
end $$;

reset role;
do $$
begin
  if has_table_privilege('anon', 'public.beta_feedback', 'INSERT') then
    raise exception 'RLS FAIL: signed-out visitors can insert feedback directly, skipping Turnstile';
  end if;
  if has_function_privilege('anon', 'public.submit_verified_beta_feedback(text,text,text,text,text)', 'EXECUTE') then
    raise exception 'RLS FAIL: signed-out visitors can call the verified feedback function directly';
  end if;
end $$;

rollback;
