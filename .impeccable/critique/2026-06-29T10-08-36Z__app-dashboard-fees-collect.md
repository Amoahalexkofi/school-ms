---
target: fees/collect screen
total_score: 23
p0_count: 1
p1_count: 3
timestamp: 2026-06-29T10-08-36Z
slug: app-dashboard-fees-collect
---
# Critique — Fee Collection Screen (`fees/collect/[studentId]`)

Method: A = isolated sub-agent (design review); B = detector run in parent (`detect.mjs`, sub-agent lacked Bash permission). Browser overlay skipped — no browser-automation tool exposed.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good success banner + progress + "Processing…"; no inline loading on row Collect, heavy full router.refresh() |
| 2 | Match System / Real World | 3 | Cedi + "Record Payment" right; payment modes shown as shouty raw enums ("MOBILE MONEY" not "MoMo") |
| 3 | User Control and Freedom | 3 | Delete-and-recreate is forgiving; no Edit, no undo toast |
| 4 | Consistency and Standards | 1 | Worst: hand-rolled header vs Card, raw select vs 44px Input, blue vs indigo, font-black titles |
| 5 | Error Prevention | 2 | Only blocks amount<=0; no over-payment guard, future date allowed, no confirm on money action |
| 6 | Recognition Rather Than Recall | 3 | Balance prefilled (great); student NAME absent in dialog |
| 7 | Flexibility and Efficiency | 2 | No "pay full group"; no keyboard submit (no <form>); 5 modes always shown |
| 8 | Aesthetic and Minimalist | 3 | Calm overall; 6-col text-xs table drifts to PHP-admin density on mobile |
| 9 | Error Recovery | 2 | Raw API messages; delete/online failures use bare alert() |
| 10 | Help and Documentation | 1 | None — no tooltips on Fine, carry-forward master, discounts |
| **Total** | | **23/40** | **Acceptable (low end) — the money screen should be top-of-band** |

## Anti-Patterns Verdict

- **LLM review:** Borderline. Not flashy AI slop (no gradients/glass/hero), but an unmistakable "AI wired a generic admin form and never reconciled it with DESIGN.md" signal: blue acting as a second brand accent, resting drop shadows, font-black titles, raw selects.
- **Deterministic scan:** CLEAN — `detect.mjs` returned 0 findings (exit 0) on the file and directory. Note: the static scan did NOT catch the design-system drift the review found; clean detector ≠ on-brand.
- **Visual overlay:** skipped (no browser-automation tool).

## What's Working

1. **Balance prefilled into the amount field** — recognition over recall, matches the dominant "pay full balance" case, cuts miskeys.
2. **Peak-end nailed:** success banner + one-click Print Receipt (new tab) closes the cash transaction with proof and confidence.
3. **Forgiving-by-default delete-and-recollect** with an honest confirm message — directly honors Product Principle 5 (execution is weak, intent is right).

## Priority Issues

**[P0] No over-payment / wrong-amount / wrong-student safeguard at the money moment**
- Why: real cash, non-technical collector, a queue. `handlePay` only blocks amount<=0; you can record ₵5,000 against a ₵200 balance, a future date, against the wrong child — and the dialog hides the student name. Corrupts the ledger; breaks "staff trust it with money."
- Fix: show student name + admission no + the fee being paid in the dialog; warn when amount > balance; cap date at today; add a one-line confirm summary ("Record ₵200 CASH for Akua Mensah?") before POST.
- Command: /impeccable harden

**[P1] Screen abandons the design system (color, primitives, flatness, type)**
- Why: blue is a second accent (avatar, progress, links); resting shadows (header shadow-sm + Card inline shadow); font-black titles; raw 36px select vs 44px Input; non-token grays. Breaks One Accent, Flat-By-Default, Two-Voice — the exact differentiators this screen must prove.
- Fix: blue→indigo (or neutral slate avatar); remove resting shadows; use Card for header; build a Select primitive matching Input; drop font-black.
- Command: /impeccable colorize (then /impeccable polish)

**[P1] Primary action is the weakest element; no keyboard submit**
- Why: "Collect" is a tiny sm outline button in a table cell; dialog has no <form> so Enter doesn't submit; "Pay Online" competes at card header. Slows long payment runs; fails thumb test.
- Fix: make Collect a clear filled primary (or prominent per-card CTA); wrap dialog in <form onSubmit>; demote Pay Online to secondary.
- Command: /impeccable layout

**[P1] Native confirm()/alert() for money operations**
- Why: off-brand, unstyled, inconsistent for screen readers, jarring exactly when fixing a money mistake in front of a parent. Violates "calm, never anxious."
- Fix: Dialog primitive for confirms; inline toast/banner (reuse green success pattern) for errors and the post-delete "reversed — record again", ideally with Undo.
- Command: /impeccable harden

**[P2] Mobile density + dialog cognitive overload**
- Why: 6-col text-xs table on 375px is PHP-admin territory; dialog shows 7 controls (Amount/Fine/Date/Mode/Discounts/Description/actions) when the common path is "₵200, cash, done" (>4 decision budget).
- Fix: stack the table to rows on mobile; progressively disclose Fine/Discount/Description behind "More options" so default path is Amount + Mode + Record.
- Command: /impeccable distill (then /impeccable adapt for responsive)

## Persona Red Flags

**Sam (accessibility):** no <form> (Enter won't submit); labels lack htmlFor + inputs lack id; icon-only delete has only title (no aria-label) at text-gray-300 (~1.5:1 contrast — fails AA); text-gray-400 body text (~2.8:1 — fails AA); progress bar conveys state by color alone. (Status chips DO pair color+label — good.)

**Casey (one-handed mobile, 3G):** heavy router.refresh() after each payment with no skeleton; 6-col table unreadable at 375px; Collect target h-7 (<44px); online-pay hard redirect with no "sending you to pay…" state; no draft if connection drops mid-dialog.

**Akua (busy non-technical fee collector, cash + queue):** student name vanishes in dialog (risk of right amount/wrong child); no over-payment/change helper; enum jargon ("MOBILE MONEY"); carry-forward "system master" unexplained; Fine sits next to Amount (easy mis-entry); per-fee-type only (no "pay all").

## Minor Observations

- `student.firstName[0]` will crash on empty/undefined first name (no guard, unlike lastName).
- Totals show no decimals (₵1,200) while the input forces 2 — minor inconsistency.
- `lastSubInvoice ?? 1` hardcodes sub-invoice 1 — could link a wrong receipt segment.
- Empty-state "Assign fees →" link is blue + underlined (another stray accent).
- DialogContent max-w-sm is narrow for the two-column grid on small-but-not-mobile screens.

## Questions to Consider

1. If 90% of collections are "full balance, cash, today," why is the default a 7-field form instead of one-tap "Collect ₵200 cash" with an "edit details" escape hatch?
2. Delete-but-not-edit: is delete-and-recreate genuinely safer for the audit trail, or does it just look forgiving while creating reversal noise?
3. This is the highest-stakes daily action — why does it have the lowest design-system fidelity? Was it built before DESIGN.md, and what else inherited the same drift?
