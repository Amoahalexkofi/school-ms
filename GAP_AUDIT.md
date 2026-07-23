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

**Re-verified 2026-07-22** — most of this list had already been closed since
the last pass (commits between 2026-06-20 and 2026-07-11); the doc just hadn't
caught up. Updated below.

**Closed since 2026-06-21 (verified 2026-07-22):**

- ✅ **Secrets in cleartext to browser** — `lib/config-secrets.ts`
  (`redactSecrets`/`redactList`/`keepSecret`) now redacts `apiKey`/`password`/
  `smtpPassword` on every config GET/POST response
  (`048a8d1`, `app/api/{email,sms,whatsapp}-config/route.ts`).
- ✅ **Audit Log permanently empty** — `c1d6884` instrumented 23 sensitive
  mutations; 21 files now call `audit()`.
- ✅ **Fee discounts never applied at collection** — `80c4b5e` wired a discount
  picker into `FeeCollectClient.tsx`, which sends `discountIds` to
  `app/api/fees/collect/route.ts`, which resolves and applies them.
- ✅ **Latent IDOR on fees/receipt** — `app/(dashboard)/fees/receipt/ownership.ts`
  (`assertCanViewReceipt`) now gates the `[depositId]/[subInvoiceId]` page;
  STUDENT sees only their own record, PARENT only linked children.
- ✅ **Parent portal empty for real parents** — `User.childs` is now set from
  `app/api/parents/link/route.ts`, `app/api/students/route.ts`,
  `app/api/students/import/route.ts`, and `lib/services/students.ts`, not just
  the demo seed.
- ✅ **No `branchId` scoping** — `7def35c` added branch scoping across
  operations modules for Multi Branch correctness.
- ✅ **SMS/WhatsApp false success** (2026-07-22) — every fire-and-forget call
  site (`attendance`, `subject-attendance`, `fees/collect`,
  `cron/fee-reminders`, `exams`, `messaging`) now checks `.success`/`.ok` and
  logs failures instead of swallowing them via bare `.catch(() => null)`.
  Also fixed a real masking bug in `sendViaAfricasTalking`
  (`lib/services/sms.ts`): a 200 HTTP response with a per-recipient failure
  status (`InsufficientBalance`, `Rejected`, etc.) was reported as
  `success: true` because of an `|| res.ok` fallback — removed.
- ✅ **Duplicate `/homework` rule** (2026-07-22) — merged into the single
  `middleware-utils.ts` rule (`SUPER_ADMIN, ADMIN, TEACHER, STUDENT, PARENT`);
  dead second entry removed.

**Closed 2026-07-22:**

- ✅ **The permission matrix cannot revoke.** Fixed: `mergePerms`
  (`lib/permission-defaults.ts`) now treats a custom AppRole's entry for a
  module as authoritative (`{...base, ...extra}`) instead of OR-ing it onto
  the base default — it can grant OR restrict. The save endpoint
  (`app/api/roles/[id]/permissions`) also no longer silently drops a
  fully-unchecked category, so a deliberate full revoke actually persists.
  `__tests__/auth/permission-defaults.test.ts` locks in extend/restrict/
  fallback semantics; `scripts/check-permission-gate.ts` (49 cases) unaffected
  since it only exercises the base-role-only path.
- ✅ **Payroll: two parallel systems.** Fixed by retiring the weaker one —
  the Finance page's "Generate Payroll" (`Payroll`/`PayrollEntry`, netSalary =
  basic salary only, no allowances/deductions/tax) now links to `/payroll`
  (`StaffPayslip`) instead of generating its own entries. `markPayrollPaid`
  kept so historical legacy rows can still be closed out. No schema change,
  no data touched.
- ✅ **Stray abandoned worktrees removed** — four `.claude/worktrees/agent-*`
  checkouts (and their branches) rooted at a commit hundreds behind main;
  uncommitted diffs weren't salvageable.

**Investigated 2026-07-22 — mostly a non-issue:**

- 🟡 **40 of 74 API route groups have no granular module mapping.** Audited
  all 40: the large majority are already SUPER_ADMIN/ADMIN-only at the coarse
  gate, where `ROLE_DEFAULTS` is `null` (unrestricted) — mapping those would
  be a no-op, not a fix. Two were real and are now closed: `/api/branches`
  let TEACHER/ACCOUNTANT/LIBRARIAN (coarse-gated in for the branch-switcher's
  read) also POST/PATCH/DELETE branch records with nothing to stop them — no
  permission category exists for this Skula-only add-on, so restricted them
  to GET via a `proxy.ts` method-guard (same pattern as the existing
  online-exams one). `/api/admissions` had no mapping despite granting
  RECEPTIONIST through the coarse gate — mapped to `front_office`, which
  RECEPTIONIST already has `ALLOW` on (matches Smart School's own seed:
  Admission Enquiry lives under Front Office), so no access change for
  anyone using it correctly today.
- ✅ **`/api/payroll` left unmapped — confirmed intentional.** Accountants
  are meant to be able to generate/edit payroll, not just view it. The
  `human_resource: VIEW` comment on `ACCOUNTANT` was about read-only access
  to `/api/staff` records, not payroll (payroll isn't mapped to
  `human_resource` at all) — comment reworded to stop implying otherwise.

## P2 — Feature gaps (works, but thinner than Smart School)

- ✅ **Custom fields** — fixed 2026-07-22 for students (definitions stored,
  values now captured in the Add form's "Other" tab and shown/editable on the
  profile page via `CustomFieldsCard`). Staff custom fields still need the
  same treatment.
- ✅ **Promotion** — built (`438aa17`): per-student pass/fail, continue/leave,
  auto-alumni on leave. `app/api/students/promote/route.ts` +
  `PromoteClient.tsx`. (Doc was stale — this was already done.)
- ❎ **"Student Transfer module missing" — not a real gap.** Checked the PHP
  reference source: the controller literally named `Stdtransfer.php`
  (`application/controllers/admin/Stdtransfer.php`) only has `index()` +
  `promote()` — it IS Promotion, already built above ("Mirrors Smart School's
  Stdtransfer" is even in the route's own comment). No separate transfer-to-
  another-school model/controller exists anywhere in the source
  (`transfercertificate.php` is just one certificate print template, not a
  distinct workflow). This entry was a phantom gap from the original
  2026-06-21 pass.
- ✅ **Subjects/Classes/Sections** — fixed 2026-07-22: added PATCH (rename)
  + DELETE (soft, `isActive: false`) for all three, wired into
  `SettingsClient.tsx`. Listing queries now filter `isActive` so a deleted
  entity actually disappears.
- ✅ **Operations modules — claim was backwards, now fixed.**
  Vehicles, Routes, Hostel Rooms/Hostels, and Inventory Items all already
  had full PATCH/DELETE APIs — the actual gap was 100% in the UI (no edit
  icon, no delete button anywhere). Fixed for all five: edit dialog +
  delete wired into Vehicles, Routes, Hostels, Hostel Rooms, and Inventory
  Items. DELETE on every one of them was a hard delete despite each model
  already having `isActive` — would throw on any live record still
  referenced (Route↔StudentRoute, HostelRoom↔HostelAllocation, Hostel's
  cascade onto its rooms, Item↔StockMovement/ItemIssue) — switched all to
  soft-delete, matching the app-wide convention, and added `isActive`
  filters to every listing query so a deleted record actually disappears.
  ✅ **Pickup points** done too — also found and fixed a real bug: PATCH
  referenced a `location` field that never existed on the model (would
  have thrown if ever called with it); real fields are name/latitude/
  longitude/isActive. Added lat/long to create + a new edit dialog
  (closing "pickup lat/long dropped from forms"), switched DELETE to
  soft-delete. `costPerBed` was already in the room API, now also in its
  edit dialog — no `floor` field exists anywhere in the schema, so that
  part of the original claim never applied. Only **vehicle photo** is
  still genuinely dropped from its form. Operations "working API, no UI"
  cluster is now fully closed.
- ✅ **Library** — all three fixed 2026-07-22. Membership: `/api/library/
  issues` POST now requires an active `LibraryMember` (mirrors Smart
  School — issuing is done FROM a member's page), and the Issue Book
  form's pickers are filtered to actual members. Duplicate return logic:
  deleted `lib/services/library.ts` (`returnBook`, plus dead
  `listBooks`/`addBook`/`issueBook`) and the unused `.../return` route —
  zero real callers, the UI only ever used the inline `PATCH .../[id]`
  path. Hard-delete: `Book` DELETE now soft-deletes (`isActive: false`)
  instead of throwing on any `BookIssue` history row.
- **Fees**: fine/late-fee at collection is a **won't-fix** — schools do not
  charge late fees, so `FeeGroupItem.fineType/finePercentage/fineAmount/
  finePerDay` and `CumulativeFine` staying uncomputed at collection is
  intentional, not a gap.
  ✅ **Fee reminders** — fixed 2026-07-22. The claim had it backwards: the
  cron and send logic already worked; the actual gap was no UI to ever
  create a `FeeReminder` row, so the cron ran daily against an empty
  table. Added `/fees/reminders` (add/pause/activate/delete rules).
  Still real: one report only (no daily/class-wise/CSV); gateway keys
  DB-only; Flutterwave currency hard-coded `GHS`.
- **Exams** — re-verified 2026-07-22, most of this was already wrong: ✅ CSV
  mark import (`MarkEntryClient.tsx`, adm-no matched, sample-CSV download),
  ✅ rank override (`app/api/exams/results/[examGroupId]/rank`), ✅ result
  PDF (`.../pdf`, `@react-pdf/renderer`), ✅ result email+SMS+WhatsApp
  (`lib/services/exams.ts`). ✅ **Teacher subject-scoping** — fixed
  2026-07-22: a `TeacherSubject` table already existed (staff↔subject
  assignment, admin-managed) but nothing checked it — any TEACHER could
  view/enter marks for any subject via `/api/exams/schedules/[id]/marks`.
  Now enforced server-side (403 if the schedule's subject isn't theirs) and
  reflected in the UI — the exam-group detail page disables "Marks" for
  subjects the signed-in teacher isn't assigned to.
  ❎ **"Grades & Marks-Division API-only" — also wrong.** `/settings/grading`
  (`GradingClient.tsx`) already has full CRUD for both Grade Ranges and Mark
  Divisions, wired to `/api/grade-ranges` and `/api/mark-divisions`
  (both have working `[id]` PATCH/DELETE routes too). Still real: no single
  "all subjects at once" mark-entry grid (entry is one exam-schedule/subject
  at a time via `/exams/[id]/marks/[scheduleId]`).
- **Subject-wise Attendance** API-only; broadcast Notification backend has no
  UI; Notification Settings decorative.
- ✅ **Reports** — mostly wrong, fixed 2026-07-22. "No PDF export" was
  false: `/api/reports/pdf` (generic flat-rows → PDF via
  `@react-pdf/renderer`) already existed and was wired into all 8
  existing report tabs' PDF buttons. Added the 3 genuinely missing types
  found by checking the reference source — **Finance** (income/expense,
  matches `Financereports::income/expense`), **Payroll** (matches
  `Financereports::payroll`), **Inventory** (matches
  `Report::inventory/inventorystock`) — all reuse existing data
  (Transaction/StaffPayslip/Item), no schema change. "No hostel reports"
  was a phantom gap — no such report exists in Smart School either, so
  nothing built for it.
- ✅ **Homework grading/submission** — fixed 2026-07-22. Grading already
  worked (`HomeworkClient.tsx` Evaluate modal). Submission was fully broken
  (`lib/services/homework.ts` referenced fields that didn't exist on the
  schema; the one caller would have thrown; no UI called it anyway) — student
  self-service ("Mark done" / "Attach & submit", via `/api/upload`) is now
  real, and teachers see each submission link in the Evaluate modal.
- **Syllabus**/**Content Share** still API-only.

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
