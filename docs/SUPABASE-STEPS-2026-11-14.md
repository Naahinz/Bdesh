# Supabase steps for the 2026-11-14 fixes

Do these in order, all in one sitting. Project: `xeqixwmulwonvhifcmvn`.
SQL Editor: Supabase dashboard → your project → **SQL Editor** → **New query**.
Steps 1–4 work with both the old and the new website code, so they are safe to do before the new code goes live.

## 1. Raise the profile size limits (audit item 1)

1. In this repo, open `supabase/migrations/20261114_expand_portfolio_jsonb_limits.sql`, copy all of it, paste it into the SQL Editor and click **Run**.
2. In a new query, run:

   ```sql
   select conname, pg_get_constraintdef(oid)
   from pg_constraint
   where conrelid = 'public.student_profile_portfolios'::regclass and contype = 'c';
   ```

3. **Pass:** `activities_check` shows `120000`, `honors_check` shows `40000` and `essays_check` shows `200000`, and nothing shows 32000, 12000 or 50000.

## 2. Run the privacy test (audit item 4)

1. Copy all of `supabase/tests/rls_test.sql` into a new query and click **Run**.
2. **Pass:** "Success. No rows returned" (you may also see two small `set_config` results).
   **Fail:** a red error starting with `RLS FAIL:`. Stop and send me that line. Do not go on until it passes.
3. The test only creates fake users inside a transaction that it rolls back. Nothing is kept.
4. Run it again after every future database change.

## 3. Export the live schema (audit item 3)

1. Copy all of `supabase/export_live_schema.sql` into a new query and click **Run**. It only reads.
2. Above the results, click **Export → Download CSV**.
3. Put the CSV in this project folder (any name, e.g. `live-schema.csv`) and tell me. I'll turn it into a baseline migration and review the security rules in it.

## 4. Update the two Edge Functions (audit items 5 and 11)

Dashboard → **Edge Functions**:

1. Open **submit-feedback** → **Code**. Replace everything with the contents of `supabase/functions/submit-feedback/index.ts` and click **Deploy**.
   - Keep **Verify JWT** turned **off** for this function, as it is now. The feedback form calls it without a login.
2. Open **admin-metrics** → **Code**. Replace everything with `supabase/functions/admin-metrics/index.ts` and click **Deploy**. Leave its settings as they are.
3. *(Optional; only needed when you add a new domain.)* Dashboard → **Edge Functions → Secrets** → add:
   - Name: `BDESH_ALLOWED_ORIGINS`
   - Value: `https://bdesh.pages.dev,https://bdesh.fyi` (list every domain the site is served from, comma-separated)

   If you don't set it, only `https://bdesh.pages.dev` is allowed, which is what you have today.

If you prefer the command line instead of the dashboard:

```bash
supabase functions deploy submit-feedback --project-ref xeqixwmulwonvhifcmvn --no-verify-jwt
```

```bash
supabase functions deploy admin-metrics --project-ref xeqixwmulwonvhifcmvn
```

## 5. Only if the site moves to a new domain (e.g. bdesh.fyi)

Skip this whole step while the site stays on `bdesh.pages.dev`.

1. Supabase → **Authentication → URL Configuration**: set **Site URL** to the new domain. Add `https://bdesh.fyi/**` under **Redirect URLs** and keep the old one until you switch over.
2. Cloudflare dashboard → **Turnstile** → your Bdesh widget → **Hostnames**: add `bdesh.fyi`.
3. Set the `BDESH_ALLOWED_ORIGINS` secret from step 4.3.

## 6. Put the new website code live

The fixes are on the `fix/audit-findings` branch, which isn't pushed yet. Once steps 1–4 pass, the branch gets merged into `main` and pushed, and Cloudflare Pages redeploys.

## 7. Check the live site (about 5 minutes)

- [ ] Homepage: the button says **Beta sign in**. Sign in with Google and it changes to **Sign out (your email)**.
- [ ] Workspace → **Prepare**: a **Your current class** picker is shown. Change it to *Class 12 / HSC*: the "FOCUS NOW" items change and the page says "Class saved". Reload and it stays.
- [ ] Workspace → **Discover**: open a college. "Official pages checked" links appear (they were hidden by a bug before).
- [ ] Profile → **Writing**: paste a long Bangla essay and save. Reload and it's still there.
- [ ] Add an application, set a deadline, then remove the application.
- [ ] Feedback page: send a test message and get "Feedback saved successfully".
- [ ] Admin page (as admin): the numbers and the 14-day chart load.
