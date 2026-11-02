> **CURRENT DECISION (3 NOVEMBER 2026): GOOGLE SIGN-IN ONLY.** Bdesh has removed the password form and temporary `?email-test=1` signup controls. The detailed SMTP and signup steps below are **deferred reference material**, not an active testing procedure. Reimplement the signup UI only after a domain and transactional sender are configured, then test with a non-team account before opening registrations.

# Bdesh email/password registration — verified launch checklist

## SELECTED TEMPORARY SMTP SENDER — Gmail (`eftekhernahin@gmail.com`)

**Selected by project owner on 3 November 2026. Configuration requires owner-only dashboard access and has NOT yet been completed or tested.** This is a temporary, lower-volume sender, not a recommended long-term public transactional-email service. Use the official Bdesh site `https://bdesh.pages.dev` for login redirects, and keep Google OAuth sign-in enabled.

### Step A: Create a Google app password (owner-only)

1. Sign in to the Google account `eftekhernahin@gmail.com`. Confirm the mailbox is accessible and has **2-Step Verification** enabled at https://myaccount.google.com/security.
2. Open https://myaccount.google.com/apppasswords while signed into **that exact account**. If the App Passwords option is unavailable, check that this Google account permits app passwords (Advanced Protection, work/school policy or security-key-only 2SV can block this option).
3. Name the app password `Bdesh Supabase SMTP` and create it. It is a special 16-character password distinct from the normal Google password. Enter it **only in Supabase's SMTP password field**. Never paste the app password into ChatGPT, Github, a screenshot, or client-side JavaScript. If exposed, revoke it immediately from Google App Passwords.

### Step B: Enter these exact fields in Supabase

Open https://supabase.com/dashboard/project/xeqixwmulwonvhifcmvn/auth/providers or the dashboard's **Authentication → SMTP Settings** / **Authentication → Email → SMTP** area (Supabase dashboard labels may differ). Enable **Custom SMTP** and save:

| Supabase SMTP setting | Value |
|---|---|
| Sender email address | `eftekhernahin@gmail.com` |
| Sender name | `Bdesh` |
| SMTP host | `smtp.gmail.com` |
| SMTP port | `465` (implicit SSL/TLS preferred); use `587` with STARTTLS if necessary |
| SMTP username | `eftekhernahin@gmail.com` |
| SMTP password | **Google app password from Step A** (secret, never the regular Gmail password) |

**Do not** use `smtp-relay.gmail.com`; that is a different Google Workspace relay product requiring different policy configuration. Keep **Confirm email** ON and **Allow email signup** ON under the Email Auth provider settings. In **Authentication → URL Configuration**, set Site URL to `https://bdesh.pages.dev`, and allow redirect to `https://bdesh.pages.dev/` (plus only other trusted paths actually needed). Avoid localhost and Cloudflare preview URLs for production users.

### Step C: Test before public activation

1. Save SMTP settings in Supabase. Do not send credentials to the assistant.
2. From a **new, non-project-team email mailbox**, visit https://bdesh.pages.dev/?email-test=1&signin=1, choose **Create an account**, and enter a new 12+ character password. The test switch only reveals the frontend form; it does not bypass Supabase's email verification.
3. Confirm that the email arrives from `eftekhernahin@gmail.com` and its link returns to Bdesh. Check spam as well as inbox.
4. Complete confirmation, sign in, and confirm that another student's data does not appear in the new account.
5. From the same test flow, use **Forgot password?** and verify the reset email arrives, opens the website, and changes the password.
6. Re-check Google sign-in, then enable public signup in `auth.js` (`emailRegistrationReady=true`) only after the full smoke test and password-security checks pass.

### Security and deliverability notes

- Google discourages app passwords for services that support modern OAuth. This is a temporary workaround when Supabase requires SMTP credentials, and app passwords bypass Google's 2-Step Verification for that integration. Limit access to the dedicated app password and revoke it when moving to a transactional email provider.
- Google can rate-limit or block bulk/automated sending. Keep Supabase SMTP rate limits conservative and use CAPTCHA for signup before a wider public beta; monitor deliverability and bounce rates. Plan migration to a verified-domain sender (Resend/Postmark/etc.).
- The connected Gmail account `nahineftekher@gmail.com` used for university correspondence is **different** from the chosen SMTP sender `eftekhernahin@gmail.com`. Do not substitute one for the other.
- The current Supabase security advisor reports **leaked-password protection disabled**; enable it when available before public email signup.

Official references: https://supabase.com/docs/guides/auth/auth-smtp · https://supabase.com/kb/troubleshooting/using-google-smtp-with-supabase-custom-smtp-ZZzU4Y · https://support.google.com/mail/answer/185833 · https://support.google.com/mail/answer/7104828

---


**Status 3 November 2026:** Google sign-in works. Password sign-in for **existing email/password users** is exposed again on the homepage. New email account creation and password-reset requests remain intentionally gated while Supabase has no production-ready mail sender. The browser code is prepared; the mail infrastructure is the blocker, not a missing HTML signup form.

## Why the built-in Supabase mailer cannot support student signups

Supabase's project-default mailer sends email only to authorized organization-team addresses and limits project-wide email sending to **2 messages per hour**. Other students receive `email_address_not_authorized` or `over_email_send_rate_limit`. Switching off email confirmation would cause Supabase to assume every claimed address is verified; **do not do this**.

Official docs: https://supabase.com/docs/guides/auth/auth-smtp and https://supabase.com/docs/guides/auth/testing-auth-flows

## Recommended production setup — verified domain + Resend

**Manual setup by the project owner (secret keys stay in the providers' dashboards; NEVER commit them to GitHub or send them in chat):**

1. Have a domain Bdesh controls in DNS. The hosted `bdesh.pages.dev` address is the website URL, **not a domain whose DNS Bdesh controls for email sending**. A sender could be `no-reply@mail.your-bdesh-domain.example` only after registering/controlling a real domain.
2. Create a Resend account at https://resend.com; add the sender domain and complete required SPF/DKIM/DMARC DNS verification (Resend supplies exact records; do not guess them).
3. Create a Resend API key restricted to sending email, if available.
4. In the **Supabase project** `xeqixwmulwonvhifcmvn`, open **Authentication → SMTP Settings** and enable **Custom SMTP**:
   - Sender email: `no-reply@<verified-sender-domain>` (replace placeholder)
   - Sender name: `Bdesh`
   - Host: `smtp.resend.com`
   - Port: `465` (SSL) or `587` (TLS)
   - Username: `resend`
   - Password: the Resend API key; **do not** put it in any frontend file.
   - See official provider setup: https://resend.com/changelog/smtp-service
5. In **Supabase Authentication → Sign In / Providers → Email**, keep **Allow new users to sign up** on, **Confirm Email** on, **Email provider** enabled, and do not change Google provider settings.
6. In **Authentication → URL Configuration**, use production **Site URL** `https://bdesh.pages.dev` and allow the exact redirect `https://bdesh.pages.dev/`. If account journeys from other paths need verification links, allow only the exact trusted paths or `https://bdesh.pages.dev/**` after reviewing this domain's use.
7. In **Authentication → Rate Limits**, use a sensible limit appropriate to the SMTP provider. Supabase typically starts custom SMTP projects at 30 emails/hour. Keep anti-abuse protections. Enable **Leaked Password Protection** in the password security controls when available; Supabase's current security advisor warns it is disabled.
8. Configure templates for Confirm Signup, Reset Password and Change Email if desired. The confirmation and reset links must point back to the production URL, not `localhost` or a preview host. No need to customize before a test, unless current templates are wrong.

### Temporary option if there is no owned domain

An administrator can use a supported third-party SMTP account with a sender that they control, such as Google SMTP with a dedicated account + 2-Step Verification and a Google **app password**, configured **only inside Supabase**. Official Supabase explanation: https://supabase.com/kb/troubleshooting/using-google-smtp-with-supabase-custom-smtp-ZZzU4Y. This is less scalable and less reliable for public signup; migrate to an authenticated domain sender before broad launch. Do not use the regular Google login password, and never store any app password in code.

## Smoke test before changing signup state

Use a **real, non-project-team email address** that is not already registered, with explicit consent from its owner:

1. Verify custom SMTP test email succeeds and the sender is not blocked.
2. Open **https://bdesh.pages.dev/?email-test=1&signin=1** to activate only the UI smoke-test switch, then select **Create an account**. This parameter does not bypass Supabase confirmation or rate limits.
3. Check that the expected confirmation email arrives and links back to `https://bdesh.pages.dev/`.
4. Confirm and then sign in with email/password. Ensure a new student sees an empty private profile, not someone else's data.
5. Sign out and sign back in.
6. Run **Forgot password**, open the reset link, set a new password and confirm old password fails/new one works.
7. Confirm Google OAuth accounts still work.
8. Test an unknown email/password sign-in, signup with an existing email, and bad email address. Responses must not reveal unnecessary account-existence details.

Only **after** the successful flow, set `emailRegistrationReady=true` near the top of `auth.js` and change the homepage help text and cache-bust `auth.js?v=...`. Existing-account email sign-in can be used while the gate is closed. Anyone toggling this prematurely will send public users into the default-mailer limitations.

## Why we won't bypass email confirmation

A verified email address is essential for password resets, account recovery, and preventing impersonation. Disabling it merely hides the original problem while risking student account misuse.

## Remaining manual actions

- Establish SMTP credentials and a verified sender through the service/dashboard.
- Confirm production Site URL and redirect allowlist in Supabase.
- Run end-to-end registration and recovery tests with a non-team mailbox.
- Then enable public email signup flag in the site.

## Smoke-test behavior as committed
- Public homepage: Google sign-in and existing email-password sign-in are offered, but **new email signup and reset-email sending are gated** until SMTP is verified.
- Test-only UI path: `https://bdesh.pages.dev/?email-test=1&signin=1` displays the otherwise-gated signup and password reset controls. This is **not a security control**; any visitor could add the query parameter, and Supabase remains the authoritative account/confirmation gate. Do not use this before configuring SMTP or to skirt rate limits.
- If a signup fails with `email_address_not_authorized` or `over_email_send_rate_limit`, it indicates delivery is still falling back to Supabase's limited default mail service. Review SMTP settings, mail-provider verification, and project rate limits; never turn off email confirmation as a workaround.
- On a successful two-account smoke test, update `emailRegistrationReady` to `true` and revise homepage copy, then remove the temporary test-mode switch in a follow-up hardening pass.
