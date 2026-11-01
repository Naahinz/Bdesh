# Bdesh backend setup (pending Nahin's separate Supabase connection)

## State

- Website and code: deployed on Vercel; source hosted in `Naahinz/Bdesh`.
- Supabase: **not connected in this session**. Connector returned `link_id must identify an eligible linked account`. No database project or tables have been created.
- This folder contains a *draft migration*, not evidence of a deployed backend.

## After connecting Nahin's Supabase account

1. Verify the account and organization name in the Supabase connection. Do not use Foysal's existing organization by default.
2. Create a separate project named `bdesh` in Nahin's organization, preferably in a nearby supported region.
3. Review `supabase/migrations/20261101_initial_schema.sql` before applying.
4. Apply migration through a secured database administration channel.
5. Verify row-level security policies and test with two different signed-in users before enabling accounts.
6. Configure signup/guardian consent and account deletion controls, particularly for students who may be under 13.
7. Put the project URL and **publishable** client key in Vercel environment variables; never commit secret keys or a service role key.
8. Add client authentication and test signup, sign-in, sign-out, password recovery, progress saving across devices, and isolation between users.

## GitHub → Vercel linking

The Vercel team currently cannot access `Naahinz/Bdesh`: the attempt to create a Git-connected deployment returned `repo_no_access`. A GitHub owner must grant the Vercel GitHub App access to this repository; alternatively, move hosting to Nahin's own Vercel account.

Until this is fixed, GitHub commits do **not** trigger deployment automatically. Updating code in the repository is separate from manually deploying to Vercel.

## Scope and trust

Undergraduate-only, NCTB-first, Bangla-first. Publish only scholarships whose details have been manually checked against official pages; store a last-verified date. Do not promise full rides or eligibility.

Keep student profile data minimal. No passports, income proofs, or exact residential address in MVP.
