> **Authentication update (3 NOVEMBER 2026):** Google OAuth is the only Bdesh frontend sign-in method for now. All email/password and `email-test` test controls have been removed. The SMTP and password-signup instructions below are future work, not currently available controls. PostHog and the protected admin dashboard remain separate from the login choice.

# Bdesh — Admin Analytics & Transactional Email Launch

Last updated: 3 November 2026. Static site on Cloudflare Pages, PostgreSQL/Auth on Supabase.

## 1. Implemented (already in GitHub and Supabase)
- `/admin.html`: private dashboard; values are fetched from `admin-metrics` Supabase Edge Function, not from broad database public grants.
- `/admin.js`, `/admin.css`: registered users, recent sign-ins, completed lessons, profiles, tracked applications, signup trends and directory verification.
- `supabase/functions/admin-metrics/index.ts`: bearer-token check, server-side `auth.getUser(token)`, checks immutable-to-users Auth `app_metadata.bdesh_analytics_admin===true`, aggregates data using server-only service role key, allows only `https://bdesh.pages.dev` CORS, returns counts only. No names/emails/application text returned.
- Edge function deployed under slug `admin-metrics` with JWT verification **enabled**. No arbitrary user may browse student application data.
- Only `nahineftekher@gmail.com` has the server-side analytics-admin flag at this time. The editorial role remains separate. Do not assign admin permission to other accounts without explicit approval.
- `/analytics.js`, `/analytics-config.js`, `/analytics.css`: PostHog setup with opt-in notice; no analytics SDK loaded and no event capture until the owner configures a valid public project token and the visitor accepts tracking.
- No session replay, form autocapture, automatic pageviews, names, emails, essays, university names, grade values or student IDs transmitted to PostHog. Only explicitly allowed event names and limited milestone numbers/sections; URL/referrer properties are removed.
- Privacy notice includes the optional analytics policy. The key chosen in the browser is **not** a secret; never use a PostHog personal API key.

## 2. PostHog activation (owner action)
1. Sign in to https://posthog.com and open your intended PostHog **project**.
2. In **Project Settings**, copy the **Project API key / project token** (typically begins `phc_`), NOT a personal API key. Note its **data region** (US or EU).
3. Edit `analytics-config.js` in `Naahinz/Bdesh` on GitHub:
   ```js
   window.BDESH_ANALYTICS = Object.freeze({
     projectKey: 'phc_YOUR_PUBLIC_PROJECT_TOKEN',
     apiHost: 'https://us.i.posthog.com' // or https://eu.i.posthog.com if EU project
   });
   ```
4. Commit changes; check Cloudflare Pages deploy.
5. Open Bdesh in a new private window, consent to analytics, then visit `/learn.html` and mark one lesson complete. The events should appear in PostHog's Live Events within the current ingestion delay.
6. Decline in a second browser: no SDK should load and no PostHog requests should be sent.
7. Build PostHog insights: unique consented visitors by page, lesson views/completions, profile saves, application additions, step-to-step funnel. The metrics will differ from total traffic because users may decline analytics. All named events are `bdesh_...`.

Events currently captured when consented:
- `bdesh_page_viewed` (safe fixed page slug)
- `bdesh_section_viewed` (fixed list of section IDs)
- `bdesh_lesson_viewed` (chapter index only)
- `bdesh_lesson_completed` (chapter index only)
- `bdesh_profile_saved` (no field values)
- `bdesh_application_added` (no university name or application content)

PostHog official documentation: https://posthog.com/docs/libraries/js and https://posthog.com/docs/product-analytics/autocapture.

## 3. Supabase analytics admin dashboard
- Visit https://bdesh.pages.dev/admin.html after signing into Bdesh with `nahineftekher@gmail.com`.
- Click **Refresh metrics** to recalculate counts on demand. A private full aggregate endpoint exists at `https://xeqixwmulwonvhifcmvn.supabase.co/functions/v1/admin-metrics`; do not expose the secret key or change the verified-user role check.
- Unauthorized students must get an HTTP 403 response from the function. The static page can be loaded by anyone but shows no sensitive counts unless authorized.
- The dashboard is linked from `editor.html`; it does **not** show individual users, email addresses, application contents, or financial details.
- The admin page uses a **user JWT**, not an API secret, for access. Supabase's server-side service credential is available only inside the Edge Function.

## 4. Proper signup confirmation email: transactional SMTP (owner action)
The earlier Gmail SMTP attempt failed with Google error **535 5.7.8 Username and Password not accepted**. Do **not** keep trying Gmail account passwords or disable Supabase email confirmation.

**Recommended provider:** Resend (or Postmark/Brevo), with a sending domain controlled by Bdesh. `bdesh.pages.dev` belongs to Cloudflare; its DNS cannot generally be modified by Bdesh for SPF and DKIM verification. A distinct domain Bdesh owns is required to use a brand-specific sender.

1. Buy/choose a domain you administer. Example: a real owned domain like `bdesh.example` is only a placeholder—do **not** use it literally.
2. Create an account at https://resend.com, add your owned domain as a **sending domain**. Apply the exact DNS records supplied by Resend. Wait for SPF/DKIM verification to show success.
3. Create a Resend **sending API key**. Do not paste the key into ChatGPT or commit it to GitHub.
4. Open https://supabase.com/dashboard/project/xeqixwmulwonvhifcmvn/auth/smtp. Set **Custom SMTP enabled** and enter:
   - Sender name: **Bdesh**
   - Sender email: **no-reply@YOUR_VERIFIED_DOMAIN**
   - SMTP host: **smtp.resend.com**
   - Port: **465** for SSL/TLS or **587** for STARTTLS
   - Username: **resend**
   - Password: **the Resend sending API key** (private in Supabase dashboard)
5. Save changes, keep **email confirmation required** and signups enabled in Supabase Auth > Email provider.
6. Auth > URL Configuration: Site URL `https://bdesh.pages.dev`, redirect allowlist `https://bdesh.pages.dev/` and relevant exact paths as needed. Do not use localhost or random preview URL for live emails.
7. Auth > Password Security: enable leaked-password protection if available (a Supabase security-advisor warning currently reports it disabled), and configure appropriate CAPTCHA/rate limits before large-scale public signup.
8. Test on https://bdesh.pages.dev/?email-test=1&signin=1 using a **new non-project-team mailbox**: signup -> receive confirmation -> click to confirm -> email login -> logout/relogin -> password reset email -> new password login. Check spam/deliverability. Confirm Google OAuth remains intact.
9. Only after successful test, flip `emailRegistrationReady=true` inside `auth.js`, update homepage wording, remove public test switch, cache-bust the auth script and test again.

Resend documents: https://resend.com/docs/send-with-smtp and https://resend.com/docs/dashboard/domains/introduction.
Supabase documents: https://supabase.com/docs/guides/auth/auth-smtp.

## 5. Acceptance checklist
- [x] Server-side admin role assigned only to Nahin.
- [x] Edge metrics endpoint deployed with JWT auth.
- [x] Admin page and link committed.
- [x] Static PostHog event hooks committed with opt-in tracking.
- [ ] **Owner:** supply/configure public PostHog project token and correct US/EU host; verify consented ingestion.
- [ ] **Owner:** verify domain and configure Resend (or another transactional SMTP provider); do not share secret.
- [ ] **Owner:** end-to-end non-team email signup and reset test.
- [ ] **Owner:** admin dashboard live test after signing into Bdesh, including refresh, unauthorized test in a second account.
- [ ] Enable public email registration only after full confirmation flow works.
- [ ] Independent Cloudflare deployment/rendering verification. Repository commits are not proof of a production deploy.

Current site still has working Google OAuth and existing email/password login. Public new email registration remains gated until the SMTP requirement is met.
