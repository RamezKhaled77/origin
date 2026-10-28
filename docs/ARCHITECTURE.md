# ARCHITECTURE — Mini Issue Tracker (Frontend)

> **Audience:** the developer and any AI coding agent working on the frontend.
> **Read first:** `DESIGN_EXCLUSIONS.md` (what must NOT be built and the locked design decisions). This file explains **where things live and why**.
> **Scope:** frontend only. The backend (Express) is built separately; the contract between them is `FRONTEND_DATA_CONTRACT.md`.

---

## 1. Project in one paragraph

Mini Issue Tracker is a lightweight issue tracker for small engineering teams (like Jira/Linear, but simpler). A **Workspace** contains **Projects**, and a Project contains **Issues**. Issues have a status, priority, assignee, labels, due date, comments (with @mentions) and an activity history. The visual design is called **"Engineering Ledger"**: serif page titles, monospace metadata, calm colors (off-white + deep green), dense table rows.

---

## 2. Stack and locked decisions

| Area | Decision |
|---|---|
| Framework | Next.js 16 (App Router) + **React 19** |
| Language | TypeScript, `strict` mode, no plain JS |
| Styling | Tailwind CSS 4 (CSS-first, **no `tailwind.config.ts`**) + shadcn/ui |
| Tokens | All design tokens live in `app/globals.css` (no separate `tokens.css`) |
| Fonts | `next/font`: Inter (UI), Newsreader (serif, **normal + italic**), JetBrains Mono. CSS variables: `--font-inter`, `--font-newsreader`, `--font-jetbrains-mono` |
| Repo | **Separate repos.** This repo is the Next.js app itself (the project root). The backend lives in its own repo. Package manager: pnpm (no workspaces) |
| Shared code | There is no `shared/` folder or `@shared/*` alias. Keep types, schemas, enums and defaults in suitable frontend-local modules, aligned with the confirmed backend contract |
| Data fetching | **Server-first** for pages and layouts. **TanStack Query** (client) only for interactive data: Quick Search, @mention picker, dropdown option lists. Mutations use `useMutation`, then invalidate + `router.refresh()`. **No axios**: native `fetch` everywhere |
| Filters | Live in the **URL** (query params). A saved view is just a filters object |
| Modals | Open/closed state in **React state** (not in the URL) |
| Auth | Session cookie set by the backend. Frontend never reads or stores tokens |
| Testing | Vitest + React Testing Library + axe-core (accessibility is part of "done") |
| Quality | ESLint + Prettier |

---

## 3. Golden rules

1. **`app/` is routing only.** Layouts and `page.tsx` stay thin. No business logic and no reusable UI inside `app/`.
2. **Server Component by default.** Add `'use client'` only to the smallest component that needs state or events (forms, dialogs, dropdowns, filters UI).
3. **Contract values have one frontend-local source of truth** for statuses, priorities, label colors and defaults. Never invent or duplicate them inconsistently, and keep them aligned with the confirmed backend contract.
4. **Use design tokens, never raw colors.** Use the semantic Tailwind classes generated from `globals.css` (e.g. `bg-surface-low`, `text-text-secondary`, `text-status-progress`). No hex values in components.
5. **Serif font is explicit.** Use `font-serif` only on page titles and modal titles (modal titles are italic). Panel titles stay Sans. Use `font-mono` for keys, counts, timestamps and small uppercase labels. There is **no global `h1`–`h4` font rule**.
6. **Terminology:** always **Issue** (never task/ticket). Primary action label: **New Issue**.
7. **Nothing without a backend.** Do not build anything listed in `DESIGN_EXCLUSIONS.md`, not even as static UI. Mockups are a visual reference only. Where a mockup shows old values (`ENG-104`, "Open / In Progress / Closed"), the decisions win.
8. **Color is never the only signal.** Priority and status always carry text (and an icon for priority).
9. **Accessibility:** every form error is tied to its field, every dialog traps focus and closes on `Esc`, every page has one `<main>`.

---

## 4. Repo layout

Two separate repositories:

```
<frontend repo>   ← this document (the Next.js app is the project root)
<backend repo>    ← Express 5 + Drizzle + SQLite, built separately by someone else
```

The two sides agree through `FRONTEND_DATA_CONTRACT.md`. Because there is no shared folder between repos, the enums, defaults and schemas the frontend needs live in suitable frontend-local modules. Any change to those values on the backend must be communicated to the frontend.

---

## 5. Frontend folder structure

```
<repo root>/
├── public/                         static assets only (favicon, images)
├── app/                            ROUTING ONLY
│   ├── layout.tsx                  (1) Root
│   ├── globals.css                 tokens + Tailwind
│   ├── page.tsx                    redirects to /workspaces
│   ├── not-found.tsx
│   ├── (auth)/                     pages WITHOUT the app shell
│   │   ├── layout.tsx              (2)
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── join/[token]/page.tsx
│   └── (app)/                      signed-in area
│       ├── layout.tsx              (3) auth gate + current user
│       ├── (global)/               pages that are not inside one workspace
│       │   ├── layout.tsx          (4) AppShell + global sidebar
│       │   ├── workspaces/page.tsx
│       │   ├── workspaces/all/page.tsx
│       │   └── my-issues/page.tsx
│       └── [workspaceSlug]/        pages inside one workspace
│           ├── layout.tsx          (5) AppShell + workspace sidebar + modals
│           ├── dashboard/page.tsx
│           ├── projects/page.tsx
│           ├── projects/[projectId]/page.tsx
│           ├── issues/page.tsx
│           └── issues/[issueId]/page.tsx
│
├── components/                     UI building blocks (never routes)
│   ├── ui/                         shadcn primitives. Generic: they know nothing about Issues
│   ├── layout/                     AppShell, Topbar, sidebars, WorkspaceSwitcher, UserMenu, QuickSearch
│   ├── auth/                       SignInForm, SignUpForm
│   ├── dashboard/                  StatTile, PriorityOverview, MyIssuesPanel, OverdueIssuesPanel, ProjectsSummary
│   ├── workspaces/                 WorkspaceCard, NewWorkspaceDialog, MembersDialog, InviteLink
│   ├── projects/                   ProjectsTable, ProjectForm, ProjectDialog
│   ├── issues/                     IssueTable, IssueRow, FilterBar, BulkToolbar, StatusBadge,
│   │                               PriorityIndicator, DueDate, NewIssueDialog, IssueProperties
│   ├── labels/                     LabelChip, LabelsDialog
│   ├── views/                      SavedViewsDialog, SaveViewDialog
│   └── comments/                   CommentList, CommentComposer, MentionPicker, ActivityTimeline
│
├── lib/
│   ├── api/
│   │   ├── server/                 READS for pages and layouts
│   │   │   ├── fetcher.ts          backend base URL + forwards the session cookie + handles 401
│   │   │   └── workspaces.ts, projects.ts, issues.ts, dashboard.ts, labels.ts, views.ts
│   │   ├── client/                 MUTATIONS + browser-side reads (search, mentions)
│   │   │   ├── fetcher.ts          relative `/api` + error handling
│   │   │   └── auth.ts, workspaces.ts, projects.ts, issues.ts, labels.ts, views.ts, comments.ts, search.ts
│   │   └── errors.ts               ApiError (shared); maps field errors to form fields
│   ├── queries/                    TanStack Query: query keys, query hooks, mutation hooks (client only)
│   ├── filters/                    filters <-> URL query params
│   ├── issues/                     tile groups, status/priority/label -> token maps
│   ├── auth/                       session cookie name (used by proxy.ts and the server fetcher)
│   └── utils/                      cn(), formatDate, relativeTime, initials
│
├── hooks/                          use-debounce, use-hotkey (⌘K, /, Esc)
├── providers/                      theme-provider, query-provider (the toast `Toaster` comes from components/ui/sonner)
├── proxy.ts                        light auth check (Next 16 renamed `middleware` to `proxy`)
├── next.config.ts                  rewrites: /api/* -> backend
└── .env.example                    API_URL (no NEXT_PUBLIC_ prefix)
```

### What each top-level folder is for

| Folder | Responsibility | Must not contain |
|---|---|---|
| `app/` | URLs, layouts, wiring a page to its data | Reusable UI, business rules |
| `components/ui/` | Generic primitives (Button, Input, Dialog, Select) | Anything that knows "Issue" or "Workspace" |
| `components/<domain>/` | Domain UI (StatusBadge, IssueTable...) | Data fetching from the backend |
| `lib/api/server` | Server-side reads only | Anything imported by a Client Component (protect with the `server-only` package) |
| `lib/api/client` | Browser-side `fetch` calls | Reads that a page could do on the server |
| `lib/queries` | TanStack Query keys, query hooks and mutation hooks (client only) | Server-side code, or reads a page could do on the server |
| `lib/filters`, `lib/issues` | Pure functions (testable without React) | JSX |
| `hooks/` | Small reusable client hooks | Data fetching for pages |
| `providers/` | App-wide context (theme, query client) | Domain state |

---

## 6. Layout hierarchy

| # | File | Responsibility |
|---|---|---|
| 1 | `app/layout.tsx` | `<html>`/`<body>`, fonts, `globals.css`, app-wide providers |
| 2 | `(auth)/layout.tsx` | Simple frame (light header/footer) for sign-in, sign-up and join |
| 3 | `(app)/layout.tsx` | **No visuals.** Gets the current user once; redirects to sign-in if not signed in |
| 4 | `(global)/layout.tsx` | Mounts `AppShell` with the **global sidebar** and **no New Issue button** |
| 5 | `[workspaceSlug]/layout.tsx` | The only layout that knows the slug. Loads the workspace (404 if not a member), its projects and saved views. Mounts `AppShell` with the **workspace sidebar**, the **New Issue button**, and the workspace-level dialogs |

**Why two shells instead of one that decides:** a layout cannot read params of the segments below it, so `(app)/layout.tsx` can never know the slug. Separating `(global)` and `[workspaceSlug]` lets the one layout that has the slug do the workspace work.

### `AppShell` (in `components/layout/`)
`AppShell` draws the frame only: sidebar column, topbar (Quick Search, user menu), content area, "skip to content" link, and `<main>`. It **does not fetch data and does not know which workspace it is in**. It receives:

| Prop | Meaning | Provided by |
|---|---|---|
| `sidebar` | What to render in the left column | the layout |
| `actions` | Buttons at the right of the topbar (New Issue or nothing) | the layout |
| `children` | The page | Next.js |

### Sidebar variants

| | Workspace pages | Global pages |
|---|---|---|
| Header | Workspace switcher | App name |
| Navigation | Dashboard, My Issues, Projects, Labels, Saved Views | Workspaces, All Projects, My Issues |
| PROJECTS / SAVED VIEWS lists | shown | hidden |
| Invite team member | shown | hidden |
| New Issue button | shown | hidden |

`WorkspaceSidebar` and `GlobalSidebar` both use the same small pieces (`SidebarSection`, `SidebarNavItem`), so the look is identical and only the content differs.

**Breadcrumb:** the topbar shows `Workspace / Section` taken from the URL. Deeper levels (project name, issue title) belong in the page's own title, because layouts do not know page data.

---

## 7. Data flow

### Reads (Server Components)
`page.tsx` or `layout.tsx` calls a function from `lib/api/server/*`. That function uses `server/fetcher.ts`, which:
1. builds the full backend URL from `API_URL` (server-only env var),
2. forwards the session cookie (`await cookies()`),
3. on `401` calls `redirect('/sign-in')`,
4. throws `ApiError` for other failures.

### Writes (Client Components)
A Client Component (a form or button) runs a **`useMutation`** from `lib/queries/*`, which wraps a function from `lib/api/client/*` that hits `/api/*`. `next.config.ts` **rewrites** `/api/*` to the backend, so the browser stays on the same origin and the cookie works without CORS. When the mutation settles: **invalidate the affected query keys and call `router.refresh()`**, so both the client cache (dropdowns, search) and the Server Components (pages) show fresh data.

### Client-side reads (TanStack Query)
Used **only** for interactive data that a Server Component cannot serve well:

| Data | Why it lives on the client |
|---|---|
| Quick Search results | Changes on every keystroke; stale requests must be cancelled |
| @mention picker | Same as search |
| Dropdown option lists (projects, labels, members/assignees) in forms, filters and dialogs | Reused across components, fetched only when needed, kept fresh in the background |

Rules:
- Queries run in Client Components through `lib/api/client`. Page and layout data still comes from Server Components.
- Query keys are scoped by workspace (`['workspace', slug, 'labels']`), so data from two workspaces never mixes.
- The whole query cache is **cleared on sign-out**, because it holds per-user data.
- `use cache`, the Next `fetch` cache and any shared server cache are **never** used for user data.
- No axios. Both fetchers use native `fetch`.

### Optimistic UI
Data rendered by Server Components (an issue's status, priority, etc.) arrives as props, so TanStack's cache does not own it. For inline edits on that data use React 19 `useOptimistic`. TanStack optimistic updates only apply to data that lives in the query cache.

### Filters
Filters are **URL query params** (`?status=todo,in_progress&priority=high&overdue=true`). `lib/filters` converts URL <-> filters object. A **saved view** stores that same filters object. The shape matches `FRONTEND_DATA_CONTRACT.md` and is represented in frontend-local types.

### Auth protection (three layers)
1. `proxy.ts`: light check (is there a session cookie?), fast redirect to sign-in.
2. `server/fetcher.ts`: `401` -> redirect to sign-in.
3. `client/fetcher.ts`: `401` -> redirect to sign-in.

The backend always has the final say; the frontend only reflects its decision. Do not rely on a layout alone for protection.

### Errors
The backend returns `{ error: { code, message, fields } }`. `ApiError` carries it, and forms show each message **under its field**.

---

## 8. Pages

### Without app shell

| Route | File | Description |
|---|---|---|
| `/sign-in` | `(auth)/sign-in/page.tsx` | Email + password sign-in form with a brand panel. Link to sign-up. Generic error on bad credentials |
| `/sign-up` | `(auth)/sign-up/page.tsx` | Name, work email, password. Password-strength hints are UX only. Link to sign-in |
| `/join/[token]` | `(auth)/join/[token]/page.tsx` | Invite preview (workspace name, inviter, member count) with a Join button. Shows an "invalid or expired link" state. If the user is not signed in, sends them to sign-in and back |

### Global pages (global sidebar)

| Route | File | Description |
|---|---|---|
| `/workspaces` | `(global)/workspaces/page.tsx` | Directory of the user's workspaces as cards: name, description, Owner/Member badge, project/issue/member counts, status breakdown, last activity. Search by name, **New Workspace** |
| `/workspaces/all` | `(global)/workspaces/all/page.tsx` | Cross-workspace view: all of the user's projects grouped by workspace, each with issue/open/urgent counts. Read-only |
| `/my-issues` | `(global)/my-issues/page.tsx` | Issues assigned to the user across all workspaces. 4 tiles (Assigned, In Progress, Urgent/High, Overdue), filters, bulk select + bulk actions. Each row links to its workspace |

### Workspace pages (workspace sidebar)

| Route | File | Description |
|---|---|---|
| `/[slug]/dashboard` | `dashboard/page.tsx` | Workspace overview: tiles (Open, In Progress, Done, Overdue), My Issues panel, Overdue Issues panel, Priority Overview (5 rows), Projects summary |
| `/[slug]/projects` | `projects/page.tsx` | List of the workspace's projects with issue/open/urgent counts and **New Project**. *(See open item 1)* |
| `/[slug]/projects/[projectId]` | `projects/[projectId]/page.tsx` | One project: title, status, description, edit/delete. Tiles: Issue Volume, Completion Rate, Critical Attention, Unassigned. Filters (status, priority, search) and the project's issues table. **List only, no Board** |
| `/[slug]/issues` | `issues/page.tsx` | Workspace-wide issue list. 4 tiles, filters (status, priority, project, label, assignee, overdue only), pagination, bulk actions, **Save as view** |
| `/[slug]/issues/[issueId]` | `issues/[issueId]/page.tsx` | One issue: title, markdown description, properties panel (status, priority, assignee, project, due date, labels) editable inline, comments with @mentions, activity history, edit/delete |

### Overlays (not routes; open/close in React state)

| Overlay | Opened from | Description |
|---|---|---|
| New Issue dialog | Topbar button / sidebar | Title (required), description, project, status, priority, assignee, due date, labels. Status and priority are only sent if the user changed them |
| New Workspace dialog | `/workspaces` | Name (required), description |
| Project dialog (create / edit) | Projects pages, sidebar `+` | Name (required), description, status |
| Labels dialog | Sidebar | List with issue counts, create / rename / recolor / delete. Fixed 6-color palette |
| Saved Views dialog | Sidebar | List of the user's views, rename, delete. "+ New View" links to the Issues page |
| Save view dialog | Issues page | A name + a read-only summary of the current filters |
| Members dialog | Sidebar "Invite team member" | Invite link (copy / regenerate), members list, remove member (owner only) |
| Quick Search (⌘K) | Topbar | Global issue search across all of the user's workspaces; results show the workspace |
| Confirm delete dialog | Delete actions | Names what will be deleted (e.g. project deletion shows how many issues go with it) |
| User menu / Workspace switcher | Topbar / sidebar header | Sign out; switch workspace |

### Special files and states
- `not-found.tsx` (root and workspace level), `error.tsx` and `loading.tsx` (skeleton rows, no spinners) for the `(app)` area.
- Every list has an **empty state** and every table an **error banner** with "Try again".

---

## 9. Domain cheat sheet (do not reinvent)

**Statuses:** `backlog`, `todo`, `in_progress`, `in_review`, `done`, `cancelled`
**Priorities:** `no_priority`, `low`, `medium`, `high`, `urgent`
**Defaults for a new issue:** `DEFAULT_ISSUE_STATUS`, `DEFAULT_ISSUE_PRIORITY` from frontend-local contract constants (proposed: `todo`, `no_priority`)

| Status | Token |
|---|---|
| backlog | `--status-planning` |
| todo | `--status-todo` |
| in_progress | `--status-progress` |
| in_review | `--status-active` |
| done | `--status-resolved` |
| cancelled | muted text + line-through |

**Dashboard / list tiles**

| Tile | Counts |
|---|---|
| Open | `backlog` + `todo` |
| In Progress | `in_progress` + `in_review` |
| Done | `done` only |
| Overdue | due date passed **and** status not `done`/`cancelled` |

`cancelled` appears in no tile. `no_priority` shows as a muted dash with the text "No priority" and sorts last.

**Label colors (fixed 6, stored by key):** `violet`, `magenta`, `indigo`, `olive`, `sand`, `plum`. Tokens: `--label-<color>`, `--label-<color>-bg`, `--label-<color>-border`.

**No issue key.** The issue title is the identifier. Tables have no KEY column.

---

## 10. Setup

The full step-by-step guide, with every command, config file and checkpoint, is **`SETUP.md`**. Phases in order: prerequisites, create the app, TypeScript and aliases, dependencies, shadcn init, merge tokens, fonts and providers, ESLint and Prettier, testing, environment and `proxy.ts`, folder structure, final verification.

---

## 11. Open items

1. **Projects: page vs modal.** The design has a Projects **modal** (list + New Project) while the route tree has `projects/page.tsx`. Proposal: the page is the full list, and the modal reuses the same `ProjectsTable` component for quick access.
2. **Theme toggle.** Dark-mode tokens exist but there is no design for a toggle. Decide where it lives (user menu is the natural place).
3. **Backend answers pending.** See the Open Questions in `FRONTEND_DATA_CONTRACT.md` (slug rules, project statuses, filter shape, multi-status filter, workspace issues endpoint, etc.).
4. **Contract sharing:** not part of this frontend setup. Do not introduce `shared/` or `@shared/*`.
