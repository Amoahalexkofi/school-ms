# Skula vs Smart School v7.1.0 — Gap Audit

_Originally generated 2026-06-21 from a 5-cluster parallel audit._
_**Re-verified 2026-07-20** against the current code, file by file._

Intentional product differences — **SaaS multi-tenancy** and the **per-school
website builder** — are NOT counted as gaps.

Legend: ✅ full · 🟡 partial · ❌ missing · 🔴 bug

> **Reading this file.** The P0 list below is kept as a record of what was
> found and fixed; every item is closed. Do not use the original file:line
> references as a map of the codebase — several paths in the 2026-06-21 pass no
> longer exist (`app/(dashboard)/messages/*` is now `messaging/`, and
> `app/api/lesson-plans/` is now `app/api/lessons/`). Verify before acting on
> anything here.

---

## P0 — Live-demo landmines — ✅ ALL CLOSED (verified 2026-07-20)

| # | Issue | Resolution |
|---|-------|-----------|
| 1 | Inventory → Issue Item crashed on `item.available` | ✅ uses `item.quantity` throughout (`app/api/inventory/issues/route.ts:17,32-33,50`) |
| 2 | Front Office → Visitor save threw on fields not on the model | ✅ writes only `Visitor` fields (`app/api/front-office/visitors/route.ts:27-49`) |
| 3 | Enquiry follow-up frozen (status vocab mismatch) | ✅ API defaults `status:"NEW"`, matching the UI vocab; `description` written and rendered |
| 4 | Messaging compose sent nothing | ✅ client sends `{title,sendMail,sendSms,sendTo,sendThrough}` matching the API. Page is `/messaging`, not `/messages` |
| 5 | Chat messages mis-aligned (`myId` never set) | ✅ fixed, then the whole module was rebuilt — see "Chat rebuild" below |
| 6 | Transport → Assign student always 422 | ✅ route resolves natural ids and creates the pickup link if missing (`app/api/transport/assign/route.ts:12-39`) |
| 7 | Online Admission `/apply` dead | ✅ posts to `/api/admissions/apply`; both paths are in the public allowlist |
| 8 | Dead Timetable link | ✅ points at `/subject-groups` (`TimetableClient.tsx:174`) |
| 9 | Half-day attendance % mismatch | ✅ report uses `(P + L + F*0.5) / (total - H)`, matching the service |
| 10 | Lesson Plans GET 500 on `staff:{name}` | ✅ route moved to `app/api/lessons/`; no staff select. Names built from `firstName`/`lastName` server-side |
| 11 | Dead Receipt links for STUDENT/PARENT | ✅ `/fees/receipt` granted to both via longest-prefix match |
| 12 | ID-card photos read wrong field | ✅ both cards read `.image`, matching the schema |
| 13 | Sections duplicate name → 500 | ✅ `P2002` mapped to 422 (`app/api/sections/route.ts:11`) |

## P1 — Security / data-correctness

**Closed:**

- ✅ **`canAccessApiRoute` fail-open** — an unmatched `/api/*` once allowed any
  authenticated user. Now denies by default (`lib/auth/middleware-utils.ts:404`).
  Deny-by-default binds every role including SUPER_ADMIN, so **any new
  authenticated API route must add a rule or it will 403.**
- ✅ **`/api/website/notices` unprotected** — now covered by an ADMIN-only
  `/api/website` rule.
- ✅ **Granular permissions unenforced** — the matrix *is* enforced, by
  `isApiCallPermitted` (`proxy.ts`). The audit looked at `lib/rbac.ts`, which
  was dead code with zero importers; it has been deleted.
- ✅ **Portal roles skipped the granular gate** — `ROLE_DEFAULTS` had no entry
  for STUDENT, PARENT or RECEPTIONIST, and callers treated a missing entry
  (`undefined`) the same as a deliberate unrestricted (`null`). All three now
  have explicit defaults, and `undefined` denies. Covered by
  `scripts/check-permission-gate.ts`.
- ✅ **Chat IDOR** — `/api/chat/[roomId]` checked only that you were signed in,
  never that you were a participant. Both verbs now 404 for non-participants.

**Still open:**

- 🔴 **The permission matrix cannot revoke.** `mergePerms`
  (`lib/permission-defaults.ts`) ORs base with custom
  (`result.canDelete || entry.canDelete`), so unchecking a box in Roles &
  Permissions does nothing if the base role already grants it. You cannot build
  a restricted teacher. This is a **product decision**, not a bug to quietly
  flip — changing it alters what the screen means for every school already
  using it.
- 🟡 **41 of 74 API route groups have no granular module mapping**
  (`API_MODULE_MAP`), so the matrix does not reach them; they are governed by
  the coarse role gate alone.
- 🟡 **Duplicate `/homework` rule** — declared at `middleware-utils.ts:78`
  (ADMIN/TEACHER) and again at `:148` (adding STUDENT/PARENT). Equal prefix
  length means the tie goes to the first, so the second is dead. Students reach
  homework through the server-rendered `/my-homework` page, so nothing is
  visibly broken; the rule is misleading rather than harmful.
- **Secrets in cleartext to browser** — Email/SMS/WhatsApp configs store API
  keys and passwords plaintext and echo them back to the client.
- **SMS/WhatsApp false success** — senders don't check the HTTP response and
  report `success:true` even on provider failure.
- **No `branchId` scoping** in operations modules despite the paid Multi Branch
  add-on → records leak across branches within a tenant.
- **Parent portal empty for real parents** — `User.childs` is written ONLY in
  `seed-demo.ts`; no admin, admission or API path sets it.
- **Audit Log permanently empty** — `audit.log()` has 0 callers.
- **Fee discounts never applied at collection** — the Collect dialog never
  sends `discountIds`; "paid" is defined inconsistently across
  collect/report/carry-forward.
- **Payroll net = basic only** on the Finance page path; a richer payslip flow
  also exists (duplicate systems).
- Latent IDOR on `fees/receipt/[id]` (findUnique, no ownership check) — safe
  only because the route is staff-gated today.

## P2 — Feature gaps (works, but thinner than Smart School)

- **Custom fields inert** — definitions stored, values never captured/rendered.
- **Promotion** lacks pass/fail + continue/leave + auto-alumni; **Student
  Transfer** module missing.
- **Subjects/Classes/Sections** add-only (no edit/delete `[id]` routes).
- **Most Operations modules** are create+list only; dropped form fields (room
  `costPerBed`/`floor`, vehicle photo, pickup lat/long).
- **Library** membership never enforced at issue; duplicate return logic;
  hard-delete orphans history.
- **Fees**: no fine/late-fee at collection; one report only (no
  daily/class-wise/CSV); fee reminders config-only (no cron sends); gateway
  keys DB-only; Flutterwave currency hard-coded `GHS`.
- **Exams**: no CSV mark import, no all-subjects grid, no teacher
  subject-scoping, no rank override, no result SMS/PDF; **Grades &
  Marks-Division** are API-only.
- **Subject-wise Attendance** API-only; broadcast Notification backend has no
  UI; Notification Settings decorative.
- **Reports**: 8 of ~16 types; no PDF export; no payroll/finance/inventory/
  hostel reports.
- **Homework** no grading/submission; **Syllabus**/**Content Share** API-only.

## P3 — Missing modules (Smart School paid add-ons / extras)

- **Gmeet & Zoom Live Classes** — absent
- **Online Course / Video Tutorial** — absent
- **Behaviour Records** — ✅ built (dd77235)
- **CBSE Examination** (GPA engine) — absent
- **Calendar / Events** — absent
- **QR Code Attendance** — not a base SS v7.1.0 feature (greenfield if wanted)

---

## Chat rebuild (2026-07-18, `08070c9`)

The module was rebuilt after the page was reported "scrolling up and down by
itself". Root cause: every 3s poll called `scrollIntoView` on a bottom anchor,
which walks the ancestor chain and drags the document; compounding it, the chat
shell had no definite height so the *document* was the scroller. Also fixed:

- `getRoomMessages` took the **oldest** 50 (`asc` + `take`), freezing any
  thread past 50 messages — new messages were never in the page.
- The poll replaced the whole list, wiping pages loaded via "Load earlier".
- `getOrCreateDirectRoom` used `every` (a subset test that also matches empty
  rooms), so duplicate direct threads could be created.
- Rooms now sort by last message, not room creation date.
- Sidebar changed `min-h-screen` → `h-screen sticky top-0`; the aside was
  1533px tall, making **every** page's document taller than the viewport.

Not verified: the mobile breakpoint (`md:` two-pane collapse) — the test
browser would not resize below 1440px.

## False alarms (claimed by sub-agents, disproved by direct check)

- ❎ "Students can create/edit/delete online exams / overwrite marks / read
  unpublished results." **No** — `proxy.ts` method-guard plus the
  `/api/exams*` → `/exams` mapping already block STUDENT/PARENT.
- ❎ "Orphan APIs cause demo 404s." No sidebar links exist, so no visible 404 —
  they're incomplete back-ends, not broken pages.
- ❎ "`ShareContent` model missing." It exists; the endpoint works, just UI-less.
