# Product Requirements Document (PRD)
## Mini Issue Tracker — "Engineering Ledger"

**Document status:** Draft for greenfield build
**Scope:** This project is being built **from scratch** (backend + frontend + shared package). This PRD defines what to build, using a previously-built version of the same product idea as a functional/architectural reference, and a set of approved design mockups as the visual spec.

---

## 1. Overview

### 1.1 What this product is

Mini Issue Tracker is a web application for small engineering teams to track issues across workspaces and projects — similar in spirit to Jira or Linear, but intentionally simpler and lighter.

### 1.2 What this PRD covers

This PRD defines the full product to be built from a blank repository: the data model, the API surface, the frontend screens, and the visual design system ("Engineering Ledger"). It is based on:
- A **functional/architectural reference** — a prior working implementation of the same idea, documented in the companion file `PROJECT_OVERVIEW.md`. Treat this as a strong starting blueprint (it proves the feature set and architecture work), **not** as code to preserve or extend — everything is written fresh.
- **Approved design mockups**, reviewed screen-by-screen against what's actually feasible to build, resulting in a confirmed feature list and an explicit exclusion list (§6).

### 1.3 Goals

- Build a working, well-tested full-stack TypeScript application implementing the feature set in §2.
- Implement the "Engineering Ledger" visual design system across all screens from day one.
- Keep the scope honest: **only build UI for things that have real backing data/logic** — no decorative elements that imply functionality that doesn't exist (see §6).
- Ship with test coverage (unit, integration, accessibility) as a first-class concern, not an afterthought.

### 1.4 Non-goals (for this version)

- No SSO / OAuth login (GitHub, Google) — email/password only.
- No password reset flow.
- No CSV/data export of any kind.
- No sprints, cycles, or milestones.
- No CI/CD integration or Git integration (branches, repos) inside the app.
- No issue-to-issue dependencies or checklists (Acceptance Criteria).
- No API versioning for v1 (can be revisited later).

---

## 2. Functional Scope (What to Build)

### 2.1 Tech stack

| Layer | Technology |
|---|---|
| Language | TypeScript everywhere |
| Backend | Express 5, Drizzle ORM, better-sqlite3 (SQLite, WAL mode) |
| Frontend | Next.js (App Router), React 18, Tailwind CSS 4 |
| Shared | Zod validation, shared TypeScript types, built and used by both frontend and backend |
| Auth | Argon2id password hashing, signed session cookies |
| Testing | Vitest, supertest (backend integration), React Testing Library (frontend), axe-core (accessibility) |
| Package manager | pnpm workspaces (monorepo) |

### 2.2 Core features to implement

- **Auth**: sign up, sign in, sign out (email + password, Argon2id, signed session cookie)
- **Workspaces**: create, invite members via join token, owner-managed membership
- **Projects**: create, rename, delete, scoped to a workspace
- **Issues**: create/read/update/delete; title, description, status, priority, assignee, labels, due date
- **Comments**: with @mentions
- **Activity history**: per-issue audit trail of changes
- **Labels**: workspace-scoped, fixed color palette (pick 6 muted colors matching the design system — e.g. violet, magenta, indigo, olive, sand, plum)
- **Global search** across issues
- **Saved Views**: persisted filter configurations per workspace
- **My Issues**: cross-workspace assigned workload for the current user
- **Dashboard**: per-workspace status/priority counts
- **Bulk actions**: status, priority, assignee, labels, delete — on multiple issues at once

### 2.3 Data model (recommended, based on the reference implementation)

Recommended tables: `users`, `sessions`, `workspaces`, `memberships`, `invitations`, `projects`, `issues`, `comments`, `comment_mentions`, `labels`, `issue_labels`, `activities`, `saved_views`.

Key relations: a user can belong to many workspaces via `memberships`; a workspace has projects, labels, invitations, saved views; a project has issues; an issue has comments, labels, activity, and one assignee.

**Recommendation vs. the reference implementation**: use **Drizzle Kit** for migrations from the start rather than building a custom migration runner — the reference project's custom `user_version`-based runner created a documented risk of drifting out of sync with `drizzle-kit push`. Starting fresh is the right time to avoid that.

### 2.4 API surface (recommended shape)

All routes under `/api/*`, grouped by resource: `auth`, `workspaces`, `projects`, `issues` (incl. bulk endpoint), `comments`, `labels`, `dashboard`, `my-issues`, `activities` (per issue), `search`, `views` (saved views). See `PROJECT_OVERVIEW.md` §8 for the exact endpoint list from the reference implementation — it's a solid starting point.

### 2.5 Frontend structure (Next.js App Router)

The frontend uses the App Router with the following conventions (full tree in `PROJECT_OVERVIEW.md` §3):

- **`app/`** holds routing only — layouts and `page.tsx` files. No business logic or reusable components live here.
- **Route groups** `(auth)` and `(app)` separate the unauthenticated experience (sign-in/sign-up, no app shell) from the authenticated experience (sidebar/header shell, auth-guarded).
- **`[workspaceSlug]`** is a dynamic segment — every workspace-scoped page (dashboard, projects, issues, my-issues, labels, saved-views) is nested under it, keeping the URL structure aligned with the product's mental model (Workspace → Projects → Issues).
- **`proxy.ts`** performs the lightweight cookie-presence auth gate — no session cookie redirects to `/sign-in`; the backend remains the authority for session validity.
- **`components/`, `lib/`, `hooks/`, `providers/`, `styles/`** sit outside `app/`, at the top level of `frontend/` (no `src/` wrapper).
- **`lib/api/`** contains one module per resource (`auth.ts`, `workspaces.ts`, `projects.ts`, `issues.ts`, `labels.ts`, `views.ts`) plus a shared `client.ts` fetch wrapper, rather than one monolithic `api/client.ts`.
- **Backend connectivity**: since the backend is a separate Express server, `next.config.ts` must proxy `/api/*` requests to it (via rewrites) so that the session cookie works correctly across both dev and production without CORS/domain issues. This decision must be finalized before auth work starts (see §8 Open Questions).

### 2.6 Suggested build order

1. Monorepo setup (npm workspaces, TypeScript configs, shared package with types + Zod schemas)
2. Backend foundation: DB schema, migrations (Drizzle Kit), auth, core middleware (session, security, error handling)
3. Backend resources in dependency order: workspaces → projects → issues → comments → labels → dashboard → my-issues → search → saved views
4. Backend tests alongside each resource (not deferred to the end)
5. Frontend foundation: `next.config.ts` API rewrite + `proxy.ts` auth gate + design tokens + root/`(auth)`/`(app)` layouts
6. Frontend shared components (`components/ui`, `components/layout`) before page-level components
7. Frontend pages, roughly following the same resource order as the backend
8. Frontend tests + accessibility tests

---

## 3. Design Direction

### 3.1 Visual identity

The design system, "Engineering Ledger," is characterized by:
- Serif display headings (e.g. "Acme Engineering", "Sign in to Ledger") paired with monospace UI chrome (statuses, counts, technical metadata).
- A calm, low-saturation palette (off-white backgrounds, dark green primary accent, muted status colors) instead of a louder SaaS-style palette.
- Dense, tabular, ledger-style rows for issue lists rather than card-heavy layouts.
- Some terminal/audit-log flavored microcopy is used in the mockups (e.g. "LIVE AUDIT") — **most of this purely decorative system-status copy is excluded from implementation**; see §6.

### 3.2 Screens to build

1. **Sign In** — email/password form with a left-side brand panel.
2. **Sign Up** — account creation form with a left-side brand/value-prop panel.
3. **Dashboard** — workspace-level stat tiles (Open/In Progress/Closed/Overdue), My Issues panel, Overdue Issues panel, Priority Overview, Projects summary.
4. **Workspaces (directory)** — list of workspaces the user belongs to, each as a card with issue/project counts.
5. **Projects (modal + full page)** — list of projects in a workspace; a detail page per project with its own issue list, stats, and List/Board toggle.
6. **My Issues** — personal issue ledger with filters, batch select, and bulk actions.
7. **Issue Detail** — full issue view with properties panel (status, priority, assignee, labels, due date), description, and activity/comments.
8. **Labels modal** — manage workspace labels.
9. **Saved Views modal** — manage and apply saved filter presets.
10. **Cross-Workspace View** *(see §5.4)* — aggregated summary across all workspaces the user belongs to.

---

## 4. Functional Requirements by Screen

> Each screen below lists only the elements that should actually be built — i.e., elements backed by real data or logic defined in §2. Anything not listed here that appeared in the mockups should be treated as excluded (see §6).

### 4.1 Sign In

- Email + password fields, "Sign in" button → `POST /auth/signin` through the frontend `/api` rewrite.
- Standard client-side validation (required fields, email format).
- Link to Sign Up screen.
- The brand panel may keep static/marketing copy, but must **not** display fabricated live stats (uptime %, live audit status) as if they were real data.

### 4.2 Sign Up

- Full Name, Work Email, Password and Password Confirmation fields, "Create Account" button → `POST /auth/signup` through the frontend `/api` rewrite.
- Client-side password strength indicators (length, character variety) are fine as pure frontend UX.
- Link to Sign In screen.

### 4.3 Dashboard

- Workspace name/header.
- Status tiles: Open / In Progress / Closed / Overdue counts — from a dashboard endpoint.
- My Issues panel (subset for the current workspace).
- Overdue Issues panel — issues with `due_date < today` and not closed.
- Priority Overview (Urgent/High/Medium/Low counts + simple bar visualization).
- Projects summary list with issue counts per project.
- No workspace-wide "Recently Updated" activity feed unless it's simply aggregating per-issue activity already fetched (no dedicated feed endpoint planned — see §6).

### 4.4 Workspaces (directory)

- List of workspaces the current user belongs to (via `memberships`).
- Each workspace card shows: name, description, Owner/Member badge (derived from `workspaces.owner_id`), project count, issue count, member count, open/in-progress/closed breakdown, last activity.
- "New Workspace" action → create workspace endpoint.
- Workspace search by name, scoped to the user's own memberships.

### 4.5 Projects

- List of projects in the current workspace, with issue counts (total/open/urgent).
- "New Project" action.
- Project detail page:
  - Title, status, description.
  - Issue Volume, Completion Rate (derived: closed / total), Critical Attention (count of urgent + overdue).
  - Issue list with filters (status, priority) and search.
  - **List / Board (Kanban) toggle** — client-side grouping of the same issue list by `status`.
  - Edit/Rename, Delete actions.

### 4.6 My Issues

- Cross-workspace list of issues assigned to the current user.
- Stat tiles: Assigned, In Progress, Urgent/High, Overdue.
- Filters: status, priority, project, label.
- Batch select + bulk action toolbar.
- "Save as view" action.
- Primary action button must read **"New Issue"** (not "Create Task" or "Ticket") — keep terminology consistent with the rest of the product.

### 4.7 Issue Detail

- Header: issue key, status, priority, title, created/updated metadata.
- Description (rich text or markdown).
- Properties panel: Status, Priority, Assignee, Project, Due Date, Labels — editable inline.
- Comments section with @mentions.
- Activity history.
- Delete action.

### 4.8 Labels Modal

- List of workspace labels with issue counts per label.
- Fixed color palette (do not introduce arbitrary/unlimited colors — pick a fixed small set).
- Create/update/delete labels.
- No category grouping, no per-label project/workspace scope toggle (see §6).

### 4.9 Saved Views Modal

- List of saved views with their filter query and issue count.
- Create/update/delete saved views.
- No Personal/Shared distinction, no "Default" badge (see §6).

### 4.10 Cross-Workspace View

See §5.4.

---

## 5. Notable Feature Details

These are features worth calling out specifically because they were discussed and scoped carefully during design review.

### 5.1 Member count per workspace
- Derivable via `COUNT(*)` on `memberships` filtered by `workspace_id`.
- Shown on: Workspaces directory, Cross-Workspace view.

### 5.2 Last activity per workspace
- Most recent `activities.created_at` joined through `issues.project_id → projects.workspace_id` for the given workspace.
- Shown on: Workspaces directory, Cross-Workspace view.
- Consider whether this needs a dedicated lightweight endpoint or can be computed from already-fetched data, depending on expected workspace size.

### 5.3 List / Board (Kanban) toggle
- Purely client-side. Reuses the existing issue list for a project and groups issues into columns by their existing `status` values. No dedicated backend endpoint needed.

### 5.4 Cross-Workspace Aggregated View
- A single page listing every workspace the current user belongs to, showing only verified-real fields: name, project count, issue count, open count, urgent count, member count (§5.1), last activity (§5.2).
- Explicitly **excluded** from this view: Health Distribution/status (Healthy/Attention/Blocked), "Export Manifest", parity/sync-check decorative text (see §6).

### 5.5 Workspace search by name
- Filter query on workspace name, scoped to workspaces the current user is a member of.

---

## 6. Explicitly Excluded (Do Not Build)

The following design elements appeared in the approved mockups but were reviewed and confirmed to be **out of scope** for this version — either because they require integrations/concepts not part of the current plan, or because they're purely decorative and would misrepresent functionality that doesn't exist. Do not build these, not even as static/non-functional UI.

### 6.1 Sprints / Cycles
- Any Sprint/Cycle label anywhere (Dashboard, My Issues, Issue detail, Project detail) — e.g. "Sprint Cycle 14", "Sprint 24 ACTIVE", "Cycle Window".
- "Completed this Sprint" stat.
- Version/build strings tied to cycles (e.g. "v2.14.0-cycle-14").

### 6.2 Issue Detail Page
- Git Branch field on an issue.
- Linked Dependencies (Blocks / Related issues).
- Acceptance Criteria checklist (checkboxes + MERGED/VERIFIED/Active Blocker tags).
- Reporter field (separate from Assignee).
- Version tag (e.g. "v2.14-rc1").
- Share button.
- Any "Ledger Hash" / decorative sha256-style hash display.

### 6.3 Labels
- Label categories/grouping (e.g. "Bug & Incident", "Functional Domains", "Workflow & Triaging").
- Per-label scope badge (Workspace vs Project).

### 6.4 Saved Views
- Personal / Shared with Team badges.
- "Default" view badge.

### 6.5 Global Sidebar / Header
- Notification bell icon.
- Job title under user name (e.g. "Staff Engineer").

### 6.6 My Issues Page
- Export CSV / Export Ledger / Export Manifest (all variants, anywhere in the app).
- "+ Create Task" label — must read "New Issue" (terminology, not a feature exclusion).

### 6.7 Workspaces Page
- "Last synced" timestamp + Refresh button/mechanism.
- Ledger / Grid view toggle.
- "Ledger Version" number display.

### 6.8 Sign In Page
- "Keep session active for X days" as a user-toggleable checkbox (session TTL should be a fixed server-side config, not user-controlled).
- GitHub Enterprise / Google Workspace SSO login.
- "Forgot passkey?" (password reset flow).
- "System Reliability / Uptime %" stat.

### 6.9 Sign Up Page
- GitHub / Google Workspace SSO signup.
- "Workspace Handle" (subdomain/slug field during signup).

### 6.10 Projects Modal / Project Detail Page
- Project "Lead" field.
- Project "Completion & Health" status (Green/Amber/Attention labels beyond a simple computed completion %).
- Project prefix/key (e.g. "PRJ-ECOMM").
- Target Milestone field.
- Repository link (GitHub integration).
- "Updated by CI daemon" / any CI integration text.
- Cycle Velocity / MTTR (average resolution time).
- Health Distribution (Healthy/Attention/Blocked) in the Cross-Workspace view.

### 6.11 General Decorative/Branding Elements (all screens)
- Any "Ledger sync", "PARITY CHECK", "SYNCED", "MANIFEST VER", "workspace synced with origin/main" style system-status text.
- Fake terminal/system chrome text (e.g. "NODE: US-EAST-01A", "CLUSTER: US-EAST-SYS-1", "SYS.OPERATIONAL").

---

## 7. Engineering Guardrails

1. **Shared types are the source of truth.** All statuses, priorities, and label colors live in the shared package and are imported by both frontend and backend — never hardcoded independently in each layer.
2. **Layered backend architecture.** Follow Routes → Services → Domain → DB. Routes validate input (Zod), services hold business logic and permission checks, domain modules construct entities, the DB layer persists.
3. **Migrations via Drizzle Kit** from day one — avoid building a custom migration runner (see §2.3 note).
4. **Design tokens first on the frontend.** Set up the color/typography/spacing tokens for "Engineering Ledger" before building individual components, so the visual system is centralized and consistent.
5. **Shared components before pages.** Build the `(app)` layout shell (`components/layout/AppShell.tsx`, Sidebar, Header) and reusable components (issue row, filter bar, bulk toolbar, dialogs) before individual `page.tsx` files, since they're reused across every route.
6. **Keep `app/` for routing only.** Layouts and pages under `app/` should stay thin — delegate rendering to components in `components/` and data-fetching to `lib/api/`. Avoid putting business logic directly inside `page.tsx` files.
7. **Tests alongside features, not after.** Each backend resource and frontend page should get test coverage as it's built. Include accessibility tests (axe-core) as part of the definition of done for frontend pages.
8. **Terminology consistency.** The core entity is called "Issue" everywhere — not "Task" or "Ticket".

---

## 8. Open Questions / Future Considerations

Out of scope for v1, but worth tracking:

- **Frontend-backend connectivity**: the frontend uses a same-origin `next.config.ts` rewrite from `/api/*` to the backend origin, with `API_URL=http://localhost:5000` locally. Confirm deployment-specific origins before production.
- Whether "Last activity" per workspace needs a dedicated backend endpoint or can be computed from already-fetched data (affects performance at scale).
- Whether to add API versioning, a CI pipeline, or separate session storage from the app database — none of these block v1, but are worth deciding before the project grows.
- If real CSV export, SSO, milestones, or sprints are wanted later, they should be scoped as separate feature initiatives with their own design — not bundled into v1.

---

## 9. Appendix

- Architectural/feature reference: `PROJECT_OVERVIEW.md` (documents a prior working implementation of this same product idea — use it as a blueprint, not as code to extend).
- Design requirements source: a design review session covering 9 mockup screens (Sign In, Sign Up, Dashboard, Workspaces directory, Projects modal, All Projects/Cross-Workspace, Project Detail, My Issues, Labels modal, Saved Views modal, Issue Detail).
- Full exclusion rationale and per-screen breakdown: see companion document `DESIGN_EXCLUSIONS.md`.