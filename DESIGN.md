---
name: Skula
description: A calm, trustworthy school-management SaaS — records and money, made legible.
colors:
  primary: "#4f46e5"
  primary-hover: "#4338ca"
  primary-soft: "#6366f1"
  ink: "#0f172a"
  body-text: "#111827"
  muted-text: "#64748b"
  surface: "#ffffff"
  app-bg: "#f9fafb"
  border: "#e2e8f0"
  border-subtle: "#f1f5f9"
  success: "#16a34a"
  success-bg: "#dcfce7"
  warning: "#d97706"
  warning-bg: "#fef3c7"
  danger: "#dc2626"
  danger-bg: "#fef2f2"
  info: "#2563eb"
  info-bg: "#dbeafe"
typography:
  display:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  body-tabular:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
    fontFeatureSettings: "\"tnum\""
  label:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  base: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  section: "96px"
motion:
  duration-fast: "150ms"
  duration-base: "200ms"
  duration-slow: "300ms"
  ease-out: "cubic-bezier(0.16, 1, 0.3, 1)"
  hover-lift: "translateY(-2px)"
  press: "scale(0.98)"
  stagger: "80ms"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "#334155"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "#334155"
    rounded: "{rounded.md}"
  button-destructive:
    backgroundColor: "{colors.danger-bg}"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.body-text}"
    rounded: "{rounded.lg}"
    padding: "20px 24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "44px"
  chip-status:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    rounded: "999px"
    padding: "2px 8px"
---

# Design System: Skula

## 1. Overview

**Creative North Star: "The Quiet Ledger"**

Skula is the instrument a school trusts with its records and its money, so it behaves like a good ledger: precise, calm, and quiet. The interface never raises its voice. Chrome recedes; the data — rosters, mark sheets, fee balances, attendance grids — is the loudest thing on screen, and even it stays orderly. Surfaces are white, the canvas is a soft warm-cool gray, and a single indigo accent does the pointing. The more information a screen carries, the quieter everything around it becomes.

This system explicitly rejects the worlds it's replacing. It is not the **dense, gray, dated PHP admin** (cramped tables, tiny controls, everything on screen at once) that Skula exists to supersede — we keep that depth of feature and throw out that experience. It is not a **generic Bootstrap admin template** with no point of view, not an **over-designed dashboard** with decorative gradients and attention-seeking motion, and never **childish school clip-art**. Skula reads as a serious, modern institution.

The feel is refined and restrained: generous rounding, hairline borders, flat surfaces at rest, and one confident accent reserved for the primary action. Legibility beats decoration every time; consistency across every module is what earns trust.

**Key Characteristics:**
- Calm, low-contrast chrome around high-contrast data
- One indigo accent, used sparingly, for the primary action and active state
- Flat surfaces separated by hairline borders, not shadows
- Generous corner rounding (12–16px) for a soft, modern, non-corporate feel
- Status is always color **plus** a label/icon, never color alone
- Dense-but-orderly: tables, filters, tabs, and chips behave identically everywhere

## 2. Colors

A near-monochrome slate/gray foundation under white surfaces, with one indigo accent and a small, disciplined set of semantic status colors. The canonical theme tokens are authored in OKLCH (e.g. primary `oklch(0.511 0.262 276.966)`); the hex values below are the sRGB equivalents the components actually render.

### Primary
- **Indigo Signal** (#4f46e5): The single brand accent. Primary buttons, active nav/tab state, links, focus rings, selected rows. Hover deepens to **Indigo Deep** (#4338ca), active to indigo-800. A lighter **Indigo Glow** (#6366f1) appears in focus ring tints (`indigo-500/15`) and the primary button's soft shadow.

### Neutral
- **Ink** (#0f172a, slate-900): Strongest text — headings, key figures, table values.
- **Body Text** (#111827, gray-900): Default running text.
- **Muted Text** (#64748b, slate-500): Secondary text, labels, metadata, placeholder copy.
- **Surface** (#ffffff): Cards, inputs, modals, the working canvas of every panel.
- **App Background** (#f9fafb, gray-50): The page behind the surfaces; the gentle separation that lets white cards float without shadows.
- **Border** (#e2e8f0, slate-200): The hairline that defines every card, input, and divider. **Border Subtle** (#f1f5f9, slate-100) for internal dividers (card header/footer rules).

### Status (semantic — small and fixed)
- **Success** (#16a34a, green-600) on **Success BG** (#dcfce7, green-100): Paid, Present, Complete, positive confirmations.
- **Warning** (#d97706, amber-600) on **Warning BG** (#fef3c7, amber-100): Partial, due-soon, needs-attention.
- **Danger** (#dc2626, red-600) on **Danger BG** (#fef2f2, red-50): Overdue, Absent, errors, destructive actions.
- **Info** (#2563eb, blue-600) on **Info BG** (#dbeafe, blue-100): Subject tags and neutral informational chips.

### Named Rules
**The One Accent Rule.** Indigo is the only brand color, and it appears on ≤10% of any screen — the primary action, the active state, a link. If two indigo things compete for attention on one view, one of them is wrong. Its scarcity is what makes it mean "this is the thing."

**The Status-Never-Alone Rule.** A status color is always paired with a word or icon (PAID, Present, ✓ Complete). Color is reinforcement, never the sole signal — required for color-blind users and low-quality screens.

## 3. Typography

**Display Font:** Montserrat (with ui-sans-serif, system-ui fallback)
**Body Font:** Plus Jakarta Sans (with ui-sans-serif, system-ui fallback)
**Label/Mono Font:** Geist Mono (for IDs, codes, and tabular figures where distinct)

**Character:** Montserrat gives headings a geometric, confident, institutional weight; Plus Jakarta Sans keeps running UI text humanist, friendly, and highly legible at small sizes. The pairing reads as modern and trustworthy without being cold.

### Hierarchy
- **Display** (Montserrat, 700, clamp 1.75–2.5rem, line-height 1.1): Marketing/landing headlines and major page titles. Tight letter-spacing (-0.02em).
- **Title** (Plus Jakarta Sans, 600, ~1rem, line-height 1.3): Card titles, section headers, modal headings. The workhorse heading inside the app.
- **Body** (Plus Jakarta Sans, 400, 0.875rem / 14px, line-height 1.5): Default UI text, table cells, form values. The app runs at 13–14px, not 16px — density with comfort.
- **Label** (Plus Jakarta Sans, 500, 0.75rem / 12px, muted-text): Field labels, metadata, table column heads, chip text. Often `text-xs` in gray-500.
- **Tabular** (Plus Jakarta Sans, 400, 0.875rem, `font-feature-settings: "tnum"`): Money and numeric cells — fees, balances, marks, counts, percentages. Same size and weight as Body, but with tabular figures so digits align in columns and totals stay scannable. Prefer this for in-table figures over switching fonts.
- **Mono** (Geist Mono, 0.8125rem): Admission numbers, codes, and identifiers where a distinct glyph set aids recognition. Use for IDs/codes; reach for **Tabular** for money and counts.

### Named Rules
**The Two-Voice Rule.** Montserrat speaks only for display/marketing and the biggest titles; everything functional is Plus Jakarta Sans. Don't let the display font leak into buttons, inputs, or table text.

**The Tabular-Figures Rule.** Every cell that renders money, a balance, a mark, or a count uses tabular figures (`font-feature-settings: "tnum"`). Proportional digits make columns ragged and totals hard to compare; tabular digits are the quiet signature of a system you trust with numbers. Never render a money cell without it. *(Adapted from Stripe's financial-data treatment.)*

**The Eyebrow Exception.** Titles and body run tight or neutral tracking, but small uppercase eyebrows/section kickers take *positive* tracking (~0.14em) — the one place letter-spacing opens up, to mark taxonomy rather than emphasis. *(Adapted from Linear.)*

## 4. Elevation

Skula is **flat by default**. Depth comes from hairline borders and the gray-50 canvas behind white surfaces, not from shadows. Cards sit on the page as bordered planes (`border-slate-200/80`), not lifted objects. This is deliberate: shadows everywhere read as busy, and busy erodes the calm a records system needs.

The single exception is functional, not decorative: the **primary button** carries a faint indigo-tinted shadow so the one action that matters has a whisper of lift. Modals/popovers may use a soft shadow to separate from the page, since they're genuinely above it.

### Shadow Vocabulary
- **Accent Lift** (`box-shadow: 0 1px 6px rgba(99,102,241,0.35)`): Primary button only. A subtle indigo glow tying the lift to the brand.
- **Overlay** (`box-shadow: 0 10px 40px rgba(0,0,0,0.12)`): Modals, dropdowns, popovers — surfaces truly floating above the page.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest, defined by a 1px slate-200 border. A shadow is earned only by (a) the single primary action or (b) a true overlay. If a resting card has a drop shadow, remove it.

## 5. Components

### Buttons
- **Shape:** Generously rounded (`rounded-xl`, 12px; small sizes step down to `rounded-lg`, 8px; xl up to `rounded-2xl`, 16px). Font is semibold. Subtle press feedback (`active:translate-y-px`).
- **Primary:** Solid Indigo Signal (#4f46e5), white text; hover Indigo Deep (#4338ca), active indigo-800; carries the Accent Lift shadow. Default height 36px, compact padding (`px-3.5`, text 13px).
- **Outline:** White surface, slate-200 border, slate-700 text; hover lifts to slate-50 fill + slate-300 border. The standard secondary action.
- **Ghost:** Transparent; hover gains a slate-100 wash. For low-emphasis and icon actions inside dense rows.
- **Destructive:** Restrained — soft red-50 fill, red-600 text, red-200 border (NOT a solid red block). Deleting is available but never shouts.
- **Focus:** 3px indigo ring at low opacity (`ring-3 ring-ring/50`), visible and on-brand.

### Chips / Status Pills
- **Style:** Fully rounded (`rounded-full`), tiny (`text-xs`, `px-2 py-0.5`), soft tinted background + saturated text from the same hue (e.g. `bg-green-100 text-green-700`).
- **Use:** Status (PAID/PARTIAL/UNPAID, Present/Absent, Complete/Incomplete) and category tags (subjects in blue). Always carries a word, never a bare colored dot.

### Cards / Containers
- **Corner Style:** `rounded-2xl` (16px) — the soft, modern signature.
- **Background:** White surface on the gray-50 canvas.
- **Border:** 1px slate-200/80 hairline. Header and footer separated by slate-100 internal rules.
- **Shadow Strategy:** None at rest (see Elevation). Footer optionally tinted `slate-50/60`.
- **Internal Padding:** 24px horizontal, 20px vertical (`px-6 py-5`).

### Inputs / Fields
- **Style:** White, 1px slate-200 border, `rounded-xl` (12px), 44px tall, 14px text.
- **Focus:** Border shifts to indigo-400 with a 3px low-opacity indigo ring (`ring-indigo-500/15`) — calm, not a hard glow.
- **Hover:** Border darkens to slate-300.
- **Error / Disabled:** `aria-invalid` → red-400 border + red ring; disabled → slate-50 fill, reduced opacity, no pointer.
- **Labels:** Always present, above the field, 12px medium in muted-text. Native `select` elements are styled to match input height/radius for consistency.

### Navigation
- **Style:** Persistent left sidebar grouped by module, white surface, indigo accent on the active item; top bar carries page title + role badge. Item text is body-weight; active state uses Indigo Signal text/indicator, not a heavy fill.
- **Mobile:** Sidebar collapses; layouts reflow to single column (most staff and nearly all parents are on phones).

### Tables (signature surface)
The densest, highest-stakes component. Hairline `slate-100` row dividers, muted 12px column headers, ink-weight values, generous row height for tap targets. Status cells use chips, not raw color. Money, mark, and count columns render in **Tabular** type (`tnum`) so digits align and totals scan (the Tabular-Figures Rule). Tables stay flat and bordered — never striped with heavy fills or boxed in shadows.

### Interaction & Motion
Motion is functional, quick, and calm — it confirms an action or guides the eye, never decorates. Default transitions run **150–300ms** on an ease-out curve (`cubic-bezier(0.16, 1, 0.3, 1)` for entrances). Interactive surfaces may lift a hair on hover (`translateY(-2px)`) and press in on click (`active:scale-[0.98]` or `active:translate-y-px`); links nudge their trailing arrow rather than bounce. Entrances fade-and-rise a few pixels, staggered ~80ms — nothing slides far or springs. Always honor **`prefers-reduced-motion`**: drop transforms and keep state changes instant. Marketing surfaces may animate a touch more expressively than the app, but stay within this vocabulary. *(Discipline adapted from Linear.)*

## 6. Do's and Don'ts

### Do:
- **Do** reserve Indigo Signal (#4f46e5) for the primary action, active state, and links — the One Accent Rule (≤10% of any screen).
- **Do** define surfaces with a 1px slate-200 border on the gray-50 canvas; keep them flat (the Flat-By-Default Rule).
- **Do** pair every status color with a word or icon (PAID, Present, ✓) — the Status-Never-Alone Rule.
- **Do** use generous rounding (cards 16px, buttons/inputs 12px) for the soft, modern, non-corporate feel.
- **Do** keep Montserrat for display/titles and Plus Jakarta Sans for everything functional (the Two-Voice Rule).
- **Do** run app text at 13–14px with comfortable line-height; density is fine, cramped is not.
- **Do** render every money/mark/count cell with tabular figures (`tnum`) so columns align and totals scan — the Tabular-Figures Rule.
- **Do** keep motion functional and quick (150–300ms, ease-out) and honor `prefers-reduced-motion`.
- **Do** give destructive actions a confirm step and a soft (not solid-red) treatment.

### Don't:
- **Don't** recreate the **dense, gray, dated PHP admin** look — cramped tables, tiny controls, everything on screen at once. Feature parity, never UI parity.
- **Don't** ship a **generic Bootstrap admin template** appearance with no point of view.
- **Don't** over-design: no decorative gradients, no attention-seeking or scroll-jacking motion, no heavy drop shadows on resting cards.
- **Don't** use **childish, cartoonish, primary-color school clip-art** — Skula is an institution, not a classroom poster.
- **Don't** let indigo appear on more than ~10% of a screen, and never use two competing accents.
- **Don't** convey status with color alone (no bare colored dots or text-color-only states).
- **Don't** put semantic status colors (success green, danger red) on solid button fills — keep them as text + soft-tinted chips; a solid green/red block reads as a trading terminal, not a ledger.
- **Don't** render money or numeric columns with proportional figures (missing `tnum`) — ragged digits break the financial-data signature.
- **Don't** let Montserrat leak into buttons, inputs, or table cells.
- **Don't** add a drop shadow to a resting card; shadows are earned by the primary button or a true overlay only.

### Quick audit tests
One-sentence checks — if any is true, the screen is off-brand:
- **The 2016-admin test:** if a resting card has a drop shadow, it looks like a dated admin theme — flatten it to a 1px slate-200 border.
- **The squint test:** squint at the screen; if more than one indigo element competes for your eye, the One Accent Rule is broken.
- **The grayscale test:** view the screen in grayscale; if any status (paid/absent/overdue) becomes unreadable, it relies on color alone — add the label/icon.
- **The thumb test:** on a 375px viewport, if the primary action sits at the top out of thumb reach or any tap target is under 44px, it fails the mobile-first staff/parent audience.
- **The density test:** if a data table has heavy zebra striping, boxed shadows, or 16px+ body text, it's drifting toward either clutter or wasted space — hairline rows, 13–14px, flat.
- **The tabular test:** stack two money values in a column; if the digits don't line up vertically, the cell is missing `tnum` (the Tabular-Figures Rule).
