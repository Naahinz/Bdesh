# Bdesh email/password registration — verified launch checklist

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
