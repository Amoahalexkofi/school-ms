---
target: app/sign-in/page.tsx (tenant sign-in page)
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-19T00-55-49Z
slug: app-sign-in-page-tsx
---
Method: dual-agent (A: design-review sub-agent · B: detector/browser-evidence sub-agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading spinner + disabled button + `role="alert"` error are solid; no field-level feedback until submit |
| 2 | Match System / Real World | 3 | `placeholder="you@school.edu"` implies an institutional `.edu` address, mismatched with a Ghana-first product where schools mostly use `.com`/`.edu.gh`/personal email |
| 3 | User Control and Freedom | 1 | No forgot-password link despite the flow existing and working in the codebase — a stuck user has zero recovery path on this screen |
| 4 | Consistency and Standards | 2 | Resting 3-layer card shadow and a decorative gradient panel directly contradict DESIGN.md's Flat-by-Default rule and "no decorative gradients" |
| 5 | Error Prevention | 3 | Client-side email-format and required-field checks before hitting the network; no CAPS LOCK warning |
| 6 | Recognition Rather Than Recall | 2 | `autoComplete` correctly wired (real strength) — but the missing forgot-password link converts any recall failure into a hard dead end |
| 7 | Flexibility and Efficiency | 2 | Password show/hide toggle has `tabIndex={-1}`, removed entirely from keyboard tab order |
| 8 | Aesthetic and Minimalist Design | 2 | Form itself is minimal; left panel stacks 6+ content groups plus a decorative giant initial, gradient, and dual box-shadows on the logo |
| 9 | Error Recovery | 2 | Error copy is plain and on-brand but deliberately vague ("Invalid email or password") with no follow-on action |
| 10 | Help and Documentation | 1 | No "having trouble signing in?" affordance, despite the school's phone/email/WhatsApp sitting one panel over, unwired to the login struggle |
| **Total** | | **21/40** | **Acceptable (53%)** |

## Design Specificity Verdict

**Mixed, leaning generic-chrome-around-real-data.**

**LLM assessment**: The left panel's content is genuinely per-tenant — logo or initials, name, est./location, motto with fallback, phone/email/WhatsApp with fallback, a gradient computed from the tenant's own primaryColor. That's real personalization, verified live across three tenants (jonnyrichards, demo, holygrace) with correct conditional rendering in every combination observed. But the structure around that data is identical for every school: the same hardcoded four-chip "Portal access for → Students/Parents/Staff/Admin" row regardless of which portals a school actually has enabled, identical copy, identical shadow/gradient recipe, "Powered by Skula" twice. The one place genuine specificity shows is the "Back to {name} website" link — real, earned copy. Net: swap the DB row and you get the same page with new colors, which is reasonable for a multi-tenant product but means the "sells trust in this specific school" framing is doing less work than it looks.

**Deterministic scan**: 5 findings, all `design-system-color` / advisory, all in `app/sign-in/page.tsx`, zero in the other three files: two black-alpha overlay/shadow values (lines 75, 100), the WhatsApp brand green `#25D366` (line 161), and the form card's two shadow-alpha layers (line 214). All five are genuine — Assessment B found no false positives this pass (unlike the SchoolSite scan, where reused/brand colors softened several hits). The card's own box-shadow being independently flagged by the detector corroborates Assessment A's DESIGN.md violation finding on the same element from a completely different angle (mechanical literal-color scan vs. LLM judgment against the Flat-by-Default rule) — a real point of agreement between the two isolated assessments.

**Visual overlays**: Not available — no browser-automation tool was exposed in this environment, confirmed independently by both assessments. Both relied on WebFetch content checks (which confirmed correct conditional rendering across three live tenants) plus static source reading; no rendered screenshot exists to point to, and neither assessment fabricated a visual account.

## Overall Impression

The form itself is well-built — solid states, sensible autocomplete, on-brand error copy, real per-tenant defensive rendering that was actually verified against live data. But the single most damaging finding is procedural, not aesthetic: a fully-built forgot-password flow exists in this codebase and has zero entry point on this page, meaning any user who genuinely forgets their password hits a dead end today, at the highest-stakes moment on the page. That's compounded by two documented violations of this project's own DESIGN.md (resting shadow, decorative gradient) on the single most-viewed screen in the product. The biggest opportunity is closing that gap — reconnect the recovery flow, then bring the surface back in line with its own design system.

## What's Working

1. **Verified-correct defensive rendering across real tenants** — logo→initials, motto→fallback copy, and the whole contact block's conditional appearance all confirmed live across three different subdomains, no broken layout in any combination.
2. **Password field UX reduces both recall and typo risk correctly** — masked by default, `autoComplete="current-password"` wired for password-manager autofill, plus a visible reveal toggle (though see the P2 keyboard-access issue below).
3. **On-brand, non-leaking error copy** — "Invalid email or password" doesn't reveal which field is wrong (no username-enumeration leak) and uses plain language, matching the "plain, direct, reassuring" brand voice better than most of the rest of the page.

## Priority Issues

**[P0] Missing "Forgot password?" link despite a fully-built flow behind it**
- **Why it matters**: `app/forgot-password/page.tsx`, `app/api/auth/forgot-password/route.ts`, and `app/reset-password/[token]/page.tsx` all exist and work. This isn't an unfinished feature — it's a live dead end at the single highest-stakes moment on the page: a parent locked out while trying to check results or pay fees has no path forward except leaving the product.
- **Fix**: Add a small "Forgot password?" link near the password field, pointed at `/forgot-password`, and confirm it carries tenant context (subdomain) through to the reset flow.
- **Suggested command**: `/impeccable shape`

**[P1] Resting card shadow and gradient panel violate DESIGN.md's explicit rules**
- **Why it matters**: DESIGN.md names this exact failure mode directly — "the 2016-admin test: if a resting card has a drop shadow, it looks like a dated admin theme" and "no decorative gradients." The detector independently flagged the same card's shadow values as undocumented literals, corroborating this from a mechanical angle. This is on the single most-viewed page in the product, every login, every school, every day.
- **Fix**: Flatten the card to a 1px hairline border per spec, or if an intentional exception is wanted for this auth/marketing-adjacent surface, write that exception into DESIGN.md explicitly rather than leaving it as drift.
- **Suggested command**: `/impeccable polish`

**[P1] Heading weight requests font-black (900) but Plus Jakarta Sans is only loaded up to 800, and neither heading uses the Two-Voice Rule's Montserrat**
- **Why it matters**: `app/layout.tsx` loads Plus Jakarta Sans up to weight 800 only; both the school-name h1 and "Sign in" h2 use `font-black` (900), forcing synthetic/faux-bold rendering that's inconsistent across browsers. Separately, DESIGN.md's Two-Voice Rule reserves Montserrat for the biggest titles and caps display weight at 700 — the two largest headings on the page use neither the right font nor a real weight.
- **Fix**: Apply the Montserrat class to the school-name h1 and "Sign in" h2, drop to `font-bold` (700, an actually-loaded weight).
- **Suggested command**: `/impeccable typeset`

**[P2] Password show/hide toggle is unreachable by keyboard**
- **Why it matters**: `tabIndex={-1}` removes the reveal button from the natural tab order — a keyboard-only or screen-reader user cannot verify what they typed before submitting, on exactly the field where a silent typo causes a failed login with (per the P0 above) no recovery path.
- **Fix**: Remove `tabIndex={-1}` so the toggle sits naturally after the password field in tab order.
- **Suggested command**: `/impeccable harden`

**[P3] Mobile branded panel pushes the form below the fold; on-screen contact info isn't wired as a help affordance**
- **Why it matters**: `min-h-[520px] lg:min-h-0` stacks logo/name/location/motto/contact/badges/powered-by above the form on phones — real cost given PRODUCT.md's mobile-first, often-stressed audience. Separately, the phone/email/WhatsApp already fetched and displayed on the left panel is never connected to a "having trouble? contact {school}" affordance near the error state, despite the raw material already being on screen.
- **Fix**: Condense the mobile branded region (smaller logo, drop the decorative giant initial or the est./location line on small viewports); add a small help line using the already-fetched contact info near the error state.
- **Suggested command**: `/impeccable layout`

## Persona Red Flags

**Jordan (first-timer)**: No forgot-password link anywhere on the page. `placeholder="you@school.edu"` implies an institutional address most Ghanaian schools don't actually issue — a genuinely unsure first-timer may believe it's a format requirement. The generic "Invalid email or password" error gives no way to distinguish "your account hasn't been created yet by the admin" from "you mistyped your password" — both look identical.

**Sam (accessibility-dependent)**: Password-visibility toggle is entirely unreachable via keyboard Tab navigation (`tabIndex={-1}`). The decorative giant initial letter (`fontSize: 180, opacity: 0.06`) has no `aria-hidden="true"` — screen readers may announce a stray lone letter inside the branding. Left-panel text uses opacity-based white against a gradient computed from an unmoderated per-tenant color with no minimum-contrast guardrail — a school with a pale/light brand color could push contact rows or "Powered by Skula" below WCAG AA 4.5:1; this risk didn't surface on the three demo tenants checked but is a real per-tenant amplifying risk (echoes the same gap Assessment A found independently on the public school-site critique).

**Casey (mobile)**: `min-h-[520px]` forces 500+px of branding scroll before the email/password fields appear on a phone. The password-toggle eye icon sits inside a 44px-tall input but its own hit area looks smaller than the field around it — worth checking against the 44px minimum tap-target rule.

## Minor Observations

- `withCountryCode()` blindly prefixes `+233` on any phone/WhatsApp number without a leading `+`, with no length/format validation — fine for observed data, no defensive check against malformed tenant input.
- The right-panel "Back to {name} website" link is a genuine specificity win — real, tenant-authored copy, not a template string.
- "Powered by Skula" appears twice (left panel + right-panel footer) plus "a Novalss product" once — mild, low-cost redundancy.
- Initials-avatar fallback logic is duplicated (96px left, 36px right) rather than shared, but kept visually/logically consistent between the two.
- No CAPS LOCK indicator on the password field — a common, cheap addition that would help the exact "silent typo → vague error → no recovery" chain flagged in the P0/P1 issues above.
- None of the three live tenants checked (jonnyrichards, demo, holygrace) currently has a `whatsappNumber` set — the new WhatsApp row added this session is real and correctly built, but effectively unexercised in production today.
