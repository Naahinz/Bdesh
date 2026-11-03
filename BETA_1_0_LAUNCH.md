# Bdesh Beta 1.0 — launch checklist
Updated: 4 November 2026

## Release decision
**Ready for a small, invitation-only supervised pilot, pending the manual analytics project choice and one short admin-inbox visual check.**
The website's primary student workflows have passed the owner's manual tests: Google login, two-account data isolation, saved learning, profiles, application tracker, mobile layout, export, unauthorized-admin rejection, and durable Supabase feedback submission.

Do not open an unrestricted public beta until server-side feedback anti-abuse protection, consent analytics verification, and basic support/incident procedures are complete.

## What is already implemented
- Supabase Google sign-in; student-owned records protected by row-level security.
- Structured learning, profile, university discovery, application/document deadlines and checklist, JSON export.
- 53 published college records; 42 records currently carry a verification date. Verification is not a guarantee of funding/eligibility.
- Durable student feedback form (no email delivery dependency).
- Restricted admin metrics dashboard backed by a verified Edge Function.
- Private admin feedback inbox with counts (new, reviewing, resolved), filtering, and status editing.
- Optional anonymous PostHog instrumentation using only allowlisted events after explicit consent; **disabled** pending selection of a project, its public token, and matching region.

## Remaining manual decisions/actions
1. **PostHog destination:** The connected PostHog account currently exposes only an ambiguously named **Default project**. Confirm that project is intended for Bdesh or explicitly choose/create a dedicated Bdesh project. Never mix Bdesh student events into an unrelated analytics environment. The project ingestion host/region must be taken from its actual settings.
2. **PostHog configuration:** Add only the public project token and correct ingestion host to `analytics-config.js` through an approved production setup. Never add personal API tokens or secret keys to website source.
3. **Consent test:** In a fresh/private window, verify zero PostHog requests before allowing analytics. After opt-in, verify only predefined event names/properties reach the correct project. Disable via Privacy page and check that subsequent events stop.
4. **Admin inbox test:** Log in with the authorized Bdesh account, open `/admin.html`, confirm New/Reviewing/Resolved counts and status-filter controls operate on a disposable feedback entry.
5. **Abuse prevention:** Before wider publication, add real server-side rate limiting and automated-bot protection for anonymous feedback (client-side throttling and honeypots do not stop direct API submissions). Configure Cloudflare Turnstile or a server-side Edge Function with trusted verification.
6. **Support protocol:** Assign one administrator to check the inbox daily during pilot; respond only to voluntarily provided reply addresses. Never request student banking, passport, tax, or account credentials through feedback.

## Pilot rollout
- **Wave 0 (owner QA):** Complete the checks above on the actual deployed site.
- **Wave 1 (10 students):** Invite a mix of HSC students and graduates; ask them to finish the learning first step, save a profile, shortlist two universities, and report confusion.
- **Wave 2 (up to 20 students):** Expand only after checking the feedback queue, database save errors, and no cross-account incidents.
- **Review:** Triage new feedback each day. Fix account and privacy issues before cosmetic changes. Track published college verification gaps separately.
- **Go/no-go:** Stop inviting users if another account's information is visible, submissions do not persist, or the public directory contains private sources.

## Beta invitation copy
> Bdesh is a free, student-led platform helping Bangladeshi students understand U.S. undergraduate admissions, organize their profiles, research funding opportunities and track applications. We're inviting a small group to test the early version. The site does not guarantee admission or financial aid, and you should verify college requirements on official sites. If you'd like to participate, try the learning guide and share what is confusing or broken through the Feedback page. Please do not upload passports, bank records or financial aid documents.

## Tester worksheet
For each tester, ask for voluntary **non-sensitive** responses:
1. Which page or step was hardest to understand?
2. Did learning progress and profile changes survive a reload?
3. Could you find a university and add an application?
4. Were admission and financial-aid deadlines clearly separate?
5. Was any wording misleading about international full funding?
6. What is one feature you would change first?

Do not collect student account passwords, SAT credentials, screenshots exposing financial details, or private essays as part of QA.

## Known limits
- PostHog events are not active while the project token/host are blank.
- Admin metrics and feedback are separate data sources; feedback inbox has personal data only voluntarily entered by senders.
- Large-scale anonymous feedback requires server-side rate limits, not only client-side checks.
- A database verification date is not a substitute for checking the institution's current admissions and aid pages.
- Cloudflare production rendering and Google-account workflows were tested by the owner, not by the assistant's browser tools.
