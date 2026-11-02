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
- [ ] Individually verify **47 remaining US college research leads** and remaining non-US entries if offered.
- [ ] Independently test student isolation and editor authorization using two separate real test accounts, including unauthorized operations.
- [ ] Check Supabase Auth warning: leaked-password protection disabled. If enabling email/password accounts in the future, prioritize hardening.
- [ ] Independently verify Cloudflare Pages deployment of the privacy, terms, feedback and updated university cards.
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
