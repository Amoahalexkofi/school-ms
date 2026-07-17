# Skula vs Smart School v7.1.0 — Gap Audit

_Generated 2026-06-21 from a 5-cluster parallel audit. Every **Skula-side** finding
is verified against actual code. Smart-School feature comparisons are against the
documented v7.1.0 feature set (the PHP source was not readable from the audit
sandbox). Intentional product differences — **SaaS multi-tenancy** and the
**per-school website builder** — are NOT counted as gaps._

Legend: ✅ full · 🟡 partial · ❌ missing · 🔴 bug

---

## P0 — Live-demo landmines (crashes / dead core flows a visitor hits)

| # | Issue | File(s) | Status |
|---|-------|---------|--------|
| 1 | **Inventory → Issue Item crashes** — code reads `item.available`; Item model only has `quantity` | `app/api/inventory/issues/route.ts` (17,32-33,50), `InventoryClient.tsx:252` | ☐ |
| 2 | **Front Office → Visitor save throws** — POST writes `studentSessionId`/`staffId` not on Visitor model | `app/api/front-office/visitors/route.ts:28,46-47` | ☐ |
| 3 | **Front Office → Enquiry follow-up frozen** — status vocab `active` vs UI `NEW/CONTACTED/...`; `description` never read | `front-office/enquiries/route.ts:50`, `FrontOfficeClient.tsx:19-24` | ☐ |
| 4 | **Messaging broken** — compose sends nothing (client `{subject,channel,recipientType}` vs API `{title,sendMail,sendTo}`); log shows blank rows + `NaN` | `app/(dashboard)/messages/`, `lib/services/messaging.ts` | ☐ |
| 5 | **Chat messages mis-aligned** — `myId` never set → every message renders as the other party | chat client | ☐ |
| 6 | **Transport → Assign student always 422** — client `{studentId,routeId,pickupPointId}` vs API `{studentSessionId,routePickupPointId}` | `transport/assign/route.ts:10-12`, `TransportClient.tsx:109,129` | ☐ |
| 7 | **Online Admission `/apply` is dead** — public form POSTs to admin-gated `/api/admissions` → applicant bounced to sign-in | `app/apply/page.tsx:28`, middleware | ☐ |
| 8 | **Dead Timetable link** — empty-state points to `/settings?tab=subject-groups`; real page is `/subject-groups` | `TimetableClient.tsx:174` | ☐ |
| 9 | **Half-day attendance % mismatch** — report counts `F` as full present; portal counts `0.5` → admin & parent see different % | `reports/attendance/route.ts:68` vs `lib/services/attendance.ts:62` | ☐ |
| 10 | **Lesson Plans GET 500** — selects `staff:{name}`; Staff has `firstName`/`lastName` | `app/api/lesson-plans/route.ts:22` | ☐ |
| 11 | **Dead Receipt links** — my-fees/parent receipt → `/fees/receipt/...` which middleware blocks for STUDENT/PARENT | my-fees, parent fees pages | ☐ |
| 12 | **ID-card photos** — code reads `student.photo`/`staff.photo`; schema field is `image` (verify) | id-card clients | ☐ |
| 13 | **Sections duplicate name → 500** — P2002 not mapped to 422 | `app/api/sections/route.ts` | ☐ |

## P1 — Security / data-correctness (not visibly broken, but real)

- **Roles & Permissions is theater** — granular matrix persists, but `lib/rbac.ts::hasPermission` has **0 call sites**; real gate is the hardcoded role→prefix allowlist. `canAccessApiRoute` **fails open** (unmatched `/api/*` → allow any authed user). Concrete instance: `/api/website/notices` has no rule → any logged-in user can PUT/DELETE public website notices.
- **Secrets in cleartext to browser** — Email/SMS/WhatsApp configs store API keys/passwords plaintext and echo them back to the client.
- **SMS/WhatsApp false success** — senders don't check the HTTP response; report `success:true` even on provider failure. (This is why "receipts work" needs caveat — a failed send looks successful.)
- **No `branchId` scoping** in operations modules despite the paid **Multi Branch** add-on → records leak across branches within a tenant.
- **Parent portal empty for real parents** — `User.childs` link is written ONLY in `seed-demo.ts`; no admin/admission/API path sets it.
- **Audit Log permanently empty** — `audit.log()` has 0 callers anywhere.
- **Fee discounts never applied at collection** — Collect dialog never sends `discountIds`; "paid" defined inconsistently across collect/report/carry-forward.
- **Payroll net = basic only** on the Finance page path (`generatePayroll`); a richer payslip flow also exists (duplicate systems).
- Latent IDOR on `fees/receipt/[id]` (findUnique, no ownership check) — safe only because route is staff-gated today.

## P2 — Feature gaps (works, but thinner than Smart School)

- **Custom fields inert** — definitions stored, values never captured/rendered (`CustomFieldValue` unreferenced).
- **Promotion** lacks pass/fail + continue/leave + auto-alumni; **Student Transfer** module missing.
- **Subjects/Classes/Sections** add-only (no edit/delete `[id]` routes).
- **Most Operations modules** are create+list only (no edit/delete UI); dropped form fields (room `costPerBed`/`floor`, vehicle photo, pickup lat/long).
- **Library** membership never enforced at issue; duplicate return logic; hard-delete orphans history.
- **Fees**: no fine/late-fee at collection; one report only (no daily/class-wise/CSV); fee reminders config-only (no cron sends); gateway keys DB-only (no settings UI); Flutterwave currency hard-coded `GHS`.
- **Exams**: no CSV mark import, no all-subjects grid, no teacher subject-scoping, no rank override, no result SMS/PDF; **Grades & Marks-Division** are API-only (no page) and the grade model written by `/api/grades` is read by nothing (computation uses `gradingScale`).
- **Subject-wise Attendance** API-only (no page); broadcast Notification backend has no UI; Notification Settings decorative.
- **Reports**: 8 of ~16 types; no PDF export, no payroll/finance/inventory/hostel reports.
- **Homework** no grading/submission; **Syllabus**/**Content Share** API-only (no page).

## P3 — Missing modules (Smart School paid add-ons / extras)

- **Gmeet & Zoom Live Classes** — absent
- **Online Course / Video Tutorial** — absent
- **Behaviour Records** — ✅ built (dd77235): incident types w/ merit-demerit points, per-student log, conduct watch list, starter set
- **CBSE Examination** (GPA engine) — absent
- **Calendar / Events** — absent
- **QR Code Attendance** — not a base SS v7.1.0 feature (greenfield if wanted)

---

## False alarms (claimed by sub-agents, disproved by direct check)

- ❎ "Students can create/edit/delete online exams / overwrite marks / read unpublished results." **No** — `proxy.ts` method-guard (online-exams) + `canAccessApiRoute` mapping `/api/exams*` → `/exams` (admin/teacher) already block STUDENT/PARENT. Verified.
- ❎ "Orphan APIs cause demo 404s (subject-attendance, grades, mark-divisions)." **No sidebar links exist**, so no visible 404 — they're just incomplete back-ends.
- ❎ "`ShareContent` model missing." It exists (`schema.prisma:2319`); endpoint works, just UI-less.
