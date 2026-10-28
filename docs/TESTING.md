# Testing Guide --- Issue Tracker Frontend

> **Purpose:** This document is the source of truth for future
> developers and AI coding agents writing or maintaining tests in this
> repository. Read it before adding tests or changing test
> configuration.

## 1. Project context and constraints

-   **Framework:** Next.js App Router (Next.js 16).
-   **UI:** React 19, TypeScript with strict checking, Tailwind CSS 4,
    shadcn/ui components.
-   **Test runner:** Vitest.
-   **Component testing:** React Testing Library, DOM Testing Library,
    `@testing-library/user-event`.
-   **DOM environment:** jsdom.
-   **Accessibility checks:** `vitest-axe` / axe.
-   **Package manager:** pnpm. Use pnpm commands and keep
    `pnpm-lock.yaml` authoritative.
-   The application uses an **Engineering Ledger** visual direction.
-   Use the product term **Issue** (not "task" or "ticket") in UI and
    tests unless the API/domain contract explicitly uses another term.
-   **There must be no `shared/` directory and no `@shared/*` alias.**
    Do not create them or instruct the user to add them.
-   Follow the architecture in `ARCHITECTURE.md`: App Router files
    handle routing; Server Components are the default; add
    `"use client"` only at the smallest necessary interactive boundary.
-   Do not invent backend behavior or test against imaginary endpoints,
    fields, enums, or capabilities. Use the actual API contract and
    current implementation.
-   Do not change production code just to make a weak test pass. Prefer
    testing observable behavior and fixing the real cause.

## 2. What is currently configured

The following has been established during Phase 8:

-   `vitest` is installed (observed version: `5.0.5`).
-   Development dependencies installed for testing include:
    -   `@vitejs/plugin-react`
    -   `jsdom`
    -   `@testing-library/react`
    -   `@testing-library/dom`
    -   `@testing-library/jest-dom`
    -   `@testing-library/user-event`
    -   `vite-tsconfig-paths`
    -   `vitest-axe`
-   Vitest uses jsdom and a setup file.
-   The TypeScript configuration includes `"types": ["vitest/globals"]`
    so global `describe`, `it`, and `expect` are typed.
-   The first smoke test is `components/ui/button.test.tsx`.
-   The setup imports `@testing-library/jest-dom/vitest`, then
    explicitly registers `vitest-axe/matchers` with Vitest's `expect`.
-   **Important TypeScript workaround:** for axe, use
    `expect((await axe(container)).violations).toHaveLength(0)` instead
    of `.toHaveNoViolations()`. The latter failed TypeScript checking in
    this repository even after runtime matcher registration.
-   `pnpm typecheck`, `pnpm test:run`, `pnpm lint`, `pnpm format:check`,
    and `pnpm build` all passed after the above changes.
-   The test suite currently contains one smoke test. Passing Phase 8
    means the testing infrastructure and initial smoke test work; it
    does **not** mean the application has comprehensive test coverage.

Before changing this setup, inspect the current files and package
versions; do not assume this guide supersedes the repository's actual
code if the code has intentionally evolved.

## 3. Important files

Expected testing files and their responsibilities:

  -----------------------------------------------------------------------
  File                                Responsibility
  ----------------------------------- -----------------------------------
  `vitest.config.mts`                 Vitest configuration: React plugin,
                                      TS path resolution, jsdom, globals,
                                      setup file

  `vitest.setup.ts`                   Global test setup and matcher
                                      registration

  `components/ui/button.test.tsx`     Initial smoke test for Button and
                                      axe

  `tsconfig.json`                     TypeScript configuration including
                                      Vitest globals

  `package.json`                      Test and validation scripts

  `pnpm-lock.yaml`                    Locked dependency graph
  -----------------------------------------------------------------------

Do not add a test-only `shared/` directory. Keep tests near the
component when that matches existing repository conventions, or use a
dedicated test directory if the project later adopts one consistently.

## 4. Commands

Run commands from the repository root.

``` bash
# Run the full test suite once; preferred for verification and CI-like checks
pnpm test:run

# Run Vitest in watch mode during development
pnpm test

# Check TypeScript, including test files
pnpm typecheck

# Run ESLint
pnpm lint

# Verify Prettier formatting without modifying files
pnpm format:check

# Apply Prettier formatting
pnpm format

# Verify the production build
pnpm build
```

A successful test run should report passing test files and tests, and
exit with code `0`. `No test files found` means there are currently no
files matching Vitest's test patterns, or the test file is in the wrong
place/name; it is not a passing test run.

For a complete change, normally run `pnpm test:run`, `pnpm typecheck`,
`pnpm lint`, `pnpm format:check`, and `pnpm build`. If only a quick
iteration is needed, run the focused test first, then run the complete
checks before declaring the work done.

## 5. Current configuration shape

The intended `vitest.config.mts` shape is:

``` ts
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

The setup file should contain:

``` ts
import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";

expect.extend(axeMatchers);
```

The TypeScript `compilerOptions` includes:

``` json
"types": ["vitest/globals"]
```

Add it inside the existing `compilerOptions`; do not replace the rest of
`tsconfig.json`.

### Configuration notes

-   `environment: "jsdom"` provides a simulated DOM for component tests.
-   `globals: true` enables global Vitest APIs such as `describe`, `it`,
    and `expect`. It also supports Testing Library's automatic cleanup
    behavior in the configured environment.
-   `setupFiles` runs the shared test setup before test files.
-   `tsconfigPaths()` allows Vite/Vitest to resolve TypeScript path
    aliases such as `@/`.
-   The repository has displayed a warning that Vite supports tsconfig
    path resolution natively through `resolve.tsconfigPaths`. This is a
    cleanup opportunity, not a test failure. Do not remove
    `vite-tsconfig-paths` or change config until the installed
    Vitest/Vite versions and the supported option are checked together.
-   The repository has displayed `jsdom`'s message
    `Not implemented: HTMLCanvasElement's getContext() method` during
    axe execution. The initial test still passed. Do not install the
    `canvas` package just to silence this message unless a test
    genuinely needs Canvas or the message causes a failing test.
-   Keep setup imports compatible with the installed `vitest-axe`
    version. Do not assume a Jest-only setup recipe is compatible with
    Vitest.

## 6. Current smoke test

The initial test lives at `components/ui/button.test.tsx` and verifies
the button's accessible role/name and checks that axe reports zero
violations.

Equivalent current test:

``` tsx
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";

import { Button } from "./button";

describe("Button", () => {
  it("renders its label and has no accessibility violations", async () => {
    const { container } = render(<Button>New Issue</Button>);

    expect(
      screen.getByRole("button", { name: "New Issue" }),
    ).toBeInTheDocument();

    expect((await axe(container)).violations).toHaveLength(0);
  });
});
```

### Why this test is structured this way

-   `render` mounts the component in jsdom.
-   `screen.getByRole("button", { name: "New Issue" })` checks the
    user-visible accessible role and name rather than relying on
    implementation details such as a CSS class.
-   `toBeInTheDocument()` comes from `@testing-library/jest-dom/vitest`.
-   `axe(container)` runs automated accessibility checks on the rendered
    DOM.
-   `violations` is an array; `toHaveLength(0)` uses a matcher already
    recognized by TypeScript.
-   The test name describes observable behavior rather than
    implementation.

## 7. Rules for AI agents writing tests

When asked to add tests, an AI agent should:

1.  **Inspect first.** Read the component/module, its types, relevant
    API contract, `vitest.config.mts`, `vitest.setup.ts`,
    `tsconfig.json`, package scripts, and neighboring tests before
    editing.
2.  **Follow the real contract.** Use existing API response shapes,
    enums, status values, and actual behavior. Do not make up endpoint
    responses or unsupported features.
3.  **Test behavior, not implementation.** Prefer accessible roles,
    names, labels, user interactions, and visible outcomes. Avoid
    assertions on internal state, implementation-specific markup,
    arbitrary class names, or component internals unless the behavior
    genuinely depends on them.
4.  **Keep tests deterministic.** Do not rely on real network requests,
    real timers, random values, machine-specific paths, or external
    service availability. Mock external boundaries when needed and
    restore mocks between tests.
5.  **Use accessible queries.** Prefer `getByRole`, `getByLabelText`,
    and `getByText` where appropriate. Use `data-testid` only when a
    meaningful accessible query is not practical.
6.  **Exercise user flows.** For interactions, use
    `@testing-library/user-event` where suitable. Test what a user can
    do and observe, including validation and error states.
7.  **Test edge cases.** For pure logic, cover normal values,
    boundaries, empty inputs, invalid inputs, and relevant error
    behavior.
8.  **Keep tests focused.** Each test should communicate one behavior
    clearly. Avoid giant tests that cover unrelated scenarios.
9.  **Avoid redundant tests.** Do not add multiple tests asserting the
    same thing merely to increase the count.
10. **Accessibility is part of behavior.** Use axe on representative
    rendered components where useful, and check labels, roles, keyboard
    interaction, focus, and error messaging. Automated axe checks do not
    replace manual keyboard/interaction review.
11. **Do not test async Server Component page files directly with
    Vitest.** Put business logic in testable pure functions/modules
    where appropriate, and test Client Components/presentational
    components separately. For async server-rendering behavior, use an
    appropriate integration or end-to-end test approach if the project
    adopts one.
12. **Preserve architecture boundaries.** Server Components remain the
    default. Do not add `"use client"` solely to make a test easier.
    Keep client boundaries minimal.
13. **Keep names aligned with the product.** Use "Issue" in UI copy and
    tests.
14. **Do not introduce `shared/` or `@shared/*`.** Use API contract
    types or appropriately scoped local types.
15. **Do not weaken types to satisfy tests.** Avoid `any`, `@ts-ignore`,
    broad casts, or disabling TypeScript/ESLint rules as a shortcut.
16. **Run validation.** At minimum run the focused test and
    `pnpm typecheck`; before completing a substantial change, run all
    project checks listed above.
17. **Report truthfully.** State exactly which commands ran and
    passed/failed. Do not claim tests passed if they were not executed.

## 8. What to test by layer

### Pure logic modules

Examples, if/when these modules exist:

-   Filter parsing/normalization.
-   Sorting or grouping logic.
-   Date/formatting helpers.
-   Status/priority display mapping.
-   Input normalization and validation.
-   Derived issue counts or other deterministic calculations.

Test pure functions directly with table-driven cases when that makes
intent clearer. Do not create placeholder modules just to have something
to test.

### Presentational components

Examples:

-   Button variants and disabled behavior.
-   Empty/loading/error states.
-   Labels, badges, status indicators, metadata.
-   Dialog or dropdown content and accessible names.
-   Form fields, descriptions, and validation messages.

Prefer assertions about visible content, semantic roles, and
user-observable state.

### Client Components

Test interactions such as:

-   Opening and closing dialogs or dropdowns.
-   Selecting filters or tabs.
-   Form submission, validation, and error display.
-   Loading, success, and error feedback.
-   Keyboard interaction and focus behavior when relevant.

Use `userEvent.setup()` in a test when simulating realistic user
interactions, and `await user.click(...)`, `await user.type(...)`, etc.
when appropriate.

### Server Components and pages

Vitest does not support directly unit-testing async Next.js Server
Components in the same way as ordinary synchronous React components. Do
not force an async page into a client component just to test it.

Instead: - Keep page files thin. - Move deterministic business logic
into pure modules where that improves design. - Test
presentational/client components separately. - If route-level server
behavior requires coverage, use an integration or end-to-end testing
strategy appropriate to the project, once chosen and configured.

### Backend and data access

-   Do not call a live backend in unit tests.
-   Do not invent backend fields, endpoints, or capabilities.
-   Test API adapters and data transformations against the actual
    documented contract.
-   Mock network boundaries in unit tests; use integration tests only
    when infrastructure and test data are intentionally configured.

## 9. React Testing Library patterns

### Query hierarchy

Generally prefer: 1. `getByRole` with an accessible name. 2.
`getByLabelText` for form fields. 3. `getByPlaceholderText` only when
placeholder text is the relevant user-facing affordance. 4. `getByText`
for visible text. 5. `getByTestId` only when semantic queries are not
feasible.

Use `getBy...` when the element should exist now, `queryBy...` when
checking that an element is absent, and `findBy...` for elements that
appear asynchronously.

### Interaction example

Use this as a pattern only when it matches the actual component API:

``` tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("responds to a user click", async () => {
  const user = userEvent.setup();
  // Render the real component with the props it actually supports.
  // Provide a real callback spy when the component exposes a callback.
  // await user.click(screen.getByRole("button", { name: /open/i }));
  // Assert the user-visible result or callback.
});
```

Do not leave commented placeholder tests in the suite. The example above
is documentation only; an actual test must render the component and
assert a real outcome.

### Async behavior

-   Prefer `findBy...` for elements that should appear after
    asynchronous work.
-   Use `waitFor` only when waiting for a condition that cannot be
    expressed cleanly with `findBy...`.
-   Do not add arbitrary sleeps/timeouts to make flaky tests pass.
-   When using fake timers, set them up and restore real timers
    carefully; do not combine fake timers with `user-event` without
    configuring the interaction library accordingly.

## 10. Accessibility testing

Use `vitest-axe` for automated checks when it adds value:

``` tsx
const { container } = render(<Component />);
const results = await axe(container);
expect(results.violations).toHaveLength(0);
```

Guidelines: - Axe detects many common accessibility issues but cannot
prove that a component is fully accessible. - Check meaningful
accessible names, semantic HTML, labels, keyboard behavior, focus
management, and error descriptions. - Avoid using axe on an incomplete
state if required providers or content are missing. - If axe reports a
violation, inspect the rule and affected element. Fix the actual
accessibility issue rather than suppressing the rule by default. - If a
specific rule is intentionally inapplicable, document the reason
narrowly and explicitly; do not blanket-disable axe checks. - Some jsdom
features, such as Canvas APIs, may be incomplete. Distinguish
environment warnings from actual test failures.

## 11. Common problems and troubleshooting

### `No test files found`

Check: - Test filename matches Vitest's default patterns,
e.g. `button.test.tsx` or `button.spec.tsx`. - File is inside the
repository and not excluded. - Run `pnpm test:run` from the correct
project root.

Do not create fake tests merely to make the command return zero.

### `toBeInTheDocument` is not recognized

Check that `vitest.setup.ts` imports:

``` ts
import "@testing-library/jest-dom/vitest";
```

Also ensure `setupFiles` in `vitest.config.mts` points to the setup
file.

### `toHaveNoViolations` works at runtime but fails TypeScript

This happened during initial setup. Runtime matcher registration alone
did not provide a recognized TypeScript type. The reliable pattern
currently used is:

``` tsx
expect((await axe(container)).violations).toHaveLength(0);
```

Do not add inaccurate ambient declarations, `any`, or `@ts-ignore` just
to silence the type error.

### `HTMLCanvasElement.getContext()` is not implemented

jsdom may log this when axe or another dependency inspects
Canvas-related functionality. The initial smoke test passed despite the
message. Investigate only if it causes a real failing assertion or the
tested component actually requires Canvas. Do not automatically install
`canvas`.

### `vite-tsconfig-paths` warning

Vitest/Vite has warned that Vite supports tsconfig path resolution
natively. This is a warning, not proof of a test failure. If cleaning it
up: - Check the installed Vitest and Vite versions. - Confirm that the
`resolve.tsconfigPaths` option is supported by the installed versions. -
Make the smallest config change. - Run tests, typecheck, lint,
formatting, and build. - Remove the plugin dependency only after
verifying the replacement works.

### TypeScript fails only in test files

-   Ensure `types: ["vitest/globals"]` is inside the existing
    `compilerOptions`.
-   Ensure the test file is included by `tsconfig.json`.
-   Ensure imports match the installed package versions.
-   Prefer a type-safe assertion that TypeScript understands over
    disabling checks.

### Test passes but production build fails

The test environment and Next.js production build have different
responsibilities. Run `pnpm build` separately. Check whether the issue
is related to test-only imports leaking into application code,
incompatible module configuration, or an actual application type/build
error.

## 12. Definition of done for a testing change

A test-related change is complete only when all relevant items are true:

-   [ ] Tests verify actual behavior and reflect the real
    implementation/API contract.
-   [ ] No fake endpoints, enums, or domain assumptions were introduced.
-   [ ] No `shared/` directory or `@shared/*` alias was added.
-   [ ] New tests are deterministic and do not depend on live services.
-   [ ] Accessibility checks are included where appropriate.
-   [ ] `pnpm test:run` passes.
-   [ ] `pnpm typecheck` passes.
-   [ ] `pnpm lint` passes.
-   [ ] `pnpm format:check` passes.
-   [ ] `pnpm build` passes when relevant to the change.
-   [ ] The final report states what was tested and any remaining
    coverage gaps.

## 13. Current coverage status

At the time this guide was written:

-   The Vitest environment is configured.
-   The Button smoke test passes.
-   The test verifies the accessible button name and zero axe
    violations.
-   Typecheck, lint, formatting check, and production build passed after
    the test was added.
-   There is not yet a broad unit/component test suite for issue logic,
    filters, forms, or other interactive components.

Future agents should expand coverage alongside actual features,
prioritizing meaningful behavior and regression risk rather than a
target percentage alone.
