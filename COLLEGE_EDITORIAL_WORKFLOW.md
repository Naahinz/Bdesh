# Bdesh — College Editorial Workflow

## Access and security
The editor is at `/editor.html`. Access to shared records is enforced by Supabase RLS using `app_metadata.bdesh_role = "editor"`; ordinary students cannot edit shared university data. Never put authorization roles in user-editable metadata. The public directory displays published records; the editor can inspect drafts.

## Research protocol (to be carried out after product work)
1. Use the college's own undergraduate admissions and international financial aid pages as primary sources, not a third-party scholarship roundup.
2. Record relevant official URLs and concise evidence in **Evidence and source links**; set **Source last checked** on the day those pages were reviewed.
3. Distinguish need-based aid that meets demonstrated need from competitively awarded merit scholarships. A funding lead is never a guaranteed full ride.
4. Verify international eligibility, freshman status, testing policies, deadlines, aid requirements, coverage, renewal conditions, and admission cycle.
5. Mark **Last verified** only after evidence fields are completed and reviewed. Do not use the publication checkbox as a verification indicator.
6. Check published wording for ambiguity before saving. Editor updates to existing published records affect what students see.
7. Review the editor's change-history panel if a policy or deadline is disputed.

## Student privacy and functionality
- Do not place individual student information in shared university entries.
- Student application records are separate and protected by ownership-based RLS.
- Before a release, test sign-in, add/edit an application, consecutive checklist saves, a document-status change, download of a profile PDF, and the deadline center on desktop and narrow mobile screens.
- Treat `Save profile as PDF` as a local browser print workflow, not a third-party file upload.
- Verify Cloudflare Pages deployment and client-side behavior after any release.

## Audit history
`public.opportunity_change_log` is created and populated by a database trigger when an existing opportunity row changes. It stores old/new row snapshots and the authenticated editor ID. This is an internal administrative log, not a public feed. Existing historical edits before the trigger was installed cannot be reconstructed.
