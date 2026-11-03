# Bdesh feedback abuse protection — staged activation

Updated: 4 November 2026

## State as of this document
**STAGED, NOT YET ACTIVE FOR SITE VISITORS.** The existing working feedback form continues using the original Supabase `beta_feedback` INSERT route. The feature flag in `feedback-security-config.js` is deliberately `enabled: false`.

Already implemented:
- Public Supabase Edge Function `submit-feedback` version 2 (intentionally `verify_jwt=false` because unauthenticated visitors can submit).
- Strict allowed Origin `https://bdesh.pages.dev`, maximum input sizes, category validation, and a server-only RPC.
- Cloudflare Turnstile Siteverify token validation, including exact hostname `bdesh.pages.dev` and action `bdesh_feedback`. A token is one-time and expires after roughly five minutes.
- Fail-closed behavior: without `BDESH_TURNSTILE_SECRET`, the endpoint returns `server_not_configured` and does not write feedback.
- Privacy-minded best-effort rate limiting: per server-derived visitor IP hash, at most **3 verified submissions in a 15-minute fixed window**, using an atomic Postgres conflict update. Only the HMAC hash is stored in `bdesh_private.feedback_rate_buckets`; raw IPs are not stored by this feature. Gateway address headers are not a perfect abuse identity; Turnstile is the primary defense.
- `public.submit_verified_beta_feedback(text,text,text,text,text)` callable only by `service_role`. Anonymous and authenticated accounts cannot call the verified insert function. Sensitive credentials remain exclusively in Supabase secrets.
- Frontend Turnstile widget and secure submit flow, **disabled by the feature flag** to preserve existing working submissions. No fallback to the direct database insert once protected mode is enabled.

## Manual setup — credentials must never be shared in chat or GitHub

1. In [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile), create a widget for **bdesh.pages.dev** using Managed mode. Copy its **public sitekey**. Keep its **secret key** private.
2. In the [Supabase Edge Functions secrets](https://supabase.com/dashboard/project/xeqixwmulwonvhifcmvn/functions/secrets) for this project, add secret name **`BDESH_TURNSTILE_SECRET`** with the secret value. Save it in Supabase, not as a GitHub file or chat message. No function redeploy is needed after adding the secret.
3. Update `feedback-security-config.js`: paste only the **public sitekey** into `siteKey`, and set `enabled: true` (after the backend secret exists). `feedback-protected.js` will then load and render the Turnstile widget explicitly. It must send the action `bdesh_feedback`. Wait for the Cloudflare deployment.
4. **Validate before locking down the old route:** Submit one harmless message at https://bdesh.pages.dev/feedback.html, confirm `Feedback saved successfully`, and confirm it appears in the authorized admin feedback inbox. Also attempt a second submission to check the widget resets properly. Confirm a failed or missing challenge cannot submit through the protected route. Validate again on a private/incognito browser.
5. **Important mandatory cutover, before large public access:** Direct anonymous INSERT into `public.beta_feedback` still bypasses Turnstile. After step 4 passes, run the following in Supabase SQL Editor. This closes that bypass. Do **not** do this before successfully testing the new protected path.

```sql
begin;
revoke insert on public.beta_feedback from anon, authenticated;
revoke insert (category,message,reply_email,page_path) on public.beta_feedback from anon, authenticated;
drop policy if exists "Public feedback submission" on public.beta_feedback;
commit;
```

6. Confirm anonymous browser calls to `/rest/v1/beta_feedback` can no longer INSERT even with a publishable key, but the new Edge Function still saves a verified submission. If the latter fails, retain the secure block and investigate rather than reopening public writes. Visitors are offered a direct-email/copy fallback.
7. Test an invalid challenge, repeated/expired token, >3 verified attempts per 15-minute bucket, the admin inbox and ordinary student workspace. Review Supabase function logs, without exposing message contents.

## Cutover verification queries

```sql
select
  has_table_privilege('anon','public.beta_feedback','INSERT') as anon_table_insert,
  has_column_privilege('anon','public.beta_feedback','category','INSERT') as anon_column_insert,
  has_function_privilege('anon','public.submit_verified_beta_feedback(text,text,text,text,text)','EXECUTE') as anon_rpc_execute,
  has_function_privilege('service_role','public.submit_verified_beta_feedback(text,text,text,text,text)','EXECUTE') as server_rpc_execute;
```

Expected after cutover: `false, false, false, true`.

## Rollback
If the widget fails during configuration **before** step 5, switch `enabled: false` and the original feedback form continues working.

**After step 5**, never restore unrestricted anonymous INSERT simply to bypass bot protection. Troubleshoot Turnstile/sitekey/Edge Function and leave the email/copy fallback usable. If Turnstile must be paused, introduce an alternative server-verified anti-abuse gate first.

## Implementation notes
- Do not put `BDESH_TURNSTILE_SECRET`, a Supabase secret key or legacy service-role JWT into static HTML/JS.
- The fixed-window quota is not a substitute for volumetric CDN/API rate protection; configure gateway limits and monitor function invocations before high-traffic release.
- `https://bdesh.pages.dev` and hostname `bdesh.pages.dev` are currently fixed in the Edge Function. Any future custom domain requires a reviewed allowlist update, new Turnstile hostname authorization and re-test.
- Client-side honeypot/browser throttling still exist, but only server challenge verification and backend rate limiting count as meaningful bot protection.
- Do not add analytics to the feedback payload. Keep private messages out of PostHog.
