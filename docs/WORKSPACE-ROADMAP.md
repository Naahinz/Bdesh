# Bdesh — Integrated undergraduate admissions workspace

## Delivered in first workspace build (2026-11-01)
- `/workspace.html`: single signed-in home for preparation, profile, research and application tracking.
- 17 readiness milestones with not started / in progress / completed / not relevant statuses, persisted per Google account.
- Reusable academic profile: school, year, SSC/HSC GPA, optional SAT and English testing, majors, destination preferences, activities, honors and broad funding needs.
- Research tool using the *six official-source starting links* already in the Supabase opportunities table. It provides transparent research prompts; it is **not AI**, a scholarship eligibility decision, a full-ride guarantee, or an admissions chance predictor.
- Application tracker with university name, application round, independent application and aid deadlines, status and per-application task checklists.
- All student tables have RLS restricted to the signed-in user's UID; API uses only Supabase publishable key. No service-role key in the frontend.
- Database migration at `supabase/migrations/20261101_admissions_workspace.sql`.

## Important not yet delivered
- AI model integration, verified university-by-university scholarship policies and live deadlines, Common App import/integration, document uploads, reminders, admin interface, automatic scholarship verification, full Bangla translation, and independent third-party security testing.
- Proper age-aware onboarding and guardianship/consent for minors, verified privacy policy and self-service account deletion. Do **not** market as a fully compliant public launch until these are addressed.
- Server-side cost controls and safe prompt/data-handling policies for any future AI model.
- Test actual Netlify auto-deploy and a fresh browser: sign in, open /workspace.html, edit profile, set milestone, add application, refresh, sign out and sign back in. Test RLS for two distinct user identities before inviting external students.
- Existing homepage checklist remains separate from the richer workspace readiness milestones; consider a future unified dashboard.

## Free-first implementation policy
Do not add paid APIs, credit-card-required deployment services, or AI model calls without Nahin's approval. Start with explainable filters and official links. Never infer admission likelihood or guarantee a scholarship.
