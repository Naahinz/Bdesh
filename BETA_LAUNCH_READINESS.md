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
- [ ] Individually verify the remaining **40 US college research leads** (11 verified of 51; three of those 40 partially reviewed) and any non-US entries, before removing beta labels.
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
