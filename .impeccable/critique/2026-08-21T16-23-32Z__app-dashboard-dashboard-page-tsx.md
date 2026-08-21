---
target: app/(dashboard)/dashboard/page.tsx
total_score: 27
p0_count: 0
p1_count: 3
timestamp: 2026-08-21T16-23-32Z
slug: app-dashboard-dashboard-page-tsx
---
Method: dual-agent (A: general-purpose · B: general-purpose)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No loading/skeleton state during the server-side stats fetch; Topbar's own fetches silently swallow errors |
| 2 | Match System / Real World | 4 | n/a — solid (GES-style term language, en-GB dates, personal greeting) |
| 3 | User Control and Freedom | 3 | Good retry/settings links on error states, docked for the mySections coupling bug (see P2) |
| 4 | Consistency and Standards | 2 | Cards use rounded-xl/p-5 everywhere vs. DESIGN.md's documented rounded-2xl/px-6 py-5; ~15 arbitrary font sizes |
| 5 | Error Prevention | 3 | Read-only page, low stakes; docked for the stats/mySections coupling undermining its own "network blip" comment |
| 6 | Recognition Rather Than Recall | 4 | n/a — solid (labels always visible, icons reinforce categories) |
| 7 | Flexibility and Efficiency | 2 | Cmd+K search is desktop-only with no mobile equivalent; Quick Actions is static/non-personalizable |
| 8 | Aesthetic and Minimalist Design | 3 | Clean at the card level; docked for TONE-color sprawl and unbroken page length (9-11 stacked modules) |
| 9 | Error Recovery | 3 | Genuinely calm, well-written copy; docked because error and empty states look visually identical |
| 10 | Help and Documentation | 1 | No help/support entry point anywhere on the page or in Topbar |
| **Total** | | **27/40** | **Acceptable — significant improvements needed before users are happy** |

## Anti-Patterns Verdict

**LLM assessment (Partial AI slop):** Not a generic template clone — the page is clearly built against Skula's own tokens (hairline borders, flat cards, tabular-nums, calm copy). But two things read as dashboard-template tells: (1) the `TONE` record assigns a distinct pastel icon-chip color per KPI card, including violet and sky, neither of which exists in DESIGN.md's palette — this is the exact multi-hued-icon-badge pattern the One Accent Rule exists to prevent, on the highest-visibility surface in the app; (2) the same `bg-white rounded-xl border border-slate-200 p-5` → title → indigo-link header pattern repeats near-verbatim across 8+ sections, reading as loop-generated rather than considered hierarchy.

**Deterministic scan:** Exit 0, zero findings. Notably, the detector did **not** catch the token drift (rounded-xl vs. documented rounded-2xl, the undocumented TONE/ROLE_COLOR palette, or the font-size sprawl) that the manual design review flagged — worth knowing as a detector blind spot on this file, not proof the page is fully spec-compliant.

**Visual overlays:** Unavailable — no browser automation tool exposed in this environment. Reported honestly rather than faked; no user-visible overlay exists for this run.

## Overall Impression

This is a page with real craft underneath it — role-shaped content, tabular-figures discipline, genuinely reassuring error copy — that's being undercut by two things: a decorative color palette that drifted outside the design system (TONE + Topbar's ROLE_COLOR), and a card/type-token drift from what DESIGN.md actually documents. Neither is a structural rebuild; both are find-and-replace-scale fixes with outsized visual payoff, since they touch every card on the page's busiest screen.

## What's Working

1. **The error/empty-state copy** ("Couldn't load the dashboard... your data is safe") is exactly the reassurance a records-and-money product needs at its most failure-prone moment — matches the brand's "never creates anxiety" principle precisely.
2. **Tabular-figures discipline** — every money/count/percent value across KPI cards, the branch table, and the payments list consistently uses tabular-nums, honoring DESIGN.md's own Tabular-Figures Rule without exception.
3. **Role-shaped content, not a single template** — KPIs reorder by role, teachers get their own class list, admins get an actionable unmarked-sections nudge. Real information-architecture work matching the differentiated user list in PRODUCT.md.

## Priority Issues

**[P1] Undocumented decorative accent colors** — `TONE` (KPI icon chips) and Topbar's `ROLE_COLOR` (role badges) introduce violet, sky, and other hues with no basis in DESIGN.md's palette.
- **Why it matters:** This is the specific "generic colorful admin dashboard" pattern the brand explicitly rejects, repeated on every KPI card and every role badge — the highest-visibility color decisions in the app.
- **Fix:** Collapse non-semantic KPI chips to one neutral slate treatment; reserve color for genuinely semantic states (success/warning/danger/info) only.
- **Suggested command:** `/impeccable quieter`

**[P1] Card token drift from DESIGN.md** — Every card on the page uses `rounded-xl`/`p-5` instead of the documented `rounded-2xl`/`px-6 py-5`.
- **Why it matters:** "Consistency builds trust" is PRODUCT.md's #3 design principle. If the app's highest-traffic page disagrees with its own spec, either the spec is stale everywhere or this page is the outlier — either way it needs reconciling.
- **Fix:** Audit whether the rest of the app matches this page or DESIGN.md, then align one to the other deliberately (not silently).
- **Suggested command:** `/impeccable layout`

**[P1] Numeric type-scale sprawl** — ~15 arbitrary pixel font sizes in play, including three different sizes for the same conceptual "big stat" role on one screen (30px, 44px, 40px).
- **Why it matters:** Tired, non-technical staff scanning quickly rely on consistent typographic rhythm to know "this is where the number lives" — three scales for the same role works against that.
- **Fix:** Define 2-3 fixed numeric-headline tokens and standardize every card to one of them.
- **Suggested command:** `/impeccable typeset`

**[P2] Quick Actions violates the app's own thumb test** — up to 6 items at ~36px row height, against DESIGN.md's own documented 44px minimum tap target and the ≤4-per-decision-point cognitive-load guideline.
- **Why it matters:** This block exists to speed up exactly the users who need it most (daily-routine admins, one-thumb mobile staff) and currently under-serves both.
- **Fix:** Raise row height to ≥44px and cap the list to the 4 most role-relevant actions.
- **Suggested command:** `/impeccable adapt`

**[P2] A stats-fetch failure hides unrelated, already-successful data** — a teacher's own `mySections` list is fetched independently but only renders inside the `stats &&` branch, so a stats-fetch failure removes data that loaded fine.
- **Why it matters:** Directly contradicts the page's own error-copy promise not to punish someone for a network blip.
- **Fix:** Decouple `mySections` rendering from the `stats` gate.
- **Suggested command:** `/impeccable harden`

## Persona Red Flags

**Alex (impatient admin, checking daily stats):** No refresh/"last updated" signal, so he can't tell if numbers are live or stale after a slow load. Quick Actions offers 6 generic options with no way to pin the 2-3 he actually uses daily. KPI depth is inconsistent — Collected/Expenses get sparklines and deltas, Teachers gets neither — so he learns to distrust which tiles are worth a second glance. No in-page anchor/nav, so reaching what he cares about means scrolling past everything he doesn't, every time.

**Casey (distracted, low-end mobile phone):** Zero search/command-palette access on mobile — Topbar's search is desktop-only and the mobile topbar has no search affordance at all. The attendance trend chart puts the actual date behind a `title` tooltip, which doesn't fire on touch — on a phone she sees bare percentages over unlabeled bars with no way to get the date. Quick Actions rows are ~36px against the 44px thumb-test minimum the design system itself sets.

## Minor Observations

- The "Main" branch badge uses amber (a semantic Warning color) for a neutral taxonomy label — reads as "something's wrong with Main" at a glance; should be neutral slate.
- `border-dashed` on empty-state cards vs. solid borders on populated ones is a nice, correctly quiet convention worth keeping.
- Avatar-initials fallback in Topbar is a solid, low-cost recognition aid.
- SVG chart tick-label text sits entirely outside the app's type scale since it's raw SVG — worth spot-checking legibility at 320-375px viewports.
- The neutral (non-green/red) color choice for month-over-month expense deltas is a thoughtful, easy-to-miss detail worth preserving in any refactor.

## Questions to Consider

1. If the KPI chip colors and the 8-hue role badges were both stripped to the documented palette, would the page still feel "modern," or is decorative categorical color currently doing work that a flatter, more disciplined layout should be doing instead?
2. This page does a blocking server fetch across ~11 modules with zero streaming/skeleton, for an audience PRODUCT.md explicitly flags as being on unreliable connectivity — has this been profiled on a throttled connection, or is "no loading state" an unmeasured simplicity bet?
3. Role-based content branching is hard-coded directly in a 751-line page component. Does this scale to the next 5 modules, or does role-to-content mapping need to become data-driven before it's touched again?
