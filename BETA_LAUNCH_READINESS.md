# Bdesh beta launch readiness — 3 November 2026

## Completed in this pass
- [x] Checked RLS enabled on 9 tables in the public schema.
- [x] Reviewed row-owner permissions for student records and admin-only permissions for shared college edits.
- [x] Revoked unnecessary client `TRUNCATE`, `TRIGGER` and `REFERENCES` grants, retaining necessary operations.
- [x] Confirmed public anonymous access is limited to published college records.
- [x] Confirmed editor change-log function cannot be executed directly by anonymous or authenticated clients.
- [x] Replaced outdated privacy notice with accurate disclosure of profile, essays, applications and deadlines.
- [x] Added terms and email-based feedback/correction pages and linked them from the main website.
- [x] Verified first four published university records against official sources: Harvard University, Massachusetts Institute of Technology, Princeton University, Yale University.
- [x] Stored official source references and reviewed dates in Supabase and preserved change history.
- [x] Repaired university research filter false positives from 'no merit' and exposed reviewed sources and deadlines to students.

## Remaining before unqualified public launch
- [ ] Individually verify the remaining **30 US college research leads** (21 verified, four partially reviewed and 26 not yet reviewed among 51 published US colleges) and any non-US entries, before removing beta labels.
- [ ] Complete real two-account browser isolation and editor authorization testing. Simulated Supabase role tests on 2026-11-03 returned 0 cross-account private rows, prevented non-editor college updates, and showed 0 unpublished records to anonymous visitors.
- [ ] Check Supabase Auth warning: leaked-password protection disabled. If enabling email/password accounts in the future, prioritize hardening.
- [ ] Independently verify Cloudflare Pages deployment of privacy, terms, feedback and updated college cards; the public browser fetch was inaccessible to the automated checker.
- [ ] Review the privacy notice and terms for relevant laws and organizational commitments; they are working beta disclosures, not a professional legal review.
- [ ] Test the full workflow under network errors and repeat saves; add recovery for any discovered failures.
- [ ] Add a self-service account deletion option or a reliable documented manual request process with a retention policy before a larger launch.
- [ ] Review accessibility with real keyboard and screen-reader navigation, not just CSS.
- [ ] Confirm that newly published sources and deadline information refer to the intended admission cycle.

## Current safe public messaging
Bdesh is a **free public beta**. The guide and planner are educational. Bdesh is not a university application submission platform and offers no guarantee of admission or funding. Unverified entries remain explicitly labeled as **research leads**. Students should check official admissions and financial-aid sites.

## Data reviewed November 3, 2026
1. Harvard: https://college.harvard.edu/financial-aid/how-aid-works and https://college.harvard.edu/financial-aid/apply-financial-aid/prospective-students
2. MIT: https://sfs.mit.edu/undergraduate-students/apply-for-aid/international/ and https://mitadmissions.org/apply/firstyear/deadlines-requirements/
3. Princeton: https://admission.princeton.edu/apply/international-students and https://admission.princeton.edu/apply/standardized-testing
4. Yale: https://admissions.yale.edu/international and https://admissions.yale.edu/standardized-testing

### Guardrails
Do not infer automatic full-ride eligibility from 'meets full demonstrated need'. Do not pre-fill a student's own application deadlines from generic website content without verifying their admissions round, entry year and local timezone. Do not store student data in public college records. Never treat a `verified_at` date as permanent: policies and dates change.


## 2026-11-03 extended verification update
- Verified 11 of 51 published US college records with official sources and review dates: **Harvard, MIT, Princeton, Yale, Brown, Bowdoin, Williams, Wesleyan, Stanford, Berea, Pomona**.
- Partially researched but **not** marked verified: **Dartmouth** (official RD admission deadline pages conflict), **Amherst** (current international financial aid deadlines not confirmed), **Swarthmore** (current international aid documents and deadlines require confirmation). Their evidence is stored with `source_checked_at`, but `verified_at` remains null.
- Corrected the university explorer's merit route classification and added a source-details section that distinguishes fully verified, partially reviewed, and unreviewed records.
- Verified read-only/ownership protections using simulated anonymous and authenticated SQL roles. An anonymous SELECT of private student records was denied; simulated unrelated user saw zero student applications, portfolios, and admissions profiles. Noneditor attempted college update returned zero rows and anonymous SELECT found zero unpublished college records. This does **not** replace an actual two-account integration test.
- Live browser checker could not open the Cloudflare Pages domain, so visual deployment verification still requires a user browser session.
- **Security warning:** Supabase advisor reports leaked-password protection disabled. Email/password signup is currently hidden on homepage; if reenabled, update setting in Supabase Auth.
- **Important deadline exceptions:** Brown does not accept ISFAA as CSS substitute; Bowdoin and Williams request aid paperwork from international students after admission; Berea international deadline is November 30 and accepted students face a deposit; Pomona and Swarthmore are international need-aware; Wesleyan permits ISFAA if CSS fees are unaffordable; Dartmouth testing has multiple accepted options for international students.

## 2026-11-03: feedback delivery and college search redesign
- [x] Enlarged Applications university lookup into its own distinct full-width glass panel; all database-first search functionality preserved.
- [x] Redesigned Discover university search to span the full card, with compact filters on the next row.
- [x] Replaced feedback mailto-only experience with a full feedback form (topic, optional reply email, required text).
- [x] Added JavaScript AJAX email routing to **eftekhernahin@gmail.com** through `formsubmit.co`; does not require visitors to open their own email clients.
- [x] Added client validation, async progress, explicit success/failure/activation messages, honeypot field, and fallback mailto link.
- [x] Updated privacy notice to disclose use of the external form-to-email provider.
- [x] **User-confirmed feedback test (2026-11-03):** User reported that the feedback form and delivery work. FormSubmit activation and end-to-end mail flow are considered checked by the recipient, but not independently verified by the backend connector.
- [ ] Verify rendered search cards and feedback form on desktop and mobile. Repository source checks are not substitutes for live browser testing.

## 2026-11-03 follow-up: international admissions verification
- Verified and source-dated six additional US directory entries: Macalester, Reed, University of Richmond, University of Chicago, Grinnell, Wellesley.
- Partially reviewed Northwestern with `verified_at = NULL` because published university admission and financial aid pages show inconsistent 2027 financial-aid deadlines.
- As of this review, expected **17 verified of 51 published US entries**, with **4 partial reviews** (Amherst, Dartmouth, Northwestern, Swarthmore), remaining 30 not checked.
- Key findings: Macalester requires free 2027–28 ISAFA or CSS plus separate financial declaration; Reed permits hardship ISFAA and is test-blind; Richmond requires an international financial-responsibility certificate and CSS; UChicago uses its own aid worksheet and does not use CSS/IDOC; Grinnell accepts a portal ISAFA but not emailed/PDF forms; Wellesley asks international students for CSS only if prompted by staff.
- Source dates, test policies, aid coverage, round-specific deadlines and caution notes are stored with each corresponding opportunity record. No applicant/student data was changed.

## 2026-11-03 subsequent verification batch
- Added full official-source reviews and current-cycle funding/deadline notes for: **Cornell University, University of Pennsylvania, Hamilton College, Colby College**, in addition to Macalester, Reed, Richmond, UChicago, Grinnell and Wellesley in the previous batch.
- Cornell and Penn require SAT/ACT for fall 2027 applicants, and both use need-aware international admissions (with different dates and support terms).
- Cornell's international CSS aid application due dates are Nov 1 / Jan 2, earlier than its domestic aid priority dates; Penn's international aid priority dates are Nov 6 / Feb 5 for aid offers alongside admission.
- Hamilton requires a financial certification of every international applicant and separate aid paperwork from aid applicants; Colby offers hardship CSS fee waivers for international students.
- **Northwestern remains a partially reviewed record** (admissions vs aid pages give conflicting aid deadlines); do not silently infer the required submission date. Other partial reviews: Amherst, Dartmouth and Swarthmore.
- The feedback form's end-to-end submission and inbox receipt were **confirmed by the user** after one-time activation; no additional manual activation is pending.
- Current directory target totals: **21 verified / 4 partial / 26 unchecked** of 51 published US opportunities.
