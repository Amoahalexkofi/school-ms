---
target: app/SchoolSite.tsx (public school website)
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
timestamp: 2026-08-19T00-47-22Z
slug: app-schoolsite-tsx
---
Method: dual-agent (A: design-review sub-agent · B: detector/browser-evidence sub-agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | No `onError` fallback on logo/coverImage/hero-slide `img` tags — dead URL shows a blank/broken flash |
| 2 | Match System / Real World | 3 | Closing CTAs ("Sign In Now") assume an existing account; no path for a first-time prospective parent |
| 3 | User Control and Freedom | 3 | Carousel arrows/dots + hover-pause, drawer closes via X/Escape — solid |
| 4 | Consistency and Standards | 2 | Breaks the project's own DESIGN.md twice: Two-Voice Rule (no Montserrat anywhere) and Flat-by-Default (resting shadows on contact/location cards) |
| 5 | Error Prevention | 3 | Low error surface; external links correctly `target=_blank rel=noopener` |
| 6 | Recognition Rather Than Recall | 4 | Icon+label+value pairing throughout, no icon-only mysteries |
| 7 | Flexibility and Efficiency | n/a | Persuade surface — no power-user path expected |
| 8 | Aesthetic and Minimalist Design | 2 | Arbitrary school color applied to ticker, 4 icon badges, 4 CTA buttons with no scarcity mechanism — no equivalent of the app's "One Accent Rule" |
| 9 | Error Recovery | 2 | "Contact details not yet configured. Sign in to update settings →" — an admin-facing string leaking to public visitors at the page's last content section |
| 10 | Help and Documentation | n/a | Not needed for a simple informational page |
| **Total** | | **22/32** | **Acceptable (69%)** |

## Design Specificity Verdict

**Mixed, leaning generic-in-practice despite genuine per-tenant plumbing.**

**LLM assessment**: The code is architecturally built for per-school authorship — profile.name/logo/coverImage/motto/address/phone/email/whatsappNumber, settings.primaryColor/aboutTitle/aboutText, custom hero slides, and live-DB stats all flow through. That's real investment. But live evidence undercuts it: fetching two different real tenants today (demo.getskula.com and jonnyrichards.getskula.com) both render the **identical** hero tagline "Nurturing minds. Building futures." and the **identical** About paragraph — the hardcoded fallbacks in SchoolSiteHero.tsx:31 and SchoolSite.tsx:155-157. Going by these two live samples, unedited defaults are the common case, not the exception. A parent visiting two Skula-powered schools will recognize the template.

**Deterministic scan**: 4 findings, all `design-system-color` / advisory, 0 in SchoolSiteHero.tsx: `rgba(0,0,0,0.2)` (SchoolSite.tsx:74, shadow alpha), `#25D366` (SchoolSite.tsx:178, WhatsApp brand green), `#0d253d` (SchoolSite.tsx:329, reuse of the page's own established ink color), `rgba(13,37,61,0.97)` (SchoolSiteNav.tsx:122, same ink color as a drawer backdrop). On inspection, 3 of 4 are plausible false positives (brand color, shadow alpha, or a repeat of an already-established in-file color) rather than genuine undocumented drift — but the detector's literal-color-token angle and the LLM's independent typography/elevation findings converge on the same underlying gap from different directions: this surface doesn't fully conform to its own normative DESIGN.md.

**Visual overlays**: Not available — no browser-automation tool was exposed in this environment (only WebFetch, which returns markdown-from-HTML, not pixels). Both assessments confirmed this and relied on live content-fetch plus static source reading instead of a rendered screenshot; no user-visible overlay exists to point to.

## Overall Impression

Structurally sound and genuinely tenant-aware under the hood (arbitrary school colors, full empty-state coverage, server-verified preview gating), but the *shipped* experience across real live schools today is closer to a shared template than a bespoke site, and it has one real trust-damaging bug: an admin nudge string surfacing to the public at the exact moment a parent is looking for a phone number. The single biggest opportunity is closing the gap between what the code is *capable* of (rich per-school content) and what actually ships when a school hasn't filled every field in yet — since cold-onboarded schools are this product's normal case, not an edge case.

## What's Working

1. **`color-mix`-derived deep tones for the hero fallback and CTA banner** (`color-mix(in srgb, ${color} 78-80%, #0d1424)`) — a real engineering answer to "every school picks an arbitrary hex," keeping the no-photo hero and CTA band on-brand regardless of the school's chosen color.
2. **Exhaustive, working empty-state coverage** — every optional field (logo, coverImage, motto, phone, whatsapp, notices, slides, stats) has an actual conditional branch, not a silent failure or broken box. For a product whose users routinely onboard cold, this is real, checked discipline.
3. **Server-verified preview gating** — `preview={preview && !!session?.user}` in page.tsx:70 cannot be spoofed by an anonymous visitor appending `?preview=1`; it requires a real authenticated session server-side.

## Priority Issues

**[P1] Boilerplate copy is byte-identical across real live tenants**
- **Why it matters**: Directly undercuts the "feels authored for this school" goal; a repeat visitor across two Skula schools will spot the template, which is the opposite of the trust this page exists to build.
- **Fix**: Require or strongly nudge `motto`/`aboutText`/one hero slide during onboarding before the public site is considered "live," or vary the fallback copy pool so it isn't verbatim-identical across tenants.
- **Suggested command**: `/impeccable adapt`

**[P1] Admin-facing string leaks to public visitors at the emotional low point**
- **Why it matters**: "Contact details not yet configured. Sign in to update settings →" renders for any visitor when no contact info is set — the last content section before the closing CTA, exactly where a convinced parent looks for a phone number. Reads as a dev message, not school communication.
- **Fix**: Hide the Contact section entirely when empty, the same way Notices and Stats already correctly self-hide, instead of showing an admin nudge to anonymous visitors.
- **Suggested command**: `/impeccable clarify`

**[P1] No contrast-safe treatment for the arbitrary school color on white-text/white-icon surfaces**
- **Why it matters**: The notice ticker, hero/About/contact-banner CTA buttons, and stats/contact icon badges all render `background: color` with white text/icons directly with zero contrast safeguard — only the two `color-mix` gradient usages get protection. A school picking a pale/light accent (a real possibility since it's user-chosen) can produce a WCAG-failing combination, against PRODUCT.md's own stated AA target.
- **Fix**: Compute a contrast-safe foreground (or auto-darken the raw color) for any surface using `color` as a solid background with white text/icons, not just the two gradient cases.
- **Suggested command**: `/impeccable harden`

**[P2] Two independently-timed autoplay animations run concurrently, no `prefers-reduced-motion` support**
- **Why it matters**: The 7s hero carousel and the continuous notice marquee can animate simultaneously; neither respects `prefers-reduced-motion`, contradicting DESIGN.md's explicit rule and a real vestibular-accessibility requirement.
- **Fix**: Respect `prefers-reduced-motion` (freeze both, keep manual controls functional).
- **Suggested command**: `/impeccable harden`

**[P2] Design-system violations against the project's own normative DESIGN.md**
- **Why it matters**: Two-Voice Rule broken (no Montserrat anywhere in headlines — all Plus Jakarta Sans) and Flat-by-Default broken (resting shadows on contact/location cards). This is the one surface with a checked-in design spec, and it doesn't follow its own rules.
- **Fix**: Apply Montserrat to the hero H1 and section H2s; strip resting shadows from contact/location cards in favor of the hairline-border treatment used elsewhere on the page.
- **Suggested command**: `/impeccable audit` then `/impeccable polish`

## Persona Red Flags

**Jordan (first-time prospective parent, evaluating trust)**: Sees the exact same "Nurturing minds. Building futures." tagline this review found on a second, unrelated school. Hits "Contact details not yet configured. Sign in to update settings →" verbatim while looking for a phone number. Every CTA on the page assumes Jordan already has an account — no "new here? here's how to enroll" path anywhere.

**Riley (stress-tester)**: Rapid-clicking the hero's prev/next arrows races the carousel — `go()` sets `fading=true` then a bare `setTimeout(...,350)` with no guard against overlapping calls. `activeNotices.slice(0,6)` silently drops notices beyond 6 with no "showing 6 of 10" indicator. A genuinely fresh, zero-data tenant renders correctly but thin — hero + generic About + "not configured" contact + sign-in banner — for exactly the cold-onboarding schools this product serves most.

**Casey (mobile)**: Hero uses `height: "88vh"` with no `dvh` fallback — the classic mobile-Safari `vh`-vs-chrome jumpiness risk. Nav's Sign In button is `hidden sm:inline-flex` — below the `sm` breakpoint, reaching Sign In requires opening the hamburger drawer first (three taps vs. one on desktop) for the page's most-repeated CTA. Phone/WhatsApp/Contact-Us pills wrap together on narrow widths with two different hardcoded brand colors (`#25D366` plus the school's own accent) competing on the most space-constrained layout.

## Minor Observations

- Notice dates are hardcoded to `en-GB` locale regardless of `profile.country` — likely fine for the Ghana-first audience but an unstated assumption.
- `NOTICE_CARD`/`NOTICE_DOT`/`NOTICE_LABEL` all gracefully default unknown `notice.type` to "info" — good defensive coding.
- Footer discloses "Powered by Skula · a Novalss product" in both the main footer and mobile drawer — intentional-looking duplication, not accidental.
- `formatName` only title-cases when the raw name looks like a lowercase slug; a school with an intentionally stylized/lowercase legal name has no override.
