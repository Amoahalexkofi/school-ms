---
target: app/(dashboard)/dashboard/page.tsx
total_score: 34
p0_count: 0
p1_count: 2
timestamp: 2026-08-21T16-55-40Z
slug: app-dashboard-dashboard-page-tsx
---
Method: dual-agent (A: general-purpose · B: general-purpose)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeleton exists but its card shape now drifted from the fixed live cards (see P2) |
| 2 | Match System / Real World | 3 | Plain, Ghana-appropriate voice; docked for a false-affordance issue (see P1) |
| 3 | User Control and Freedom | 4 | n/a — solid, Retry link on error state, no traps |
| 4 | Consistency and Standards | 2 | Card shape is now genuinely consistent app-wide (verified across all 11 instances); docked for skeleton drift + mixed arrow glyphs + false-affordance hover |
| 5 | Error Prevention | 4 | n/a — read-heavy surface, no destructive actions |
| 6 | Recognition Rather Than Recall | 4 | n/a — solid, labels above every value |
| 7 | Flexibility and Efficiency | 4 | Genuine role-based reshaping (moneyFirst, canSeeMoney, teacher-only block) |
| 8 | Aesthetic and Minimalist Design | 3 | Flat cards, one accent mostly respected; docked for charts borrowing the brand accent as data color |
| 9 | Error Recovery | 4 | n/a — calm, specific statsError copy with Retry |
| 10 | Help and Documentation | 3 | Attendance-trend date only reachable via a hover-only tooltip, invisible on touch |
| **Total** | | **34/40** | **Good — solid foundation, address remaining weak areas** |

## Anti-Patterns Verdict

**LLM assessment (No, with minor tells):** Reads as deliberately designed, not generated — consistent card vocabulary, restrained motion, calm copy. Remaining tells are craft inconsistencies, not slop signatures: two different "go further" conventions in one file (lucide arrow icon vs. a literal "→" character in copy), and a type scale that doesn't map cleanly onto DESIGN.md's own Display/Title/Body/Label tokens.

**Deterministic scan:** Exit 0, zero findings — clean, consistent with the first run.

**Visual overlays:** Unavailable — no browser automation tool in this environment.

## Overall Impression

The three P1s from the first pass are genuinely fixed, not just patched over — verified independently across all 11 card instances and both flagged font sizes. Score moved 27 → 34. What surfaced instead, now that the loudest issues are gone, is a second tier: a mobile-ordering problem that puts the page's one action-oriented block last on a phone, and a subtle false-affordance bug where non-clickable KPI cards visually invite a click they don't honor.

## What's Working

1. **Role-shaping logic** — KPI reordering, money-role gating, a teacher-only block, an admin-only chase list — real product tailoring per role, not a single template.
2. **Card-shape fix holds up under audit** — `rounded-2xl border-slate-200 px-6 py-5` verified consistently across all 11 card instances, matching DESIGN.md exactly.
3. **Tabular-Figures Rule with zero exceptions** — every money/percent/count value on the page carries tabular-nums.

## Priority Issues

**[P1] Mobile stacking order buries Quick Actions below ~8 read-only sections** — on a phone, DOM order = visual order, so reaching the one action-oriented block means scrolling past branch breakdown, KPIs, attendance, fees, two charts, and a full payments list first.
- **Why it matters:** PRODUCT.md is explicit that most staff and nearly all parents are on phones — the fastest path to "do the thing" is currently the slowest to reach on the device most people use.
- **Fix:** reorder Quick Actions ahead of the data-heavy sections on narrow viewports.
- **Suggested command:** `/impeccable adapt`

**[P1] False affordance on non-linked KPI cards** — the hover/lift treatment (border darkens, card lifts) is hardcoded regardless of whether a card has an `href`. "Present today" and "School days left" never link anywhere, yet visually invite a click.
- **Why it matters:** trains users to click things that do nothing — a small trust cost repeated on every visit.
- **Fix:** only apply hover/lift styling when `href` is actually passed.
- **Suggested command:** `/impeccable clarify`

**[P2] Loading skeleton drifted from the fixed card shape** — `loading.tsx` still uses the pre-fix `rounded-xl`/`p-5`, so on a slow connection the cards visibly reshape the instant real data replaces the skeleton.
- **Why it matters:** a jarring shape "pop" at exactly the moment system-status visibility should feel most stable.
- **Fix:** update `loading.tsx`'s card containers to match `rounded-2xl`/`px-6 py-5`.
- **Suggested command:** `/impeccable polish`

**[P2] Charts reuse the exact brand-accent indigo as plain data color** — sparklines, the area chart, and the attendance-trend bar all use `#4f46e5`, identical to links and the primary button.
- **Why it matters:** dilutes the One Accent Rule's "this is the thing to click" signal — an indigo trend bar sits directly beside an indigo "Mark" link on the same card.
- **Fix:** give dataviz a distinct, less-saturated tone; reserve full-strength indigo for interactive elements.
- **Suggested command:** `/impeccable colorize`

**[P3] Mixed arrow conventions** — most CTAs use the lucide arrow icon, but two use a literal "→" character in copy ("Collect a fee →", "Chase up →").
- **Why it matters:** minor, but a real consistency slip once everything else is this disciplined.
- **Suggested command:** `/impeccable polish`

## Persona Red Flags

**Alex (impatient power user):** Fast path via KPI links and Cmd+K helps, but reaching Staff/Library still means scrolling past every section with no reorder/collapse option. The loading→loaded shape-pop is exactly the kind of visible inconsistency this persona notices and distrusts.

**Casey (distracted mobile):** Hits the buried-Quick-Actions problem hardest — the fastest path to action is now the last thing reached on a phone. Also loses the attendance-trend date detail, exposed only via a desktop-only hover tooltip.

## Minor Observations

- Card titles render at 15px, body text at 13px/12px — internally consistent but a parallel scale from DESIGN.md's documented 16px Title / 14px Body tokens.
- The unified 44px "big stat" size actually exceeds DESIGN.md's own largest token (Display, clamped to 40px) — worth knowing the unification landed outside any documented role.
- Confirmed holding from the last pass: KPI icon chips are neutral slate everywhere, Quick Actions rows measure ~44px, and the teacher's "My classes" block renders unconditionally before the stats-error branch.

## Questions to Consider

1. Should Quick Actions be pinned near the top (or duplicated as a compact bar) specifically on mobile, given this is a task surface for an audience mostly on phones?
2. Now that charts borrow the exact interactive-primary indigo, does the system need a dedicated "chart" token distinct from "interactive primary"?
3. Should `KpiCard` require callers to explicitly choose static vs. linked, rather than defaulting to full hover affordance regardless of whether `href` exists?
