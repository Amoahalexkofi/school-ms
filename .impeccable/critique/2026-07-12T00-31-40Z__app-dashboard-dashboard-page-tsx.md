---
target: admin dashboard home
total_score: 24
p0_count: 0
p1_count: 3
timestamp: 2026-07-12T00-31-40Z
slug: app-dashboard-dashboard-page-tsx
---
# Design Critique — Admin Dashboard (app/(dashboard)/dashboard/page.tsx)
Method: dual-agent (A: design-review sub-agent · B: detect.mjs parent-run)

## Design Health Score: 24/40 (Acceptable)
1 Visibility 3 · 2 Real-world 3 · 3 Control 2 · 4 Consistency 3 · 5 Error prevention 2 · 6 Recognition 3 · 7 Flexibility 2 · 8 Minimalist 3 · 9 Recovery 2 · 10 Help 1

## Anti-Patterns Verdict
Not AI-slop. Dashboard page scanned clean by detector. Detector hits: 3× ai-color-palette (from-indigo-500 gradients, Sidebar.tsx:225,329 Topbar.tsx:156), 2× advisory rgba(0,0,0,0.08) (Topbar.tsx:111,170). Content-level tells: irreconcilable money figures, demo-seed gender errors.

## Priority Issues
- [P1] Contradictory money story: "Fees collected GHS0 / This month" (page.tsx:186-189) vs "Fee collection 76% / 16 paid" (261-283); Month receipts/expenses rows duplicate KPI row (273-276). FIX: label month vs session explicitly; drop dup rows; add "Last payment" freshness; GH₵ formatter with space.
- [P1] Errors masquerade as empty states: .catch(()=>null) (page.tsx:59-64) funnels failures into "No data yet → Settings" (165-173). FIX: discriminated result; "Couldn't load — Retry" card for failures.
- [P1] 12px text-slate-400 ≈3.0:1 on white, fails AA (page.tsx:29,115,129,229-230,268,331 + more). FIX: slate-400→slate-500 for text <18px; keep slate-400 icons only.
- [P2] Sidebar dark navy + solid indigo pill contradicts DESIGN.md §Navigation (white surface, indicator not fill). DECISION NEEDED: canonize dark nav in DESIGN.md or repaint shell.
- [P2] Students toolbar: 6 peer actions; "Disabled" ambiguous; 20× per-row "View". FIX: fold ID Cards/Promote/Multi-Class into More menu; rename "Disabled students"; clickable rows.
- [P3] "Teachers / Staff 4 / 4" misreads; KpiCard hover shadow vs flat rule; rounded-xl vs 16px spec; payment initials .slice(0,2); first-name-only sort on students.

## Persona Red Flags
- Efua (Ghanaian accountant, mid-range Android): GHS0 vs 76% contradiction; "GHS0" not money-shaped; demo seed shows Afua Gyasi/Akosua×2 marked Male (prisma/seed-demo.ts) — instant credibility hit for Ghanaian prospects; hero CTA teacher-shaped for accountant role.
- Sam (a11y): 3.0:1 labels; icon-only bell/globe (verify aria-labels); dash-rise animation must honor prefers-reduced-motion.
- Alex (power user): no shortcuts beyond ⌘K; checkboxes w/o visible bulk bar; View-button-only rows.

## Minor Observations
First-name sort; duplicate-name rows lack disambiguator; branch-table instruction copy inside heading row; en-GB locale good; demo banner competes with active pill (indigo >10% on home screen).

## Questions
1. Whose morning is this dashboard for (role-shaped hero)? 2. Can the dashboard admit it doesn't know (honest degraded state)? 3. Is the dark sidebar a decision or an accident?

## Note
/fees/collect 404 in capture was the screenshot script's path error (route is /fees/collect/[studentId]) — not a product bug.
