# PROJECT_CONTEXT — Mini Issue Tracker (Frontend)

> **What this file is:** a complete handoff of everything decided and learned in the planning chat, so a **new chat** can start executing without re-asking anything.
> **Read this first, then the files in section 13.** Where an older file (`PRD.md`, `PROJECT_HANDOFF.md`) conflicts with a newer one, **the newer file wins** (see section 10).

---

## 0. How to start the new chat

1. Attach this file and the files listed in section 13.
2. Suggested first message to send:

   > "اقرأ `PROJECT_CONTEXT.md` الأول وبعدها باقي الملفات المرفقة. الـ planning خلص، وأنا دلوقتي هبدأ التنفيذ بالترتيب في `SETUP.md`. اشتغل معايا بنفس القواعد المكتوبة في قسم 2. قولي إنك فهمت المشروع بملخص قصير، وبعدها نبدأ من المرحلة 0."

3. The assistant should answer with a **short summary** of the project and the rules (to confirm understanding), verify the current Git state, and continue with the next foundation-code step.

---

## 1. Who and what

- The user is building the **frontend only** of a web app called **Mini Issue Tracker**. A friend builds the backend in a **separate repo**.
- The user is learning while building. The assistant is a **mentor/pair-programmer**, not a code vending machine (see section 2).
- Language of conversation: **Egyptian Arabic mixed with English technical terms**, no literal translation of technical terms. Files and code are in English (except `FRONTEND_DATA_CONTRACT.md`, which is Arabic + English because it is for the backend developer).
- OS is unknown. `SETUP.md` uses bash; on Windows use Git Bash or WSL.

---

## 2. How to work with the user (MOST IMPORTANT)

### 2.1 The user's standing rules (original, verbatim)

> قواعد ثابتة في كل رد:
>
> اشرح الـ concept الأساسي الأول بوضوح، وبعدها عايزك توجهني للحل بنفسي يعني بعد كذا سؤال ابقى اسألني ان لو حابب اكمل اسئلة ولا اشرحلك بقا المفهوم والغط والتصحيح؟ — متديش كود جاهز أو حل كامل غير لو طلبت ده صراحةً بعد ما جربت.
> ركز على "ليه" مش بس "إزاي" — وضحلي سبب أي قرار تقني، مش بس الخطوات.
> لو في أكتر من حل صح، اعرض الخيارات والفروق بينهم وسيبني أختار.
> لو غلطت في حاجة، ماتصلحهاش على طول — وضح ليه غلط وسيبني أحاول أصلح.
> صحح أي مفهوم غلط عندي أول ما تلاحظه حتى لو مش سألت عنه مباشرة.
> رد بمزيج عربي مصري + مصطلحات تقنية إنجليزي، من غير ترجمة حرفية للمصطلحات.
> متستخدمش advanced patterns أو shortcuts من غير ما تتأكد إني فاهم الأساسيات اللي بتتبني عليها.

### 2.2 Same rules in English
1. Explain the core concept first, clearly. Then **guide** the user to the solution instead of handing it over. After a few guiding questions, ask whether to keep going with questions or to explain the concept and correct directly.
2. Do **not** give ready code or a full solution unless the user explicitly asks, after trying.
3. Focus on **why**, not only how. Give the reason for every technical decision.
4. If more than one solution is valid, **show the options and the differences** and let the user choose.
5. If the **user** makes a mistake, don't silently fix it: explain why it is wrong and let them try to fix it.
6. Correct any misconception as soon as it is noticed, even if not asked about.
7. No advanced patterns or shortcuts until the user understands the basics they build on.

### 2.3 How these rules evolved during the chat (follow this version)
- **When the user explicitly asks you to send/create something** ("ابعتلي", "اعملي ملف", "ديني..."), **send it immediately** with a **short** explanation. Explain more **only if asked**. (Example: config files, `.md` files, token CSS, Stitch prompts, the full `globals.css`.)
- **At the start of any new topic**, still guide first: explain the concept and the problem, show options, ask for the user's reasoning. Don't jump to code.
- When the user says "مش عارف / رشحلي", **give a clear recommendation with reasons**, plus the main alternative. They then usually reply "خلينا اختيار X".
- When the user answers a numbered list with numbers ("1- تمام 2- ..."), answer **per number**.
- Keep **at most one real question per reply** at the end; put decisions in a table with a recommended default ("لو مفيش اعتراض هطبق...").
- When the assistant itself made a mistake (it happened several times, section 10), **say so plainly and correct it**, without drama.
- Prefer **tables** for comparing options. Keep explanations simple, with small concrete examples.
- **Never invent**: backend fields, endpoints, counts, tool flags, or UI that has no backend. If unsure about a tool or version, **check the current official docs** (web search) before stating commands.

---

## 3. Project snapshot

**Mini Issue Tracker (Origin):** a lightweight issue tracker for small engineering teams (like Jira/Linear, simpler). **Workspace → Projects → Issues.** Issues have status, priority, assignee, labels, due date, comments (with @mentions) and an activity history. Also: labels per workspace, saved views, global search, My Issues (cross-workspace), dashboard stats, bulk actions, and a cross-workspace projects view.

**Visual design:** "Engineering Ledger": Newsreader serif for page/modal titles, JetBrains Mono for metadata, Inter for UI; off-white background (`#fbf8fc`), deep green accent (`#087f73`), dense ledger-style tables, 4px radius, hairline borders. Designs were made in Google Stitch. Sample data uses a workspace called "Acme Engineering".

**Scope rule:** build only what has a **real backend**. 49 mockup elements were excluded (full list in `DESIGN_EXCLUSIONS.md`).

---

## 4. Stack and repo

| Area | Decision |
|---|---|
| Framework | Next.js **16** (App Router) + React **19** |
| Language | TypeScript `strict` |
| Styling | Tailwind CSS **4** (CSS-first, no `tailwind.config.ts`) + shadcn/ui (Radix) |
| Tokens | All in `app/globals.css` (HSL triplets + `@theme inline`) |
| Fonts | `next/font`: Inter, Newsreader (normal + italic), JetBrains Mono → `--font-inter`, `--font-newsreader`, `--font-jetbrains-mono` |
| Repos | **Separate repos.** This repo = the Next.js app at the root. Backend elsewhere |
| Package manager | pnpm (no workspaces) |
| Shared contract | No `shared/` folder or `@shared/*` alias. Use the confirmed backend contract and suitable frontend-local types/constants without inventing values |
| Data | Server-first (Server Components). **TanStack Query** only for Quick Search, @mention picker, dropdown option lists; all mutations via `useMutation`; invalidate + `router.refresh()`. **No axios** |
| Forms | react-hook-form + Zod resolver, using the confirmed frontend/backend contract |
| Filters | In the **URL** (query params) |
| Modals | React state (not URL) |
| Auth | Backend session cookie; frontend never touches tokens |
| Testing | Vitest + React Testing Library + vitest-axe (async Server Components can't be unit-tested, so keep pages thin) |
| Quality | ESLint (run directly, `next lint` was removed in Next 16) + Prettier (+ Tailwind plugin) |
| Misc | `proxy.ts` (Next 16 name for middleware) does a light cookie check; `next-themes` (default light); `sonner` toasts; `server-only` package; **Cache Components OFF** |

---

## 5. Architecture in short (details in `ARCHITECTURE.md`)

**Rules:** `app/` = routing only; Server Component by default; `'use client'` on the smallest component; design tokens only (no hex, no raw palette classes, no `dark:` color overrides); serif only on page/modal titles via explicit `font-serif`; enum/default values must come from the confirmed contract or frontend-local definitions.

**Folders:** `app/`, `components/{ui,layout,auth,dashboard,workspaces,projects,issues,labels,views,comments}`, `lib/{api/server,api/client,queries,filters,issues,auth,utils}`, `hooks/`, `providers/{theme-provider,query-provider}`, `proxy.ts`, `next.config.ts`.

**Layouts (5):**
1. `app/layout.tsx`: html/body, fonts, providers, Toaster.
2. `(auth)/layout.tsx`: simple frame (sign-in, sign-up, join; no shell).
3. `(app)/layout.tsx`: no visuals; auth gate + current user once.
4. `(app)/(global)/layout.tsx`: `AppShell` + **global sidebar**, **no New Issue button**.
5. `(app)/[workspaceSlug]/layout.tsx`: the only layout that knows the slug; loads workspace (404 if not a member), projects, saved views; `AppShell` + **workspace sidebar**, New Issue button, workspace-level dialogs.

**`AppShell`** draws the frame only (sidebar column, topbar with Quick Search + user menu, main, skip link). It **fetches nothing** and receives `sidebar`, `actions`, `children`. Why: a layout can't read params of segments below it, so the shell can't know the slug.

**Sidebar variants:** workspace pages = switcher, Dashboard/My Issues/Projects/Labels/Saved Views, PROJECTS + SAVED VIEWS lists, Invite team member, New Issue. Global pages = app name, Workspaces/All Projects/My Issues only.

**Breadcrumb:** `Workspace / Section` from the URL only. Deeper levels go in the page title.

**Data flow:** reads = `lib/api/server/*` (forwards the session cookie via `await cookies()`, full `API_URL`, `401` → redirect to `/sign-in`). Writes/client reads = `lib/api/client/*` through the `/api/*` rewrite (same origin, no CORS). TanStack query keys always include the workspace slug; the whole query cache is **cleared on sign-out**. Optimistic UI on server-rendered data uses React 19 `useOptimistic` (TanStack's cache doesn't own that data). Auth protection has 3 layers: `proxy.ts`, server fetcher, client fetcher.

---

## 6. Pages and overlays

| Route | Description |
|---|---|
| `/` | Redirects to `/workspaces` |
| `/sign-in`, `/sign-up` | Auth forms (no shell) |
| `/join/[token]` | Invite preview + Join; invalid/expired state (no shell) |
| `/workspaces` | Directory of workspaces as cards (counts, role badge, last activity), search by name, New Workspace |
| `/workspaces/all` | Cross-workspace: projects **grouped by workspace** with issue/open/urgent counts. Read-only |
| `/my-issues` | Issues assigned to me across all workspaces; 4 tiles; filters; bulk actions; **no "Save as view"** |
| `/[slug]/dashboard` | Tiles (Open, In Progress, Done, Overdue), My Issues panel, Overdue panel, Priority Overview (5 rows), Projects summary |
| `/[slug]/projects` | Full list of projects + New Project (**open item: page vs modal**) |
| `/[slug]/projects/[projectId]` | Project detail: tiles (Issue Volume, Completion Rate, Critical Attention, **Unassigned**), filters, issues table. **List only, no Board** |
| `/[slug]/issues` | Workspace-wide issues list: 4 tiles, filters (status, priority, project, label, assignee, overdue only), pagination, bulk actions, **Save as view** |
| `/[slug]/issues/[issueId]` | Issue detail: markdown description, properties panel (inline edit), comments + @mentions, activity, edit/delete |

**Overlays (React state):** New Issue dialog, New Workspace, Project dialog (create/edit), Labels dialog (6-color palette), Saved Views dialog (list/rename/delete; "+ New View" links to the Issues page), Save view dialog, Members dialog (invite link, members), Quick Search ⌘K (global across workspaces), Confirm delete, User menu, Workspace switcher.

**Always:** empty state, skeleton loading (no spinners), inline error banner with "Try again", `not-found.tsx`.

---

## 7. Domain cheat sheet

- **Statuses:** `backlog, todo, in_progress, in_review, done, cancelled`
- **Priorities:** `no_priority, low, medium, high, urgent` (`no_priority` = muted dash + "No priority", sorts last)
- **Defaults for a new issue:** `DEFAULT_ISSUE_STATUS = 'todo'`, `DEFAULT_ISSUE_PRIORITY = 'no_priority'` (proposed; the server applies them if omitted; the New Issue form **doesn't send** them unless the user changed them; keep these values aligned with the confirmed contract)
- **Label colors (fixed 6, stored by key):** `violet, magenta, indigo, olive, sand, plum`
- **Status → token:** backlog `status-planning`, todo `status-todo`, in_progress `status-progress`, in_review `status-active`, done `status-resolved`, cancelled muted + line-through
- **Priority → token:** urgent `status-urgent`, high `priority-high` (orange), medium `status-progress`, low `text-tertiary`, no_priority `text-tertiary`
- **Tiles (Option C):** Open = `backlog + todo`; In Progress = `in_progress + in_review`; Done = `done`; Overdue = due date passed and status not `done`/`cancelled`. `cancelled` appears in no tile (tiles may not sum to total, on purpose)
- **Terminology:** always **Issue**; primary action **New Issue**
- **No issue key** (no `ENG-104`, no KEY column); the title is the identifier
- Priority/status are **never color-only** (text, and an icon for priority)
- Workspace slugs reserved: `workspaces, my-issues, sign-in, sign-up, join, api`

---

## 8. Design inputs

### 8.1 Design system
Values live in `globals.css` (final, merged: base tokens + label palette + `--status-todo` + `--priority-high`) and are explained in `DESIGN_SYSTEM.md`. Key facts: base font 13px; rows 36–40px; sidebar 240px; radius 4px; no shadows except dialogs/popovers; `--text-tertiary` was raised to meet AA (light `260 5% 42%`, dark `228 6% 55%`).

### 8.2 The 11 original mockups (the user must re-upload them if visual review is needed)

| # | Screen | Elements to exclude / change |
|---|---|---|
| 1 | Sign Up | SSO buttons, workspace handle, compliance claims (SOC2/ISO/p99), entropy bits, Terms checkbox/links, "manifest/cluster/SHA-256" text |
| 2 | Sign In | "Keep session 30 days", SSO, "Forgot passkey?", telemetry panel (release/records/uptime), SHA256 line, node/port/system status text |
| 3 | My Issues | Sprint/Cycle text, Export CSV, "Completed this sprint", "Create Task" (→ New Issue), KEY column, version footer, "Save as view" |
| 4 | Workspaces | Ledger/Grid toggle, last synced + Refresh, ledger version, bell, job title; "Closed" → "Done" |
| 5 | Labels modal | Categories, scope badges, description column, "taxonomy synchronized", unimplemented shortcut hints; colors → 6-palette |
| 6 | Saved Views modal | Personal/Shared badges, Default badge, query-string display, sprint names, sync text; "+ New View" → link to Issues page |
| 7 | Dashboard | Sprint Cycle text, "Resolved this cycle", cycle footer, per-project "last active"; tiles → Open/In Progress/Done/Overdue; Priority Overview → 5 rows |
| 8 | Issue detail | Share, git branch, reporter, version tag, cycle/sprint, dependencies, acceptance criteria, ledger hash, key chip, project prefix |
| 9 | Projects modal | Lead, completion & health, prefix, repo/sync text, project icons, "High Priority" tag |
| 10 | All Projects (cross-workspace) | Export Manifest, parity check, health distribution, completion/health, ledger digest, icons. Route is `/workspaces/all` |
| 11 | Project detail | Prefix, target milestone, repo link, cycle window, CI text, Export Ledger, Cycle Velocity (→ Unassigned), Board toggle |

### 8.3 Extra screens in Google Stitch
The user generated the missing screens in Stitch (New Issue, New Workspace, New/Edit Project, bulk actions, issue comments + activity, Quick Search, user menu + workspace switcher, Members + invite, Join page, confirm delete, label editor, empty/loading/error/404, dark mode). **Those images were never shown in the planning chat, so they were never reviewed against the exclusion list.** Two screens were specified later and may not exist yet: the **workspace Issues page** and the **Save as view dialog**. The Stitch design-system block originally had the wrong statuses; the corrected block is in Appendix A. Treat all Stitch screens as a **visual reference only**; the written decisions win, and statuses are fixed in code.

---

## 9. Locked decisions (condensed; reasons in `DECISIONS.md`)

| ID | Decision |
|---|---|
| D-01 | Separate repos + pnpm; no local `shared/` folder or `@shared/*` alias |
| D-02 | Next 16 + React 19 (PRD's React 18 was wrong) |
| D-03/04 | Tailwind 4 CSS-first; tokens as HSL triplets through `@theme inline` |
| D-05 | `next/font`, Newsreader with italic |
| D-06 | Serif explicit (`font-serif`), no global `h1–h4` rule |
| D-07 | AA contrast fix for tertiary text |
| D-08 | Real enums (6 statuses, 5 priorities) and the status token map |
| D-09 | Dashboard tiles = Option C |
| D-10 | Unassigned tile replaces Cycle Velocity |
| D-11 | No issue key |
| D-12 | Fixed 6 label colors, stored by key |
| D-13 | Defaults applied by the backend and kept aligned with the confirmed frontend/backend contract |
| D-14 | No Board in this version |
| D-15/16 | Priority Overview has 5 rows; no comment edit/delete |
| D-17 | Reserved workspace slugs |
| D-18/19 | Route structure; add `/[slug]/issues` |
| D-20 | One `AppShell`, two layouts feed it; New Issue hidden on global pages |
| D-21 | Shallow breadcrumb |
| D-22/38 | Server-first + TanStack Query only for interactive data; no axios |
| D-23 | Filters in the URL |
| D-24 | 3-layer auth protection; `proxy.ts` |
| D-25 | Modals in React state |
| D-26 | Saved views created from the Issues page ("Save as view") |
| D-27 | Quick Search is global |
| D-28/29 | 49 exclusions; "Issue" terminology |
| D-30–D-37 | PascalCase components / kebab-case others; `@/` alias; react-hook-form + Zod; tests next to files; `lucide-react`; debounce 250ms + `router.replace`; done/cancelled rows muted + line-through; `--priority-high` token |
| D-39 | Setup choices: Cache Components off, create-next-app `AGENTS.md` declined, `next-themes` default light, `sonner`, ESLint direct, query defaults (60s stale, 1 retry), Prettier settings |

---

## 10. Corrections made along the way (don't regress)

1. The assistant first assumed the statuses were `open / in_progress / closed` (from the Dashboard mockup). **Wrong.** The real enum has 6 statuses. The Stitch prompts had to be corrected (Appendix A).
2. A global `h1–h4 { font-family }` rule was proposed and then **removed** (D-06).
3. `labels` and `saved-views` were first listed as routes; they are **modals**.
4. TanStack Query's optimistic updates only work on data in its own cache. Server-rendered page data uses `useOptimistic`.
5. `tailwind.config.ts`, `styles/tokens.css`, `middleware.ts`, "npm workspaces" in `PROJECT_HANDOFF.md` are **outdated**.
6. The PRD's React 18 conflicts with Next 16 (needs React 19).
7. PRD §5.4 describes Cross-Workspace as a list of workspaces; the decided design is **projects grouped by workspace** at `/workspaces/all`. PRD's "closed ÷ total" and "urgent + overdue" are replaced by the definitions in `FRONTEND_DATA_CONTRACT.md` section 9.
8. My Issues is **global**, so it has no "Save as view" (views belong to one workspace).
9. Statuses/KEY/Sprint text in any mockup are **visual leftovers**, not requirements.
10. Don't add `dark:` color overrides for token colors; tokens already flip under `.dark`.

---

## 11. Backend contract (`FRONTEND_DATA_CONTRACT.md`)

It lists every form field (Required/Optional/Auto), filters, bulk actions, computed numbers (with the tile grouping explained), the error format `{ error: { code, message, fields } }`, and **26 open questions (Q1–Q26)**. Limits in it are **proposed** (the PRD gave none). The most blocking questions:

| # | Question |
|---|---|
| Q1 | Workspace slug: generated from the name? unique? immutable? |
| Q2 | Project statuses enum |
| Q3 | Label color stored as a key? |
| Q4 | Saved-view `filters` shape (and `assigneeId: "me"`) |
| Q6 | Multi-value `status` filter (needed by tiles) |
| Q7 | Dashboard returns `countsByStatus` (6 keys) + `overdueCount` |
| Q14 | Endpoint for the workspace-wide issues list (filters + search + pagination) |
| Q24 | **Session cookie name** and attributes (`HttpOnly`, `SameSite=Lax`, `Path=/`, no `Domain`, `Secure` in prod). Needed by `proxy.ts` |
| Q25 | Zod major version on the backend (must match) |
| Q26 | ~~Are all backend routes under `/api`? Dev port?~~ Confirmed locally: `API_URL=http://localhost:5000`; confirmed auth routes are at backend root paths (`/auth/...`) and the frontend rewrite strips `/api`. |

The long-term sharing question is closed for this frontend: do not introduce `shared/` or `@shared/*`.

---

## 12. Status and next steps

**Setup is complete.** The handoff reports that phases 0–10 and all five Phase 11 validation commands passed. The Git commit still needs to be verified rather than assumed.

**Do next, in order:**
1. **Run `SETUP.md` phases 0–11**, one at a time, reporting each **Checkpoint**. The user should report anything that differs from the doc (the `create-next-app` and `shadcn init` prompts vary by version; especially whether shadcn's `globals.css` contains `@import "tw-animate-css"`, and the output if `shadcn add form` fails).
2. **In parallel:** the user sends `FRONTEND_DATA_CONTRACT.md` to the backend developer and collects answers for any remaining open contract questions.
3. **Foundation code (guided, with tests where pure):** `ApiError` + server/client fetchers → `lib/filters` and `lib/issues` (pure logic) → `StatusBadge`, `PriorityIndicator`, `LabelChip` → `AppShell` + the two layouts → Sign In / Sign Up.
4. **Then the pages** (proposed order, to be agreed with the user): Workspaces → Projects → Issues list → Issue detail → Dashboard → My Issues → Labels and Saved Views dialogs → Comments/Activity → Quick Search → Cross-workspace → Members/Join.

**Pending decisions (decide when building that feature):** Projects page vs modal; theme toggle location (proposal: user menu); font for tile numerals (serif in mockups vs "serif for titles only"). Also to review: the Stitch screens against `DESIGN_EXCLUSIONS.md`.

---

## 13. Files to attach in the new chat

| File | Purpose |
|---|---|
| `PROJECT_CONTEXT.md` | This file |
| `AGENTS.md` | Entry point and non-negotiable rules |
| `ARCHITECTURE.md` | Structure, layouts, data flow, pages |
| `DECISIONS.md` | Why, and what was rejected |
| `DESIGN_SYSTEM.md` | Tokens, typography, component specs |
| `DESIGN_EXCLUSIONS.md` | What not to build + locked decisions |
| `CONVENTIONS.md` | How to write code here |
| `FRONTEND_DATA_CONTRACT.md` | Data the frontend sends/expects (for the backend dev too) |
| `SETUP.md` | Step-by-step setup (the next thing to do) |
| `globals.css` | Final merged tokens file |
| `PRD.md` | Original requirements (screen details). **Partly outdated**, see section 10 |
| Mockup images (optional) | For visual review |

Ignore `PROJECT_OVERVIEW.md` (backend reference) and treat `PROJECT_HANDOFF.md` as outdated where it conflicts (monorepo, npm/pnpm, tree with `tailwind.config.ts`/`tokens.css`/`middleware.ts`, labels/saved-views as pages).

---

## Appendix A — Stitch design-system block (corrected)

Paste at the top of every Stitch prompt, one screen per prompt, and attach a Dashboard screenshot as the reference.

```
DESIGN SYSTEM — apply to every screen

Product: a lightweight issue tracker for small engineering teams (simpler than Jira/Linear). Desktop web app, 1440px wide. Workspace name in samples: "Acme Engineering". Style: "Engineering Ledger": calm, editorial, dense, tabular. Match the attached reference screenshot exactly in look and feel.

Typography:
- Newsreader (serif): page titles and modal titles only (modal titles in italic)
- Inter: all UI text, 13px base
- JetBrains Mono: statuses, counts, timestamps, metadata, and small uppercase letter-spaced labels

Colors (light): background #fbf8fc, surfaces #ffffff and #f5f3f6, hairline borders #ebe7ed, strong borders #dcd9dd, text primary #1c1b1f / secondary #49454f / tertiary #696670, primary deep green #087f73 (hover #06635a) with muted tint #e6f3f1 and border #99cfc9. Status tints (text on tinted bg with 1px border).

Shape: 4px radius, 1px hairline borders, no shadows except modals/popovers (soft shadow over a dimmed, blurred backdrop). Dense rows 36–40px. Badges are small, square-ish, mono, uppercase, 10–11px.

Statuses are exactly these six: Backlog, Todo, In Progress, In Review, Done, Cancelled. Colors: Backlog slate, Todo blue, In Progress amber, In Review teal, Done green, Cancelled muted gray with strikethrough title. Status badges are mono uppercase.
Priorities are exactly these five: Urgent, High, Medium, Low, and "No priority" (muted dash icon + text). Always icon + text, never color alone.
There are NO issue keys (no "ENG-104" anywhere): the issue title is the primary identifier, and tables have no KEY column.
Terminology: always "Issue", never "task" or "ticket". Primary button text is "New Issue".

App shell (only where the screen has it): left sidebar 240px: workspace switcher header (square "AE" avatar, "Acme Engineering", up/down chevron), section NAVIGATION (Dashboard, My Issues, Projects, Labels, Saved Views), section PROJECTS (list with counts), section SAVED VIEWS (list with counts), bottom link "Invite team member". Top bar: breadcrumb, "Quick search… ⌘K" field, "New Issue" button, user avatar with initials "RK".

STRICTLY DO NOT include: sprints/cycles/versions/milestones, git branches/repositories, export or share buttons, notification bell, SSO/GitHub/Google login, job titles, reporter field, issue dependencies, acceptance-criteria checklists, project leads/prefixes/health status, compliance claims, and ANY decorative system-status text (synced, uptime, hash, cluster, node, ledger version, parity check, live audit). No fake stats.

Sample people: Ramez K., Sarah I., Alex M., Marcus B. (avatars = initials).
```

---

## Appendix B — Quick glossary of files created in the planning chat

`ARCHITECTURE.md`, `DECISIONS.md`, `DESIGN_SYSTEM.md`, `DESIGN_EXCLUSIONS.md`, `CONVENTIONS.md`, `AGENTS.md`, `FRONTEND_DATA_CONTRACT.md`, `SETUP.md`, `globals.css` (final), and this file. The earlier partial token files (`label-tokens.css`, `status-todo-tokens.css`, `priority-high-tokens.css`) are **already merged** into `globals.css` and are not needed.
