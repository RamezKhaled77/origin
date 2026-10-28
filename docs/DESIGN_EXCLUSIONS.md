# Design Exclusions — Frontend Redesign (v2)

This document lists every UI element from the design mockups that was **reviewed and confirmed excluded** because it has no backing feature in the current backend (Mini Issue Tracker). It also lists the elements verified as genuinely feasible (approved as real features), the decisions locked during design review, and the questions still waiting on the backend.

Use this as the reference when instructing any coding agent to implement the frontend: **none of the excluded items below should be built**, not even as static/decorative UI, unless explicitly re-approved later.

---

## ✅ Approved Real Features (build these for real)

| # | Feature | Why it's feasible |
|---|---------|-------------------|
| 1 | **Members count** per workspace | Derivable from the `memberships` table (join on `workspace_id`) |
| 2 | **Last activity** per workspace | Most recent `activities` row linked to any issue in that workspace |
| 3 | **Cross-Workspace View** at `/workspaces/all` | Lists all projects the user can access, **grouped by workspace** (via `memberships`). Per workspace: name, project count, issue count, open/urgent counts. Per project: name, description, issue/open/urgent counts. Final field set to be confirmed against the API response |
| 4 | **Workspace search by name** | Simple filter on the user's memberships, no schema change |

### ⏸ Deferred (previously approved, removed from this version)

| Feature | Notes |
|---------|-------|
| **List / Board (Kanban) toggle** on the project page | Not built in this version. The project page is **List only**, with **no toggle** (a one-option toggle is pointless). If reconsidered later, treat it as a separate scoped feature. Note: with 6 statuses it would need 6 columns |

---

## ❌ Excluded Elements (Do NOT build)

### Sprints / Cycles
1. Sprint/Cycle labels anywhere (Dashboard, My Issues, Issue detail, Project detail), e.g. "Sprint Cycle 14", "Sprint 24 ACTIVE", "Cycle Window"
2. "Completed this Sprint" stat
3. Version/build strings tied to cycles (e.g. "v2.14.0-cycle-14", "Cycle 14 · v2.4" in the sidebar footer)

### Issue Detail Page
4. Git Branch field on an issue
5. Linked Dependencies (Blocks / Related issues)
6. Acceptance Criteria checklist (checkboxes + MERGED/VERIFIED/Active Blocker tags)
7. Reporter field (separate from Assignee)
8. Version tag (e.g. "v2.14-rc1")
9. Share button
10. "Ledger Hash" / any decorative sha256-style hash display

### Labels
11. Label categories/grouping (e.g. "Bug & Incident", "Functional Domains", "Workflow & Triaging")
12. Per-label scope badge (Workspace vs Project)

### Saved Views
13. Personal / Shared with Team badges
14. "Default" view badge (and the red "default view" styling in the sidebar)

### Global Sidebar / Header
15. Notification bell icon
16. Job title under user name (e.g. "Staff Engineer")

### My Issues Page
17. Export CSV / Export Ledger / Export Manifest (all variants, anywhere in the app)
18. "+ Create Task" — the feature is kept but the label must read "New Issue" to match the app's terminology

### Workspaces Page
19. "Last synced" timestamp + Refresh button/mechanism
20. Ledger / Grid view toggle
21. "Ledger Version" number display

### Sign In Page
22. "Keep session active for X days" as a user-toggleable checkbox (session TTL is a fixed server-side config)
23. GitHub Enterprise / Google Workspace SSO login
24. "Forgot passkey?" (password reset flow)
25. "System Reliability / Uptime %" stat

### Sign Up Page
26. GitHub / Google Workspace SSO signup
27. "Workspace Handle" (subdomain/slug field during signup)

### Projects Modal / Project Detail Page
28. Project "Lead" field
29. Project "Completion & Health" (%, Green/Amber/Attention status)
30. Project prefix/key (e.g. "PRJ-ECOMM")
31. Target Milestone field
32. Repository link (GitHub integration)
33. "Updated by CI daemon" / any CI integration text
34. Cycle Velocity / MTTR (replaced by an **Unassigned** count tile)
35. Health Distribution (Healthy/Attention/Blocked) in the Cross-Workspace view

### General Decorative/Branding Elements (all screens)
36. Any "Ledger sync", "PARITY CHECK", "SYNCED", "MANIFEST VER", "workspace synced with origin/main" style system-status text
37. Fake terminal/system chrome text (e.g. "NODE: US-EAST-01A", "CLUSTER: US-EAST-SYS-1", "SYS.OPERATIONAL")

### Added in design review (v2)
38. Compliance / certification / performance claims (e.g. "SOC2-TYPE-II / ISO-27001", "ISO 9001 compliant", "9.4ms p99")
39. Password strength "entropy in bits" display (a strength meter based on real rules such as length is allowed, without a made-up bit count)
40. Links to pages that do not exist: Terms, Privacy, Documentation, Settings, Workspace Settings, Help. This also removes the "I agree to the Terms" checkbox on Sign Up
41. Per-project "Last active … ago" in the Dashboard Projects panel (only workspace-level last activity is approved)
42. Label description column (labels have a name and a color only)
43. Project icons and project color dots (no such fields in the schema)
44. Saved view query-string display (e.g. `is:open due:<today`). Show the view's filters as chips instead
45. "High Priority" tag on a Project (projects have a status, not a priority)
46. Keyboard-shortcut hints for shortcuts that are not actually implemented (only show hints for implemented ones)
47. **Issue key** (e.g. `ENG-104`): the KEY column in every table, the key chip in the Issue detail header, and the key in Quick search results. The issue title is the primary identifier. Re-add only if the backend introduces a per-workspace sequential number
48. "Save as view" button on My Issues (My Issues is cross-workspace, saved views are per workspace)
49. Custom label colors (hex picker). Only the 6 fixed palette colors are allowed

---

## 🔒 Decisions Locked

### Terminology
- Always **Issue** (never task/ticket). Primary action label: **New Issue**.

### Enums (source of truth: `shared/`, imported by the frontend, never retyped)
```ts
ISSUE_STATUS   = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled']
ISSUE_PRIORITY = ['no_priority', 'low', 'medium', 'high', 'urgent']
```

| Status | Color token | Notes |
|---|---|---|
| backlog | `--status-planning` (slate) | |
| todo | `--status-todo` (blue) | new token |
| in_progress | `--status-progress` (amber) | |
| in_review | `--status-active` (teal) | |
| done | `--status-resolved` (green) | |
| cancelled | muted text + line-through | no tint |

- Priorities are always shown with **icon + text** (never color alone).
- `no_priority` is shown as a muted dash "—" with the text "No priority" and sorts **last**.

### Dashboard tiles (Option C)

| Tile | Counts |
|---|---|
| Open | `backlog` + `todo` |
| In Progress | `in_progress` + `in_review` |
| Done | `done` only |
| Overdue | due date passed **and** status not in (`done`, `cancelled`) |

`cancelled` issues are not shown in any tile. Tile subtitles must not mention cycles or sprints.

### Other page-level decisions
- My Issues tiles: Assigned, In Progress, Urgent/High, Overdue (no "Completed this sprint").
- Project detail tiles: Issue Volume, Completion Rate, Critical Attention, **Unassigned**.
- Serif font (`font-serif`) is used **only** for page titles and modal titles, applied explicitly (no global `h1`–`h4` rule). Panel titles stay Sans. Modal titles are italic.
- Labels use a fixed palette of 6 colors: violet, magenta, indigo, olive, sand, plum. The color should be stored as a **key**, not a hex, so light/dark mode can pick the right values.
- Auth pages and the Join page have no app shell.
- **Issues page** (`/[workspaceSlug]/issues`): workspace-wide list. Same layout as My Issues without the "assigned to me" scope, plus an Assignee filter. Four tiles: Open, In Progress, Done, Overdue. Has a "Save as view" button.
- **Saved views** are created with "Save as view" on the Issues page (current filters + a name). In the Saved Views modal, "+ New View" links to the Issues page, and edits are rename and delete only.
- **New Issue form:** status and priority are optional. Defaults come from `shared/` (`DEFAULT_ISSUE_STATUS`, `DEFAULT_ISSUE_PRIORITY`), and the frontend only sends them if the user changed them.
- **Priority Overview** (Dashboard panel): 5 rows, including "No priority", so the rows sum to the total.
- **Quick Search (⌘K)** is global across all of the user's workspaces. Results show the workspace name.

### Routes and shell
- Global pages (no workspace): `/workspaces`, `/workspaces/all`, `/my-issues`.
- Workspace pages: `/[workspaceSlug]/dashboard`, `projects`, `projects/[projectId]`, `issues` (workspace-wide list), `issues/[issueId]`. Labels and Saved Views are **modals**, not routes.
- **One app shell** (same topbar, same visual style). The sidebar content depends on the page type:

| | Workspace pages | Global pages |
|---|---|---|
| Header | workspace switcher | app name only |
| NAVIGATION | Dashboard, My Issues, Projects, Labels, Saved Views | Workspaces, All Projects, My Issues |
| PROJECTS / SAVED VIEWS sections | shown | hidden |
| Invite team member | shown | hidden |
| New Issue button | shown | hidden (needs a workspace and a project) |

- Labels and Saved Views are modals (not standalone pages), opened from the sidebar.

---

## ❓ Open Questions for the Backend

1. How is the workspace `slug` produced (generated from the name, or user-provided)?
2. How are saved-view filters stored (JSON shape)?
3. What are the project statuses (e.g. Active / Planning / Archived)?
4. Is the label color stored as a key (`violet`) or a hex?
5. Does the API return the issue count for each saved view (sidebar counts), or should the counts be dropped?
6. Does the issues endpoint accept multiple status values in one filter (e.g. `backlog,todo`)? Needed to open a Dashboard tile as a filtered list.
7. Does the dashboard endpoint return a count per status (so the frontend can sum the tile groups)?
8. Reserved workspace slugs: a workspace must not get a slug equal to a top-level route (`workspaces`, `my-issues`, `sign-in`, `sign-up`, `join`, `api`), otherwise its pages would be unreachable. Does the backend reject these?

---

## Notes for Implementation

- These exclusions apply to **all screens**, even if a decorative element only appeared once in a mockup. If it represents a concept in the excluded list (any Cycle/Sprint reference, any Export button, any SSO button, any issue key), it must not appear anywhere in the rebuilt frontend.
- The mockups are a **visual reference**. Where a mockup shows old values (e.g. "Open / In Progress / Closed", `ENG-104`), the decisions in this document win.
- Anything not listed above but present in the mockups is assumed to map to an existing backend feature and is safe to implement as designed.
- If any exclusion is reconsidered later (real CSV export, real SSO, Board view, issue numbers), update this document and treat it as a separate scoped feature.
