# AGENTS.md — Start here

You are working on the **frontend** of **Mini Issue Tracker**: a lightweight issue tracker for small engineering teams (Workspace → Projects → Issues). Stack: Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS 4 + shadcn/ui, using pnpm. This repo is the frontend only; the backend is a separate repo built by someone else.

## Read in this order

| # | File | Why |
|---|---|---|
| 1 | `docs/DESIGN_EXCLUSIONS.md` | What must **not** be built, plus the locked design decisions. **Highest priority** |
| 2 | `docs/ARCHITECTURE.md` | Folder structure, layouts, data flow, and every page |
| 3 | `docs/DECISIONS.md` | Why each decision was made, and what was rejected. Do not reverse these without being asked |
| 4 | `docs/DESIGN_SYSTEM.md` | Tokens, typography, and how each visual component looks |
| 5 | `docs/CONVENTIONS.md` | How to write code in this repo |
| 6 | `docs/FRONTEND_DATA_CONTRACT.md` | The data the frontend sends and expects from the backend (read when touching forms or API calls) |

If two files disagree, the order above wins.

## Non-negotiable rules

1. **Never build anything listed in `docs/DESIGN_EXCLUSIONS.md`**, not even as static UI. Mockups are a visual reference only; where they show old values (`ENG-104`, "Open / In Progress / Closed", Sprint/Cycle text), the written decisions win.
2. **Never invent backend data.** No fields, endpoints, counts or statuses that are not in `docs/FRONTEND_DATA_CONTRACT.md`. If something is missing, say so and ask.
3. **Enums and defaults come from `shared/`.** Never retype statuses, priorities, label colors or defaults, and import them only through `@shared/*` (the folder is an interim local copy of the backend contract).
4. **`app/` is routing only.** Pages and layouts stay thin; UI goes in `components/`, API calls in `lib/api/`.
5. **Server Component by default.** Add `'use client'` only to the smallest component that needs state or events.
6. **Reads on the server, writes from the client.** Pages and layouts fetch via `lib/api/server`. Mutations use `useMutation` (`lib/queries`) over `lib/api/client`, then invalidate and `router.refresh()`. TanStack Query is only for interactive data (Quick Search, @mentions, dropdown lists). No axios.
7. **Filters live in the URL**, converted with `lib/filters`.
8. **Use design tokens only.** No hex values and no raw Tailwind palette colors (`bg-red-500`) in components. Do not add `dark:` color overrides for token colors; the tokens already flip in dark mode.
9. **Terminology:** always **Issue** (never task/ticket). The primary action is **New Issue**.
10. **There is no issue key.** The issue title is the identifier. Do not add a KEY column.
11. **Color is never the only signal.** Status and priority always show text (priority also an icon).
12. **Accessibility is part of done:** form errors tied to fields, focus trapped in dialogs, `Esc` closes, one `<main>` per page.

## Before writing code

- Find the page or component in `docs/ARCHITECTURE.md` and put the code where it says.
- Check `docs/DESIGN_SYSTEM.md` for an existing token or component pattern before creating a new one.
- Check `docs/DECISIONS.md` if you are tempted to "improve" an architectural choice.

## When unsure

Ask a short question instead of guessing. Do not silently pick between two valid options when the files do not say which; list the options and their trade-offs.

## Definition of done

- TypeScript strict passes, ESLint and Prettier are clean.
- Pure logic (`lib/filters`, `lib/issues`) has unit tests; components have React Testing Library tests; axe reports no violations.
- Works in light **and** dark mode.
- Has empty, loading and error states where data is shown.
- No excluded element, no hardcoded enum, no raw color.

## Project status

Setup is **starting** (see `docs/ARCHITECTURE.md` section 10). Commands will be documented in `docs/SETUP.md` once the project has been created.
