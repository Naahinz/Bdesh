-- Reconstructed on 2026-11-14 from the live schema. These objects were created by hand
-- (see AUDIT_2026-11-03.md) and were missing from the migration history.
-- Already present in production; recorded there as applied, so it is only run on fresh databases.
create schema if not exists bdesh_private;
revoke all on schema bdesh_private from public, anon, authenticated;

-- Original (unsanitized) college source notes. Restricted database administration only.
create table if not exists bdesh_private.opportunity_evidence_archive (
  opportunity_id uuid primary key references public.opportunities(id) on delete cascade,
  original_source_notes text not null,
  archived_at timestamptz not null default now()
);
alter table bdesh_private.opportunity_evidence_archive enable row level security;

-- Public source notes may not contain private email addresses or Gmail links.
alter table public.opportunities
  add constraint opportunities_source_notes_no_private_email check (
    source_notes is null
    or source_notes !~* 'mail\.google\.com|gmail\.com|[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}'
  );
