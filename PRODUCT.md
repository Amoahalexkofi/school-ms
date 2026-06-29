# Product

## Register

product

## Users

School staff running daily operations, plus the families they serve:

- **Administrators / head teachers** — the primary operators. Set up the school, manage students, staff, classes, and oversee everything.
- **Accountants / fee collectors** — handle fees, payments, balances, and owing reports. They trust Skula with money, so legibility and correctness are non-negotiable.
- **Teachers** — take attendance, enter marks, set & evaluate homework, plan lessons.
- **Receptionists / front-office** — visitors, enquiries, phone calls, dispatch.
- **Librarians** — catalog and issue/return.
- **Students & parents** — read-only portals (results, homework, fees, attendance).

Context: African (Ghana-first) basic and secondary schools — local conventions matter (GES, BECE, cedi). Many users are **non-technical**, work on **mixed and low-end devices including mobile**, and sometimes on **unreliable connectivity**. Skula is a **multi-tenant SaaS** (each school is its own tenant) with strong **role-based** access. People use it for long, repetitive sessions (rosters, mark sheets, payment runs), so friction and visual noise compound fast.

## Product Purpose

Skula is a complete school-management system delivered as a modern multi-tenant SaaS — an exact feature replica of Smart School v7.1.0, rebuilt on Next.js so it's faster, cleaner, and hosted. It covers the full operational surface: students, attendance, exams & report cards, fees, lesson plans, homework, front office, library, transport, inventory, hostel, HR/payroll, and student/parent portals.

It exists because the school software schools actually rely on is powerful but dense, dated, and self-hosted. Skula keeps the feature depth and replaces the experience.

Success looks like: a school runs its entire day inside Skula; staff trust it with money and student records without double-checking on paper; and it feels visibly better than the legacy system it replaces — enough that switching feels obvious.

## Brand Personality

**Trustworthy, calm, efficient.** Voice is plain, direct, and reassuring — no jargon, no cutesy copy, no hype. The interface should feel like a dependable instrument for busy people: it gets out of the way, never creates anxiety, and makes dense information easy to read at a glance. The emotional goal is *confidence and control*.

## Anti-references

- **Legacy Smart School PHP admin** — the dense, gray, dated admin look (cramped tables, tiny controls, everything on screen at once) that Skula is replacing. Feature parity, not UI parity.
- **Generic Bootstrap admin templates** — off-the-shelf dashboard themes with no point of view; Skula should not look like everyone else's admin panel.
- **Over-designed / flashy dashboards** — heavy animation, decorative gradients, and attention-grabbing motion that get in the way of daily work.
- **Childish school clip-art** — cartoonish, primary-color, "kiddie" aesthetics. Schools are institutions; the product should read as serious and professional.

## Design Principles

1. **Legibility over decoration.** The daily-driver data — rosters, mark sheets, fee balances, attendance — must be instantly scannable. Hierarchy, alignment, and whitespace do the work before any styling.
2. **Calm under load.** Dense screens should feel orderly, not busy. No motion or color competes with the task. The more data on screen, the quieter the chrome around it.
3. **Consistency builds trust.** Every module looks and behaves the same way (same filters, tabs, tables, forms, status chips) so staff transfer knowledge across screens and never feel lost in an unfamiliar corner.
4. **Replace the clutter, keep the depth.** Mirror Smart School's capabilities, never its cramped UI. Modern clarity is the core differentiator — that's the reason to switch.
5. **Forgiving by default.** Clear empty states, confirmable destructive actions, and editable mistakes (fix a wrong fee entry, edit homework, redo an evaluation). People handling money and records need an undo, not a trap.

## Accessibility & Inclusion

Target **WCAG 2.1 AA**. Specifics that matter for this audience:

- Readable on small and low-end screens; layouts work down to mobile widths since many staff and most parents are on phones.
- Sufficient text/UI contrast; **never rely on color alone** for meaning — status is always paired with a label or icon (fee PAID/PARTIAL/UNPAID, attendance present/absent, topic complete/incomplete).
- Forms are keyboard-navigable with visible focus and clear, specific error messages.
- Respect `prefers-reduced-motion`; motion is an enhancement, never required to understand state.
