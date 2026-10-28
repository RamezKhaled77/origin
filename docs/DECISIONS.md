# DECISIONS — Mini Issue Tracker (Frontend)

A log of the decisions made during planning, **why** they were made, and what was rejected. Do not reverse a decision here without an explicit request; if you think one is wrong, say so and explain.

All entries below were decided on **2026-10-21** unless noted.

---

## A. Stack and repo

### D-01 Separate repos, pnpm (changed from monorepo)
- **Decision:** the frontend and the backend are **separate repositories**. This repo is the Next.js app at its root. Package manager: pnpm, without workspaces.
- **What changed:** the original plan was a monorepo with pnpm workspaces so that a `shared/` folder could sit next to both codebases. The product owner decided on separate repos.
- **Consequence:** there is no common folder for `shared/`, and this frontend does not create one. Contract values are represented in suitable frontend-local modules aligned with the backend contract.
- **Risk of the interim:** the same values live in two places and can drift. Mitigation: `FRONTEND_DATA_CONTRACT.md` is the single reference, and any change to an enum, default or limit must be communicated to the frontend.
- **Status:** settled for this frontend: no `shared/` folder and no `@shared/*` alias.

### D-02 Next.js 16 + React 19
- **Decision:** Next.js 16 with React 19.
- **Why:** Next 16 requires React 19. The PRD said React 18, which is incompatible.

### D-03 Tailwind 4, CSS-first, no `tailwind.config.ts`
- **Decision:** configuration lives in `app/globals.css` (`@theme`). No `tailwind.config.ts` and no separate `tokens.css`.
- **Why:** Tailwind 4 reads its config from CSS. Extra files would duplicate what `globals.css` already holds.

### D-04 Tokens: HSL triplets mapped through `@theme inline`
- **Decision:** raw values like `--primary: 174 88% 26%` live in `:root` and `.dark`; `@theme inline` maps them (`--color-primary: hsl(var(--primary))`).
- **Why:** with `inline`, Tailwind writes the `var()` into each utility instead of resolving it once on `:root`, so `.dark` can override the values. Without it, dark mode would not change anything.

### D-05 Fonts through `next/font`
- **Decision:** Inter, Newsreader (normal **and italic**) and JetBrains Mono via `next/font`, exposed as `--font-inter`, `--font-newsreader`, `--font-jetbrains-mono`. The Google Fonts `@import` was removed.
- **Why:** self-hosted at build time, no render-blocking external request, no layout shift. Newsreader needs the italic style loaded, otherwise the browser fakes an italic.
- **Rejected:** keeping `@import url(fonts.googleapis.com...)`.

### D-06 Serif is applied explicitly, not by a global heading rule
- **Decision:** `--font-serif: var(--font-headline)` is mapped in `@theme`; use `font-serif` on **page titles and modal titles only** (modal titles italic). No global `h1`–`h4` font rule.
- **Why:** the heading *level* (`h2`) describes page structure for screen readers, not appearance. In the design, panel titles are Sans, so a global rule would make them Serif by mistake. Dialog titles render as `h2` in shadcn, so restricting the rule to `h1` would also miss them.
- **Rejected:** limiting the global rule to `h1`.

### D-07 Contrast fixes for tertiary text
- **Decision:** `--text-tertiary` is `260 5% 42%` in light and `228 6% 55%` in dark. In dark, `--text-disabled` stays at `228 6% 40%`.
- **Why:** the original values were below the WCAG AA ratio of 4.5:1 (about 4.3:1 in light, lower in dark). The new values stay between the secondary text and the background, so the visual hierarchy is preserved. Disabled text is exempt from the rule and stays dimmer.

---

## B. Domain model and data

### D-08 Statuses and priorities come from the backend enums
- **Decision:** statuses = `backlog, todo, in_progress, in_review, done, cancelled`; priorities = `no_priority, low, medium, high, urgent`. They live in frontend-local contract modules aligned with the backend.
- **Why:** these are the real values. The mockups showed 3 statuses (Open / In Progress / Closed), which was wrong; the mockups are treated as a visual reference and the code uses the real enums.
- **Status colors:** backlog → `--status-planning`, todo → `--status-todo` (new blue token), in_progress → `--status-progress`, in_review → `--status-active`, done → `--status-resolved`, cancelled → muted text + line-through.
- **`no_priority`:** muted dash plus the text "No priority"; sorts last.

### D-09 Dashboard and list tiles use grouped counts (Option C)
- **Decision:** Open = `backlog + todo`; In Progress = `in_progress + in_review`; Done = `done`; Overdue = due date passed **and** status not `done`/`cancelled`. `cancelled` is in no tile.
- **Why:** a tile answers one question. Counting `cancelled` as "Closed" would be misleading because that is not finished work. The tiles therefore may not sum to the total, on purpose.
- **Rejected:** A) grouping `done + cancelled` as "Closed"; B) one tile per real status (6 tiles do not fit).
- **How it is computed:** the backend returns a count per status; the frontend sums the groups. Overdue is computed by the backend.

### D-10 Project page tile: Unassigned replaces Cycle Velocity
- **Why:** Cycle Velocity is a sprint concept (excluded). Overdue is already inside "Critical Attention", so the replacement is an Unassigned count.

### D-11 No issue key
- **Decision:** remove the KEY column, the key chip in the issue header, and the key in search results. The title is the identifier.
- **Why:** there is no key in the backend, and the project prefix (`PRJ-ECOMM`) is excluded.
- **Rejected:** showing a truncated UUID (a number without meaning). A per-workspace sequential number can be added later if the backend builds it.

### D-12 Labels: fixed palette of 6, stored by key
- **Decision:** `violet, magenta, indigo, olive, sand, plum`. The backend stores the **key**, not a hex.
- **Why:** the frontend picks the right values for light and dark mode. A hex would not adapt and could break contrast in dark mode. Red, blue, green and amber are deliberately avoided so labels never look like statuses.
- **Note:** violet, plum and magenta are close, so the label name must always be visible.

### D-13 Defaults for a new issue are applied by the backend
- **Decision:** the New Issue form does not send `status` or `priority` unless the user changed them. The defaults (`DEFAULT_ISSUE_STATUS`, `DEFAULT_ISSUE_PRIORITY`, proposed `todo` and `no_priority`) are kept aligned with the confirmed frontend/backend contract.
- **Why:** the form must still *show* the default to the user, so both sides need to know the value. Keeping it in a frontend-local contract module avoids duplicating it across UI code.
- **Rejected:** always sending explicit values (the original proposal; the product owner preferred server-side defaults).

### D-14 No Board in this version
- **Decision:** the project page is List only, and the List/Board toggle is removed.
- **Why:** not part of this version. A toggle with one option has no purpose. Moved from "approved" to "deferred" in `DESIGN_EXCLUSIONS.md`. If it returns, it needs 6 columns.

### D-15 Priority Overview has 5 rows
- **Why:** including "No priority" makes the rows add up to the total shown next to the panel title.

### D-16 No comment edit or delete
- **Why:** not in the design, so not built in this version.

### D-17 Reserved workspace slugs
- **Decision:** the backend must reject (or suffix) slugs equal to top-level routes: `workspaces`, `my-issues`, `sign-in`, `sign-up`, `join`, `api`.
- **Why:** static routes win over `[workspaceSlug]`, so a workspace with such a slug would have unreachable pages.

---

## C. Routes, layouts and shell

### D-18 Route structure
- **Decision:** auth pages and the join page have no shell; `/workspaces`, `/workspaces/all` and `/my-issues` are global; everything else is under `/[workspaceSlug]/...`. Labels and Saved Views are modals, not routes.
- **My Issues is global** (it spans workspaces) and has no "Save as view", because saved views belong to one workspace.
- **Cross-Workspace view** is `/workspaces/all` (projects grouped by workspace).

### D-19 Workspace-wide issues page
- **Decision:** add `/[workspaceSlug]/issues`.
- **Why:** several things need a workspace-wide list: "All Issues" in the sidebar, "View all issues" on the dashboard, opening a saved view, and opening a dashboard tile. Without it they would have no destination.

### D-20 One AppShell, two layouts that feed it
- **Decision:** `(global)/layout.tsx` and `[workspaceSlug]/layout.tsx` both mount the same `AppShell`, each passing its own `sidebar` and `actions`. `AppShell` fetches nothing and knows no workspace.
- **Why:** a layout cannot read the params of segments below it, so the shell cannot know the slug by itself. Keeping the shell purely visual makes it reusable and easy to test.
- **Rejected:** one shell that reads `useParams()` and decides (it ends up owning logic that is not its job); parallel routes with an `@sidebar` slot (more complexity than needed).
- **Consequence:** global pages hide the PROJECTS/SAVED VIEWS sections, "Invite team member", and the **New Issue** button (it needs a workspace and a project).

### D-21 Breadcrumb stays shallow
- **Decision:** the topbar shows `Workspace / Section` from the URL. Deeper levels (project name, issue title) go in the page title.
- **Why:** layouts do not know page data.

---

## D. Data flow

### D-22 Server-first data (refined by D-38)
- **Decision:** pages (Server Components) fetch and render. Mutations run in small Client Components, then `router.refresh()`. `lib/api` is split into `server/` and `client/`.
- **Why:** less client JavaScript, data ready on first paint, no extra library. The server needs the session cookie forwarded by hand and the full backend URL (`API_URL`, server-only); the browser reaches the backend through the `/api/*` rewrite on the same origin.
- **Rejected:** TanStack Query everywhere (good for rapid live updates, which this app does not need; it would add loading skeletons on every page and extra providers).
- **Exceptions:** Quick Search and the @mention picker fetch from the browser, because they change with every keystroke.

### D-23 Filters live in the URL
- **Why:** shareable links, a working Back button, and a saved view is simply the same filters object.

### D-24 Auth protection on three layers
- **Decision:** `proxy.ts` (light cookie check; Next 16 renamed `middleware` to `proxy`), `server/fetcher.ts` (401 → redirect), `client/fetcher.ts` (401 → redirect).
- **Why:** layouts are not re-rendered on in-app navigation, so a layout alone is not protection. The backend always has the final say.

### D-25 Modals use React state
- **Rejected:** URL state (`?modal=labels`). It gives a Back button and deep links, but costs more code and navigation on every open. Can be added later for Labels and Saved Views only if needed.

### D-26 Saved views are created from the Issues page
- **Decision:** "Save as view" on `/[slug]/issues` saves the current filters plus a name. The Saved Views modal only lists, renames and deletes; its "+ New View" links to the Issues page.
- **Why:** the filter UI already exists on that page, so a second filter builder in a modal would duplicate logic and bugs.
- **Rejected:** a form with a filter builder inside the modal.

### D-27 Quick Search is global
- **Decision:** it searches issues across all of the user's workspaces; each result shows its workspace.

### D-38 Hybrid data layer: TanStack Query only for interactive data (added later)
- **Decision:** Server Components stay the default for page and layout data. **TanStack Query** is used on the client **only** for Quick Search, the @mention picker, and dropdown option lists (projects, labels, members) in forms, filters and dialogs. **All** client mutations use `useMutation`. **No axios**; native `fetch` in both fetchers.
- **Why:** some data is reused across components and should be reachable fast and kept fresh without making every page client-rendered. TanStack Query gives caching, background refetch and request cancellation exactly where they pay off.
- **Rules:** query keys always include the workspace slug; the query cache is cleared on sign-out (it holds per-user data); after a mutation, invalidate the query keys **and** call `router.refresh()`; shared server caches (`use cache`, the Next `fetch` cache) are never used for user data.
- **Clarification:** TanStack's optimistic updates only work on data that lives in its cache. Page data arrives as props from Server Components, so inline edits on it use React 19 `useOptimistic`.
- **Rejected:** A) server only plus `router.refresh()` (dropdown lists go stale, and a refresh re-fetches all page data); C) TanStack Query everywhere (needs server prefetch and hydration, and gives up the benefits of server rendering); axios (its interceptors would duplicate `fetcher.ts`, it adds bundle size, and it fits the server side poorly).
- **Refines D-22:** D-22 rejected TanStack Query *everywhere*. Using it in a few specific places is a different choice.

---

## E. Scope

### D-28 Anything without a backend is excluded
- **Decision:** 49 elements are excluded (sprints/cycles, git branch, dependencies, acceptance criteria, reporter, export, share, SSO, password reset, notification bell, job titles, project lead/health/prefix/milestone, fake status text, compliance claims, issue keys, and others). The full list is `DESIGN_EXCLUSIONS.md`.
- **Why:** these would show features or numbers that do not exist, which misleads users. Decorative "system status" text and compliance claims were excluded for the same reason.

### D-29 Terminology
- **Decision:** always **Issue**, never task or ticket; the primary action is **New Issue**.

---

## F. Conventions

### D-30 File naming
- **Decision:** components are `PascalCase.tsx` (file name = component name); hooks are `use-kebab-case.ts`; everything else in `lib/` is `kebab-case.ts`.
- **Why:** the common React convention, so tools and contributors follow it without being told.

### D-31 `@/` import alias
- **Decision:** `@/` points to the repo root. There is no `@shared/*` alias. No `../../..` chains.
- **Why:** shorter imports that survive file moves; it is also the shadcn default.

### D-32 Forms: react-hook-form + Zod
- **Decision:** react-hook-form with the Zod resolver, using frontend-local Zod schemas aligned with the confirmed backend contract.
- **Why:** the app has many forms (issue, project, label, workspace, sign-in/up). The library handles field state, error messages and focusing the first invalid field, and shadcn's form component is built on it.
- **Rejected:** plain controlled state with `safeParse` (simpler to start, but that logic would be rewritten in every form).

### D-33 Tests live next to the file they test
- **Decision:** `StatusBadge.test.tsx` beside `StatusBadge.tsx`.
- **Why:** easy to find and update together, and harder to forget.

### D-34 Icons: `lucide-react`
- **Why:** the shadcn default, so the generated components already use it.

### D-35 URL filter updates
- **Decision:** debounce search input (about 250ms) and update the URL with `router.replace`.
- **Why:** the Back button should not step through every keystroke.

### D-36 Closed-style rows
- **Decision:** `done` and `cancelled` rows are muted with a struck-through title, as in the mockups.

### D-37 High priority gets its own token
- **Decision:** `--priority-high` (orange): `hsl(17 88% 38%)` light, `hsl(20 91% 60%)` dark; defined in `priority-high-tokens.css`. Medium uses `status-progress`, Low uses `text-tertiary`.
- **Why:** High and Medium need to be distinguishable and neither could reuse an existing token. The light value gives about 5:1 contrast on the page background. A priority is an icon + text (not a tinted badge), so only one color token is needed.

### D-39 Setup choices (defaults proposed in `SETUP.md`)
- **Cache Components: off.** The recommended `create-next-app` defaults turn it on. With it on, reading `cookies()` (which every page and layout does to forward the session) must be wrapped in Suspense, and nothing in the app is cacheable because all data is per-user. All cost, no benefit.
- **`create-next-app`'s own `AGENTS.md`: declined.** We have our own; two files with the same name would clash.
- **Theme: `next-themes`, default `light`, system theme off.** The dark mockups were not reviewed and there is no toggle yet. Revisit when the toggle is built.
- **Toasts: shadcn `sonner`.** The `Toaster` is mounted in the root layout; there is no separate toast provider.
- **ESLint is run directly** (`eslint .`), because `next lint` was removed in Next.js 16. **`middleware.ts` is `proxy.ts`** in Next.js 16.
- **Query defaults:** `staleTime` 60s and one retry, set once in `providers/query-provider.tsx`. To be tuned with real usage.
- **Prettier:** double quotes, trailing commas, 100 columns, with the Tailwind class-sorting plugin; Markdown files are ignored.
- **`proxy.ts` only checks that the session cookie exists.** The backend decides whether it is valid (D-24).

---

## Pending decisions (decide when building the feature)

1. **Projects: page vs modal.** The design has a Projects modal; the route tree has `projects/page.tsx`. Proposal: the page is the full list and the modal reuses the same table component. Decide when building Projects.
2. **Theme toggle.** Dark tokens exist; there is no design for the switch. Proposal: in the user menu. Decide when building the topbar.
3. **Tile numerals font.** Serif in the mockups; the serif rule says titles only. Decide when building the tiles.
4. **Contract sharing:** not part of this frontend setup. Do not introduce `shared/` or `@shared/*`.
5. **Backend answers.** See the open questions in `FRONTEND_DATA_CONTRACT.md`.
