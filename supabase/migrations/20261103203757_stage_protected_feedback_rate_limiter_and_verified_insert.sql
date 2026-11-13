-- Copied verbatim from the live migration history (supabase_migrations.schema_migrations).
create table if not exists bdesh_private.feedback_rate_buckets (
 client_hash text not null check (length(client_hash)=64),
 bucket_start timestamptz not null,
 hits integer not null default 1 check (hits between 1 and 3),
 primary key (client_hash,bucket_start)
);
alter table bdesh_private.feedback_rate_buckets enable row level security;
revoke all on bdesh_private.feedback_rate_buckets from public,anon,authenticated;
create or replace function public.submit_verified_beta_feedback(
 p_category text, p_message text, p_reply_email text,
 p_page_path text, p_client_hash text
) returns text
language plpgsql security definer set search_path = ''
as $$
declare v_hits integer; v_bucket timestamptz;
begin
 if p_client_hash is null or p_client_hash !~ '^[0-9a-f]{64}$' then
  return 'invalid';
 end if;
 if p_category not in ('Bug or broken feature','Incorrect university information','Suggestion or new idea','Other feedback')
    or length(btrim(coalesce(p_message,''))) not between 12 and 5000
    or p_page_path <> '/feedback.html'
    or (p_reply_email is not null and (length(p_reply_email)>254
       or p_reply_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')) then
  return 'invalid';
 end if;
 v_bucket := to_timestamp(floor(extract(epoch from clock_timestamp())/900)*900);
 insert into bdesh_private.feedback_rate_buckets(client_hash,bucket_start,hits)
 values(p_client_hash,v_bucket,1)
 on conflict (client_hash,bucket_start) do update
 set hits=bdesh_private.feedback_rate_buckets.hits+1
 where bdesh_private.feedback_rate_buckets.hits<3
 returning hits into v_hits;
 if v_hits is null then return 'rate_limited'; end if;
 insert into public.beta_feedback(category,message,reply_email,page_path)
 values (p_category,btrim(p_message),nullif(btrim(coalesce(p_reply_email,'')),''),p_page_path);
 return 'saved';
end;
$$;
revoke all on function public.submit_verified_beta_feedback(text,text,text,text,text) from PUBLIC,anon,authenticated;
grant execute on function public.submit_verified_beta_feedback(text,text,text,text,text) to service_role;
