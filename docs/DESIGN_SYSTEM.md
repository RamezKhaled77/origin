# DESIGN SYSTEM — "Engineering Ledger"

> **Source of truth for values:** `app/globals.css`. This file explains how to **use** them. If a value here disagrees with `globals.css`, the CSS wins, and this file should be fixed.
> **Mockups are a visual reference.** The written decisions (`DESIGN_EXCLUSIONS.md`, `DECISIONS.md`) win over what a mockup shows.

---

## 1. Character

Calm, editorial, dense, tabular. It should feel like a precise ledger, not a dashboard full of decoration.

- Serif for page and modal titles; monospace for metadata; sans for everything else.
- Off-white background, deep green as the single accent.
- Dense rows instead of large cards. Hairline borders instead of shadows.
- No confetti, no gamified badges, no decorative "system status" text.

---

## 2. Color tokens

Tokens are HSL triplets in `:root` and `.dark`, mapped to Tailwind classes through `@theme inline`. **Use the semantic class, never the value.** Because the tokens change under `.dark`, do **not** add `dark:` color overrides for token colors.

### Surfaces and text

| Token (Tailwind class) | Light | Dark | Use |
|---|---|---|---|
| `background` / `surface-canvas` | `#fbf8fc` | `#0d0e11` | Page background |
| `card` / `surface-lowest` | `#ffffff` | `#18191d`* | Panels, tables, dialogs |
| `surface-low` (`secondary`, `muted`) | `#f5f3f6` | `#121316` | Table headers, hover, subtle fills |
| `surface-container` (`accent`) | `#ebe7ed` | `#18191d` | Selected rows, chips on a panel |
| `surface-high` | `hsl(280 11% 89%)` | `#1e2025` | Highest raised fill |
| `text-primary` (`foreground`) | `#1c1b1f` | `#f4f1ea` | Main text |
| `text-secondary` | `#49454f` | `#9fa3ad` | Supporting text |
| `text-tertiary` | `hsl(260 5% 42%)` | `hsl(228 6% 55%)` | Metadata, placeholders (meets AA) |
| `text-disabled` | `#ab9ea6` | `hsl(228 6% 40%)` | Disabled only (exempt from contrast) |

\* In dark mode `card` and `surface-container` share the same value; `surface-lowest` is slightly darker (`#0d0e11`).

### Borders

| Token | Light | Dark | Use |
|---|---|---|---|
| `border-hairline` | `#ebe7ed` | `hsl(225 9% 14%)` | Row dividers inside tables |
| `border` / `input` | `#dcd9dd` | `#282b33` | Panels, inputs, dialogs |
| `border-strong` | `#79747e` | `hsl(225 8% 25%)` | Emphasis, focus-adjacent. Needs only 3:1 as a UI border |

### Brand and actions

| Token | Light | Dark |
|---|---|---|
| `primary` | `#087f73` | `#14b8a6` |
| `primary-hover` | `#06635a` | `#0d9488` |
| `primary-active` | `#044c45` | `hsl(174 90% 26%)` |
| `primary-muted` (tint bg) | `#e6f3f1` | 12% of primary |
| `primary-border` | `#99cfc9` | 35% of primary |
| `destructive` | `#ba1a1a` | `#f05a47` |
| `ring` (focus) | same as primary | same as primary |

### Status colors

Every status color has three tokens: **text** (`status-x`), **tint background** (`status-x-bg`), **border** (`status-x-border`). In dark mode the background is 12% and the border 35% of the text color.

| Issue status | Token family | Light text on tint |
|---|---|---|
| `backlog` | `status-planning` | slate `#64748b` on `#f1f5f9` |
| `todo` | `status-todo` | blue `hsl(212 80% 36%)` on `hsl(214 95% 93%)` |
| `in_progress` | `status-progress` | amber `#b45309` on `#fef3c7` |
| `in_review` | `status-active` | teal `#087f73` on `#e6f3f1` |
| `done` | `status-resolved` | green `#15803d` on `#dcfce7` |
| `cancelled` | none | `text-tertiary`, no tint, line-through |
| (urgent priority, overdue) | `status-urgent` | red `#ba1a1a` on `#ffdad6` |

### Label colors

Six fixed colors, each with `label-<name>`, `label-<name>-bg`, `label-<name>-border`:
`violet`, `magenta`, `indigo`, `olive`, `sand`, `plum`. The backend sends the **key**; the frontend maps it to the classes. Never accept or render a custom hex.

### Token gaps and checks (not done yet)

1. **High priority color.** Defined as `--priority-high` (orange): `hsl(17 88% 38%)` light, `hsl(20 91% 60%)` dark, in `priority-high-tokens.css`. **Merge it into `globals.css` during setup.** Medium uses `status-progress`; Low uses `text-tertiary`.
2. **Contrast checks to run with axe/DevTools:** `status-planning` text (about 4.3:1 in light, lower in dark), and the dark-mode tint pairs once rendered.

---

## 3. Typography

| Role | Font | Rules |
|---|---|---|
| Page title, modal title | Newsreader (`font-serif`) | Explicit class only. Modal titles are **italic** |
| Body and UI | Inter (`font-sans`) | Base **13px / 1.5** |
| Metadata | JetBrains Mono (`font-mono`) | Counts, timestamps, filter chips, small uppercase labels |
| Small uppercase labels | Mono | 10–11px, letter-spaced, `text-text-tertiary` or `text-text-secondary` |

Rules:
- Panel titles (`My Issues`, `Priority Overview`, `Context & Overview`) are **Sans**, not Serif.
- There is no global heading font rule. Heading level (`h1`–`h4`) is for structure, not appearance.
- Tile numbers appear in serif in the mockups. **Undecided:** revisit when the tiles are built. If still undecided then, follow the mockup.
- UI language is English, left-to-right.

---

## 4. Shape, density and elevation

| Property | Value |
|---|---|
| Radius | 4px (`--radius` = 0.25rem). `sm` = 2px, `lg` = 6px |
| Borders | 1px hairlines. Prefer a border over a shadow |
| Table rows | 36–40px tall |
| Sidebar width | 240px |
| Shadows | **Only** dialogs and popovers (soft shadow over a dimmed, blurred backdrop) |
| Motion | Minimal. No decorative animation. Respect `prefers-reduced-motion` |

---

## 5. Component specs

### Status badge
- Always shows the status **text** (mono, uppercase, 10–11px). Small, square-ish, 1px border, tint background, text from the token family above.
- `cancelled` has no tint: muted text with line-through.
- One component, `StatusBadge`, driven by the status enum from `shared/`.

### Priority indicator
- Always **icon + text**, never color alone.
- `urgent` red (`status-urgent`, filled mark), `high` orange (`priority-high`), `medium` amber (`status-progress`), `low` neutral (`text-tertiary`), `no_priority` a muted dash with the text "No priority".
- Sort order: urgent, high, medium, low, no priority.

### Label chip
- Name in mono, tint background and border from the label color, small radius. The name must always be visible (violet, plum and magenta are close).

### Due date
- One line, mono, e.g. `Feb 18`. If overdue: red text plus an "Overdue" marker. Never wrap onto multiple lines.

### Stat tile
- Small uppercase mono label, large number, one short caption. The Overdue tile uses the urgent tint. Tiles follow `DESIGN_EXCLUSIONS.md` (Open, In Progress, Done, Overdue).

### Issue table
- Header: uppercase mono, 10–11px, `surface-low` background.
- Row: hairline divider, hover `surface-low`, title in Sans as the first column (no key column).
- `done` and `cancelled` rows are muted, with the title struck through (as in the mockups).
- Columns: select (when bulk mode), title, status, priority, labels, assignee, due date. Project is shown with the title where the page needs it.
- Always has an empty state, a skeleton (loading) state and an error banner.

### Buttons
- **Primary:** `primary` background, white text. Used for the main action (New Issue, Create…).
- **Secondary:** `card` background with `border`.
- **Destructive:** red text or `destructive` background. Only for delete actions, always behind a confirm dialog.
- One primary button per region. Do not show **New Issue** more than twice on a screen.

### Inputs
- `card` background, `input` border, `ring` on focus. Error state: `destructive` border plus message under the field, linked with `aria-describedby`, and `aria-invalid`.

### Dialog
- shadcn Dialog (Radix): focus trap, `Esc` closes, backdrop dimmed and blurred. Title in serif italic. Footer: secondary on the left or "Cancel", primary on the right.

### Sidebar and topbar
- Sidebar: 240px; section labels uppercase mono; active item uses `primary-muted` background with `primary` text; counts right-aligned in mono.
- Topbar: breadcrumb, Quick Search field with `⌘K`, optional New Issue button, user avatar (initials).
- Variants follow `ARCHITECTURE.md` section 6.

### Icons
- `lucide-react` (the shadcn default), outline style, consistent stroke.

---

## 6. Accessibility rules

- Text contrast at least **4.5:1** (3:1 for UI borders and large text). Disabled text is exempt.
- Status and priority never rely on color alone.
- Every interactive element has a visible focus ring.
- One `<main>` per page, plus a "skip to content" link in the shell.
- Dialogs trap focus and return it to the trigger on close.
- Every page and shared component is checked with axe-core in tests.

---

## 7. Dark mode

Tokens switch automatically through the `.dark` class (`@custom-variant dark (&:is(.dark *))`). Components must work in both modes without per-component overrides. The toggle UI is not designed yet (see `DECISIONS.md`, pending decision 2).
