# SETUP — Mini Issue Tracker (Frontend)

> **Goal:** a project where `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck` and `pnpm test:run` all pass, with the design tokens, fonts, providers and folder structure already in place, so feature work can start immediately.
> **How to use it:** go phase by phase, in order. Every phase ends with a **Checkpoint**. If a checkpoint fails, stop and fix it before moving on. Do not "keep going and fix it later".
> **Companion docs:** `ARCHITECTURE.md` (where things go), `DECISIONS.md` (why), `CONVENTIONS.md` (how).

**Things that depend on the tool versions you get (and cannot be fully predicted):**
`create-next-app` and `shadcn init` are interactive, and their questions and generated files change between versions. Where this file says "check", it is a real check: compare, and if it differs, **stop and report what you see** instead of guessing.

---

## Phase 0 — Prerequisites

| Tool | Requirement | Check |
|---|---|---|
| Node.js | **20.9 or newer** (Next.js 16 minimum) | `node -v` |
| pnpm | any recent version | `pnpm -v` |
| Git | any | `git --version` |

If Node is older than 20.9, upgrade it first (nvm, fnm, or the installer). Nothing below works on an older Node.

**Checkpoint 0:** `node -v` prints `v20.9.0` or higher.

---

## Phase 1 — Create the Next.js app

Run this **in the parent folder** where the repo will live (not inside a folder that already has our `.md` files):

```bash
pnpm create next-app@latest <project-name>
```

When it asks whether to use the recommended defaults, choose **"No, customize settings"**, then answer:

| Question | Answer | Why |
|---|---|---|
| TypeScript | **Yes** | Locked decision |
| Linter | **ESLint** | Locked decision |
| React Compiler | **No** | Not needed; adds build complexity |
| Tailwind CSS | **Yes** | Locked decision (we verify it is v4 below) |
| `src/` directory | **No** | Our structure keeps `app/` at the repo root |
| App Router | **Yes** | Locked decision |
| **Cache Components** | **No** | We read the session cookie in every page and layout. With Cache Components on, that dynamic access must be wrapped in Suspense everywhere, for no benefit: all our data is per-user, so nothing is cacheable (decision D-39) |
| Import alias | **No** (keep `@/*`) | The alias we agreed on |
| **AGENTS.md** | **No** | We have our own, and two files with the same name would clash |

Then:

```bash
cd <project-name>
pnpm dev
```

Open `http://localhost:3000`. Stop the server with `Ctrl+C`.

### Copy our docs into the repo root
Copy these into the project root (next to `package.json`):
`AGENTS.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `DESIGN_SYSTEM.md`, `DESIGN_EXCLUSIONS.md`, `CONVENTIONS.md`, `FRONTEND_DATA_CONTRACT.md`, `SETUP.md`.

### Verify what was generated
Open `package.json` and check:

| Package | Must be |
|---|---|
| `next` | starts with **16** |
| `react`, `react-dom` | start with **19** |
| `tailwindcss` | starts with **4** |

Also check:
- There is **no** `tailwind.config.*` file (Tailwind 4 does not need one).
- `next.config.ts` does **not** contain `cacheComponents`.
- `tsconfig.json` has `"strict": true`.
- A file `eslint.config.mjs` exists (flat config).

### Commit
```bash
git add -A
git commit -m "chore: scaffold Next.js app and project docs"
```

**Checkpoint 1:** the three versions match, no `tailwind.config.*`, `pnpm dev` shows the default page.
*If a version does not match, stop and report it.*

---

## Phase 2 — TypeScript, aliases and the interim `shared/` folder

### 2.1 Path aliases
In `tsconfig.json`, make `compilerOptions.paths` contain both aliases:

```json
"paths": {
  "@/*": ["./*"],
  "@shared/*": ["./shared/*"]
}
```

**Why `@shared/*`:** every import of the contract goes through this one alias, so when we decide how `shared` is really shared between the two repos, only the alias target changes (decision D-01).

### 2.2 The interim `shared/` folder
Create these files. The enums are the backend's real values. The label colors and the two defaults are **proposed** and must be confirmed with the backend developer.

`shared/enums.ts`
```ts
// INTERIM copy of the backend contract. Keep identical to the backend.
// Import only through the alias: import { ... } from "@shared/enums"

export const ISSUE_STATUS = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
] as const;
export type IssueStatus = (typeof ISSUE_STATUS)[number];

export const ISSUE_PRIORITY = ["no_priority", "low", "medium", "high", "urgent"] as const;
export type IssuePriority = (typeof ISSUE_PRIORITY)[number];

export const WORKSPACE_ROLE = ["owner", "member"] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLE)[number];

// PROPOSED, confirm with the backend (Q3 in FRONTEND_DATA_CONTRACT.md)
export const LABEL_COLORS = ["violet", "magenta", "indigo", "olive", "sand", "plum"] as const;
export type LabelColor = (typeof LABEL_COLORS)[number];

// PROPOSED defaults for a new issue (the server applies them if the field is omitted)
export const DEFAULT_ISSUE_STATUS: IssueStatus = "todo";
export const DEFAULT_ISSUE_PRIORITY: IssuePriority = "no_priority";
```

`shared/README.md`
```md
# shared/ (interim)

A local copy of the backend contract: enums, defaults, and later the Zod schemas and types.
**Do not edit values here on your own.** They must match the backend. Any change comes from the backend developer.
How this folder is shared long term between the two repos is undecided (see DECISIONS.md, D-01).
Always import through the `@shared/*` alias.
```

**Why `as const` and derived types:** the array is the single source, and `IssueStatus` is derived from it. Add a value to the array and the type updates by itself, so TypeScript flags every place that must handle the new value.

### 2.3 Verify strictness
```bash
pnpm exec tsc --noEmit
```

**Checkpoint 2:** `tsc --noEmit` prints nothing (no errors).

---

## Phase 3 — Runtime dependencies

```bash
pnpm add @tanstack/react-query react-hook-form zod @hookform/resolvers server-only next-themes
pnpm add -D @tanstack/react-query-devtools
```

| Package | Used for |
|---|---|
| `@tanstack/react-query` | Client-side reads and all mutations (D-38) |
| `@tanstack/react-query-devtools` | Dev-only inspector for the query cache |
| `react-hook-form`, `@hookform/resolvers` | Forms (D-32) |
| `zod` | Validation schemas |
| `server-only` | Makes the build **fail** if a Client Component imports server-only code |
| `next-themes` | Light/dark switching with the `.dark` class (shadcn's standard way) |

**Zod version:** the schemas will be shared with the backend, so both sides must use the **same major version of Zod**. Check which one the backend uses before writing schemas (Q25 in the contract).

**Checkpoint 3:** `pnpm install` finished without errors.

---

## Phase 4 — shadcn/ui (run this BEFORE merging our CSS)

**Why before:** `shadcn init` edits `app/globals.css`. If we merge our tokens first, init would overwrite them. So init first, then replace the file (Phase 5).

```bash
pnpm dlx shadcn@latest init
```

The CLI is interactive and changes between versions. Guidance for the questions:

| If it asks about | Choose |
|---|---|
| Primitive library / base | **Radix** (the default) |
| Style / preset / theme / base color | Anything. Our tokens replace all of it in Phase 5 |
| CSS variables | **Yes** |

### Check what init produced
- `components.json` exists, with `"rsc": true` and `"tsx": true`, and an **empty** `tailwind.config` entry (Tailwind 4 has no config file).
- Aliases in `components.json` point to `@/components`, `@/components/ui`, `@/lib/utils`, `@/lib`, `@/hooks`.
- `lib/utils.ts` exists and exports `cn`.
- Look at `app/globals.css` and note whether it contains the line `@import "tw-animate-css";`. **You need this answer in Phase 5.**

### Add the components we know we need
```bash
pnpm dlx shadcn@latest add button input label textarea checkbox select dialog dropdown-menu popover command tabs tooltip separator skeleton sonner form
```

If the CLI reports that `form` is unavailable or deprecated, **stop and tell me**. We will use another RHF integration; do not invent one.

**Checkpoint 4:** `components.json` and `lib/utils.ts` exist, and `components/ui/` contains the components above.

---

## Phase 5 — Merge the design tokens into `globals.css`

Replace the **entire** content of `app/globals.css` with the provided final `globals.css`. It already contains everything merged: the base tokens, the label palette (6 colors), the `--status-todo` token and the `--priority-high` token.

Then, if Phase 4 showed `@import "tw-animate-css";` in shadcn's version, add that line **right after** `@import "tailwindcss";`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));
```

(If shadcn did not add it, do not add it.)

**Notes:**
- The old `label-tokens.css`, `status-todo-tokens.css` and `priority-high-tokens.css` are now redundant. You can delete them or keep them out of the repo.
- shadcn components use classes like `rounded-xl` and `rounded-lg`. Our design uses 4px radii, so when you first use Card/Dialog, check their radius against `DESIGN_SYSTEM.md` and adjust the component file. That is expected, not a bug.

**Checkpoint 5:** `pnpm dev` starts without CSS errors. (The visual check is in Phase 6.)

---

## Phase 6 — Fonts, providers and the root layout

### 6.1 Providers

`providers/theme-provider.tsx`
```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props} />;
}
```

`providers/query-provider.tsx`
```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  // One client per browser session. useState keeps it stable across re-renders.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          // Timing is set once, here (see CONVENTIONS.md). Tune later with real usage.
          queries: { staleTime: 60_000, retry: 1 },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

**Why `useState(() => new QueryClient())`:** creating the client at module level would share one cache between users on the server. Creating it inside render would reset the cache on every re-render. `useState` creates it once per browser session.

### 6.2 Root layout (`app/layout.tsx`)

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import "./globals.css";

// The variable names MUST match what globals.css reads (--font-inter, etc.)
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"], // italic is needed for modal titles, otherwise the browser fakes it
  variable: "--font-newsreader",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Mini Issue Tracker", template: "%s · Mini Issue Tracker" },
  description: "A lightweight issue tracker for small engineering teams.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <QueryProvider>{children}</QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Why these choices:**
- `suppressHydrationWarning` on `<html>`: `next-themes` adds the `dark` class on the client, which would otherwise trigger a hydration warning.
- `defaultTheme="light"`, `enableSystem={false}`: the dark mockups were not reviewed yet and there is no toggle, so we do not switch users to dark just because their OS is dark. Revisit when the theme toggle is built.
- The toast `Toaster` comes from shadcn's `sonner` component; there is no separate `toast-provider`.

### 6.3 Temporary visual smoke test
Temporarily replace `app/page.tsx` with this (we replace it with the real redirect later):

```tsx
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="space-y-4 p-8">
      <h1 className="font-serif text-3xl">Workspaces (serif title)</h1>
      <p className="font-mono text-xs uppercase tracking-wider text-text-tertiary">
        mono metadata · text-tertiary
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-sm border border-status-progress-border bg-status-progress-bg px-2 py-0.5 font-mono text-[11px] uppercase text-status-progress">
          In progress
        </span>
        <span className="rounded-sm border border-status-todo-border bg-status-todo-bg px-2 py-0.5 font-mono text-[11px] uppercase text-status-todo">
          Todo
        </span>
        <span className="rounded-sm border border-label-violet-border bg-label-violet-bg px-2 py-0.5 font-mono text-[11px] text-label-violet">
          label
        </span>
        <span className="font-mono text-xs text-priority-high">High</span>
      </div>
      <Button>New Issue</Button>
    </main>
  );
}
```

Run `pnpm dev` and check in the browser:

1. The page background is a very light purple-white (`#fbf8fc`), and the text is dark.
2. The title is **serif** (Newsreader). The metadata line is **monospace**. The rest is Inter.
3. The four colored items show **distinct tinted** colors (amber, blue, violet, orange).
4. The **New Issue** button is **deep green** (`#087f73`) with white text.
5. In DevTools, add the class `dark` to the `<html>` element: the page turns dark, and all colors switch with it, with no extra work.

**Checkpoint 6:** all five checks pass. If the fonts look wrong, the usual cause is a mismatch between the `variable` names in the layout and the names in `globals.css`.

---

## Phase 7 — ESLint and Prettier

### 7.1 Install
```bash
pnpm add -D prettier prettier-plugin-tailwindcss eslint-config-prettier
```

### 7.2 Prettier
`.prettierrc`
```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./app/globals.css",
  "tailwindFunctions": ["cn", "cva"]
}
```
`.prettierignore`
```
.next
node_modules
pnpm-lock.yaml
*.md
```
**Why `tailwindStylesheet`:** with Tailwind 4 the plugin must be told where the CSS config lives, to sort classes correctly. **Why ignore `*.md`:** so Prettier does not reformat the tables in our docs.

### 7.3 ESLint
`next lint` was **removed** in Next.js 16, so we run ESLint directly. Open the generated `eslint.config.mjs`, keep what is there, and add `eslint-config-prettier` **last** in the config array (it turns off ESLint rules that fight Prettier):

```js
import prettier from "eslint-config-prettier";
// ...inside the exported array, as the LAST item:
prettier,
```

(The exact shape of the generated file depends on the `create-next-app` version. Add the import and put `prettier` last in the array.)

### 7.4 Scripts
In `package.json`, make sure `scripts` contains:
```json
"lint": "eslint .",
"typecheck": "tsc --noEmit",
"format": "prettier --write .",
"format:check": "prettier --check .",
"test": "vitest",
"test:run": "vitest run"
```
and add:
```json
"engines": { "node": ">=20.9.0" }
```

### 7.5 Format once, then check
```bash
pnpm format
pnpm lint
pnpm typecheck
```
shadcn's generated files may be reformatted by Prettier on this first run. That is expected.

**Checkpoint 7:** `pnpm lint` and `pnpm typecheck` finish with no errors. `pnpm format:check` passes.

---

## Phase 8 — Testing: Vitest, Testing Library, axe

### 8.1 Install
```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event vite-tsconfig-paths vitest-axe
```

### 8.2 Config
`vitest.config.mts`
```ts
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true, // needed so Testing Library cleans up after each test
    setupFiles: ["./vitest.setup.ts"],
  },
});
```
`vitest.setup.ts`
```ts
import "@testing-library/jest-dom/vitest";
import "vitest-axe/extend-expect";
```
In `tsconfig.json`, add to `compilerOptions`:
```json
"types": ["vitest/globals"]
```
**Why `tsconfigPaths`:** it makes tests understand `@/` and `@shared/` from `tsconfig.json`, so we do not repeat the aliases.

### 8.3 Important limitation
**Vitest does not support `async` Server Components.** Our pages are async Server Components, so we do not unit-test the page file itself. We test: pure logic (`lib/filters`, `lib/issues`), Client Components, and presentational components. Keep pages thin (decision in `ARCHITECTURE.md`) so little logic lives in untestable files.

### 8.4 Smoke test
`components/ui/button.test.tsx`
```tsx
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";

import { Button } from "./button";

describe("Button", () => {
  it("renders its label and has no accessibility violations", async () => {
    const { container } = render(<Button>New Issue</Button>);

    expect(screen.getByRole("button", { name: "New Issue" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
```
```bash
pnpm test:run
```

**Checkpoint 8:** one test passes. *If `toHaveNoViolations` is not recognized*, replace the second line of `vitest.setup.ts` with:
```ts
import { expect } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";
expect.extend(axeMatchers);
```
*(and tell me, so I can fix this file).*

---

## Phase 9 — Environment, API proxy and route protection

### 9.1 Environment
`.env.example` (committed)
```
# Backend origin, no trailing slash. Server-side only: never use the NEXT_PUBLIC_ prefix.
API_URL=http://localhost:4000
```
Create your own `.env.local` with the real value (it is not committed):
```
API_URL=http://localhost:4000
```
**The port is a placeholder.** Ask the backend developer for the real one.

`create-next-app`'s `.gitignore` ignores `.env*`, which would also hide `.env.example`. Open `.gitignore` and add this line **after** the `.env*` line:
```
!.env.example
```

### 9.2 `next.config.ts`
```ts
import type { NextConfig } from "next";

const API_URL = process.env.API_URL;
if (!API_URL) {
  throw new Error("API_URL is not set. Copy .env.example to .env.local and set it.");
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
```
**Why a rewrite:** the browser talks to `/api/*` on the same origin, and Next forwards it to the backend. So the session cookie works without CORS.
**Assumptions to confirm with the backend:** its routes live under `/api` (Q26 in the contract).
**Deployment note:** the rewrite destination is fixed at build time, so `API_URL` must be set when you run `pnpm build`, not only when you run the server.

### 9.3 Session cookie name
`lib/auth/session.ts`
```ts
// TODO(backend): confirm the real cookie name (Q24 in FRONTEND_DATA_CONTRACT.md).
export const SESSION_COOKIE_NAME = "session";
```

### 9.4 `proxy.ts` (Next.js 16 name for the old `middleware.ts`)
```ts
import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

const AUTH_PAGES = ["/sign-in", "/sign-up"];
const PUBLIC_PREFIXES = ["/join"];

// Light check only: "is there a session cookie?". The backend decides if it is valid.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isPublic = isAuthPage || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!hasSession && !isPublic) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", pathname); // validate on use: it must start with "/"
    return NextResponse.redirect(url);
  }

  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL("/workspaces", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip the API rewrite, Next internals and any path with a file extension
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
```
**Why only a light check here:** this is the first of three protection layers (`proxy.ts`, the server fetcher, the client fetcher). A cookie's presence does not prove it is valid, so the backend response (`401`) remains the real decision (decision D-24).

**Checkpoint 9:** `pnpm dev` starts. Opening `http://localhost:3000/` while having no cookie redirects you to `/sign-in` (that page does not exist yet, so you will see a 404, and the **URL** in the address bar is what matters here).
*If there is no redirect, check that the file is named `proxy.ts` in the repo root and exports a function named `proxy`, and that you have not left a `middleware.ts` next to it.*

---

## Phase 10 — Create the folder structure

Run from the repo root. Use **Git Bash or WSL** on Windows (the quoted paths with parentheses are required in bash):

```bash
mkdir -p \
  "app/(auth)/sign-in" "app/(auth)/sign-up" "app/(auth)/join/[token]" \
  "app/(app)/(global)/workspaces/all" "app/(app)/(global)/my-issues" \
  "app/(app)/[workspaceSlug]/dashboard" \
  "app/(app)/[workspaceSlug]/projects/[projectId]" \
  "app/(app)/[workspaceSlug]/issues/[issueId]" \
  components/layout components/auth components/dashboard components/workspaces \
  components/projects components/issues components/labels components/views components/comments \
  lib/api/server lib/api/client lib/queries lib/filters lib/issues lib/utils lib/auth \
  hooks providers shared

# Git does not track empty folders, so keep them with a placeholder
find app components lib hooks -type d -empty -exec touch {}/.gitkeep \;
```

(`components/ui`, `lib/utils.ts`, `providers/` and `shared/` already have files, so they do not need a placeholder.)

Compare with the tree in `ARCHITECTURE.md` section 5. The only things that may still be missing are files, which we create as we build each feature.

**Checkpoint 10:** `git status` shows the new folders, and the layout matches `ARCHITECTURE.md`.

---

## Phase 11 — Final verification and first commit

Run all of these. Every one must pass:

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test:run
pnpm build
```

Then:
```bash
git add -A
git commit -m "chore: project setup (tokens, fonts, providers, tooling, structure)"
```

### Setup is done when
- [ ] The five commands above pass.
- [ ] The visual smoke test (Phase 6.3) looks right in light mode **and** with `class="dark"` on `<html>`.
- [ ] `proxy.ts` redirects an unauthenticated request to `/sign-in`.
- [ ] The folder structure matches `ARCHITECTURE.md`.
- [ ] No `tailwind.config.*`, no `middleware.ts`, no `cacheComponents`.

### What comes next (not part of setup)
The **foundation code** is the next stage, built with guidance, in this order:
1. `lib/api/errors.ts` (`ApiError`) and the two fetchers.
2. `lib/filters` and `lib/issues` (pure logic, with tests).
3. `StatusBadge`, `PriorityIndicator`, `LabelChip` (first real components).
4. `AppShell` and the two layouts.
5. Sign-in and Sign-up pages.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Cannot find module '@shared/enums'` | Alias missing in `tsconfig.json` | Phase 2.1 |
| Fonts fall back to a system font | `variable` names in `layout.tsx` differ from `globals.css` | Use exactly `--font-inter`, `--font-newsreader`, `--font-jetbrains-mono` |
| Everything stays light after adding `dark` | `@custom-variant dark` missing, or tokens not merged | Re-check Phase 5 |
| Build error about `cookies()` outside Suspense | Cache Components got enabled | Remove `cacheComponents` from `next.config.ts` |
| `next lint` not found | Removed in Next 16 | Use `eslint .` (Phase 7.4) |
| Redirect loop on `/sign-in` | `proxy.ts` matcher or the public list is wrong | Compare with Phase 9.4 |
| Tests: `document is not defined` | `environment: "jsdom"` missing | Phase 8.2 |
| Tests: `toHaveNoViolations` is not a function | axe matcher not registered | Fallback in Checkpoint 8 |
| Build fails with "API_URL is not set" | `.env.local` missing at build time | Create it (Phase 9.1) |
| shadcn init output differs from what is described | CLI version changed | Stop and send me the output |
