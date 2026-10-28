# CONVENTIONS — How we write code here

> Everything here is decided (see `DECISIONS.md`, section F). If a convention gets in your way, say so and explain; do not silently work around it.

---

## 1. Files and naming

| Thing | Convention | Example |
|---|---|---|
| React component file | `PascalCase.tsx`, file name = component name | `StatusBadge.tsx` |
| Hook | `use-kebab-case.ts`, exports `useCamelCase` | `use-debounce.ts` |
| `lib/` modules | `kebab-case.ts` | `relative-time.ts` |
| Routes and folders in `app/` | `kebab-case` (Next requires the special file names) | `my-issues/page.tsx` |
| Types and interfaces | `PascalCase` | `IssueListItem` |
| Constants | `UPPER_SNAKE_CASE` | `ISSUE_STATUS` |
| Booleans | prefixed `is`, `has`, `can` | `isOverdue` |

- One exported component per file. Tiny private helpers can live in the same file.
- Named exports for components, hooks and utilities. Default exports only where Next.js requires them (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`).
- Identifiers and UI text are in English.

---

## 2. Imports

- Use the `@/` path alias for everything in this repo (the project root). No `../../..` chains.
- Import contract types, enums and schemas from their frontend-local source modules. Never copy them into other files or invent values.
- Use `import type { ... }` for type-only imports.
- Order: external packages, `@/` modules, relative imports, styles.

---

## 3. Server and Client Components

- Everything is a **Server Component** unless it needs state, effects, event handlers or browser APIs.
- Put `'use client'` on the **smallest** component that needs it (a form, a dialog, a filter bar), not on a whole page.
- Server-only modules (`lib/api/server/*`) import the `server-only` package. If a Client Component imports one by mistake, the build fails instead of producing a hidden bug.
- Pass data **down** from Server Components as props. Do not fetch inside a Client Component to display something a page could have loaded.

---

## 4. Data: reads, writes, errors

### Reads
```
page.tsx / layout.tsx  →  lib/api/server/<resource>.ts  →  server/fetcher.ts  →  backend
```
- The server fetcher uses `API_URL`, forwards the session cookie, redirects to `/sign-in` on `401`, and throws `ApiError` otherwise.
- One function per backend operation. Return typed data from frontend-local contract types. Never return raw `Response`.

### Writes
```
Client Component  →  useMutation (lib/queries/<resource>.ts)  →  lib/api/client/<resource>.ts  →  /api/*
```
- Every client mutation uses `useMutation`, so forms and buttons get one consistent `isPending` and error state.
- When it settles: invalidate the affected query keys **and** call `router.refresh()`, so the client cache and the Server Components both update. Then a toast if the action deserves one.
- Do not copy page data into client state to "keep it in sync". Refresh instead.
- Optimistic UI: for data rendered by Server Components use React 19 `useOptimistic`. TanStack optimistic updates are only for data that lives in the query cache.
- Never send empty optional fields. Send the field only if it has a value; send `null` only where the contract allows clearing it (`description`, `assigneeId`, `dueDate`).
- Trim text before sending. The backend validates again.

### Client-side reads (TanStack Query)
- Use it **only** for Quick Search, the @mention picker, and dropdown option lists (projects, labels, members) in forms, filters and dialogs. Everything else is read on the server.
- Query keys come from one factory in `lib/queries/keys.ts` and **always include the workspace slug** (`['workspace', slug, 'labels']`). Never build keys inline.
- Query and mutation hooks live in `lib/queries/<resource>.ts` and call `lib/api/client/*`. They never call `fetch` directly.
- Fetch only when needed: pass `enabled: open` for lists inside dialogs and popovers.
- The `QueryClient` is created once per browser session in `providers/query-provider.tsx`, and **cleared on sign-out** (`queryClient.clear()`), because it holds per-user data.
- Default timing (stale time, retries) is set once in the provider. A per-query override needs a comment saying why.
- Never use `use cache`, the Next `fetch` cache, or any shared server cache for user data.
- No axios. Native `fetch` only.

### Errors
- All API failures become an `ApiError` (`lib/api/errors.ts`) carrying `code`, `message` and optional `fields`.
- Field errors go **under the matching field**. Other errors show as a banner (page level) or a toast (action level).
- `401` always redirects to sign-in. `403` and `404` show the not-found or no-access page.

---

## 5. Forms

- Validate with frontend-local Zod schemas aligned with the confirmed backend contract.
- Form library: **react-hook-form** with the Zod resolver (the shadcn form pattern).
- Every field has a visible `<label>`. Required fields are marked.
- On submit: disable the submit button while pending; on validation failure, focus the **first** invalid field.
- Errors: `aria-invalid` on the input, message linked with `aria-describedby`.
- Defaults shown in a form (for example the status and priority of a new issue) come from frontend-local contract constants. Do not retype them.
- Password-strength hints are UX only; the backend decides what is enforced.

---

## 6. Filters and URL state

- Filters are URL query params, parsed and serialized only through `lib/filters`. Do not build query strings by hand.
- Typing in a search field is debounced (about 250ms) before it updates the URL.
- Update the URL with `router.replace` (not `push`) while the user is still refining filters, so Back does not step through every keystroke.
- A saved view stores exactly the filters object that `lib/filters` produces.

---

## 7. Styling

- Tailwind utility classes with **semantic token classes** (`bg-surface-low`, `text-text-secondary`, `border-border-hairline`, `text-status-progress`). No hex, no raw palette classes.
- Merge classes with `cn()` from `lib/utils`.
- Use `cva` for components with variants (shadcn pattern).
- Do **not** write `dark:` overrides for token colors. The tokens already flip.
- Avoid arbitrary values like `w-[237px]`. If the design needs a new value, add a token or a scale step.
- Status, priority and label colors are mapped in `lib/issues` (one place), and rendered by `StatusBadge`, `PriorityIndicator` and `LabelChip`. Do not repeat the mapping in other components.

---

## 8. Dialogs

- Use the shadcn Dialog (Radix). It already handles the focus trap, `Esc` and focus return.
- Open/close state lives in the **closest common Client ancestor**. No global store.
- Workspace-level dialogs are mounted by `[workspaceSlug]/layout.tsx`; page-specific dialogs are mounted by their page.
- Destructive actions always go through a confirm dialog that names what will be deleted.

---

## 9. States every data view needs

| State | How |
|---|---|
| Loading | `loading.tsx` with skeleton rows (no spinners) |
| Empty | A short message, one hint, and the relevant action button |
| Error | An inline banner with "Try again" |
| Not found / no access | `not-found.tsx` |

---

## 10. Accessibility checklist (per component or page)

- [ ] Keyboard-only usage works, with a visible focus ring
- [ ] Labels on all inputs; errors linked to fields
- [ ] Status and priority have text, not just color
- [ ] Dialogs trap focus, close on `Esc`, return focus to the trigger
- [ ] One `<main>` per page; headings in a sensible order
- [ ] axe-core reports no violations

---

## 11. Testing

- Write tests **with** each feature, not at the end.
- **Pure logic** (`lib/filters`, `lib/issues`, `lib/utils`): unit tests with Vitest. These are the highest-value tests (tile grouping, overdue rule, filter ⇄ URL).
- **Components:** React Testing Library. Query by role and label, the way a user would. No snapshot tests.
- **Accessibility:** run axe-core on every page-level component and shared component.
- Location: next to the file under test (`StatusBadge.test.tsx`).
- Mock the API layer (`lib/api/*`), not `fetch` internals.
- Components that use queries or mutations are rendered inside a test wrapper with a **fresh `QueryClient` per test** (retries off).

---

## 12. Things we never do

- Build anything listed in `DESIGN_EXCLUSIONS.md`.
- Hardcode statuses, priorities, label colors or defaults.
- Invent fields, endpoints or counts the contract does not have.
- Show a decorative status text ("SYNCED", uptime, hashes, versions).
- Call a task a "task" or a "ticket".
- Add an issue key or a KEY column.
- Put business logic or reusable UI inside `app/`.
