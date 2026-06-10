# School Management System — Build Plan
**Reference:** Smart School v7.1.0 (source at `~/Downloads/smart-school-school-7.1.0 (1)/`)
**Stack:** Next.js 16 (App Router) · TypeScript · Prisma · PostgreSQL (Neon) · Tailwind · shadcn/ui
**Live URL:** https://school-ms-kappa.vercel.app
**Repo:** https://github.com/Amoahalexkofi/school-ms
**Last updated:** 2026-06-05

---

## What We Are Building

Two things in one codebase:

1. **School Management System** — exact replica of Smart School v7.1.0, covering all academic, financial, HR and operations modules.
2. **Novalss SaaS Platform** — multi-tenant hosting layer. Each school gets their own isolated Postgres schema. Novalss Admin (`/novalss-admin`) provisions and manages schools. Schools self-register at `/register`.

---

## Guiding Principle
Before implementing any school feature, read the corresponding PHP model in:
`~/Downloads/smart-school-school-7.1.0 (1)/smart_school_src/application/models/`

---

## Architecture Decisions (read before coding)

### Schema
- **Class** and **Section** are **independent masters** — not session-scoped. Reused across sessions.
- **ClassSection** is a junction table linking Class + Section. Has a `teacherId` (class teacher).
- **StudentSession** is the enrollment record: `Student → AcademicSession → ClassSection`.
- **Fees** follow Smart School's chain: `FeeCategory → FeeType → FeeGroup → FeeSessionGroup → FeeGroupItem → StudentFeesMaster → FeeDeposit`
  - `FeeDeposit.amountDetail` is a **JSON field** storing payment sub-records
  - `isSystem = true` on `StudentFeesMaster` means a carry-forward balance record
- **Attendance** uses `AttendanceType` with keyValues: P=Present, A=Absent, L=Late, H=Holiday, F=Half Day
- **Payroll** has two models: `StaffPayslip` (individual, with `PayslipAllowance` line items) and `Payroll`/`PayrollEntry` (bulk)
- All pages use `(prisma as any)` for Prisma calls (avoids type churn during rapid iteration)

### Multi-Tenant SaaS Architecture
- `lib/registry.ts` — Prisma client always connected to `public` schema, used for `SchoolTenant` CRUD
- `lib/provisioning.ts` — creates a new Postgres schema per school, copies table structure, seeds admin user
- `lib/prisma.ts` — reads `DATABASE_SCHEMA` env var; sets `search_path` so all queries hit the school's schema
- `app/(novalss-admin)/` — fully isolated route group (no school auth); uses cookie-based admin key auth
- `app/api/admin/` — school provisioning API (POST creates schema + seeds), PATCH updates status/plan
- **TODO:** Per-request tenant routing — subdomain → schema lookup so one deployment serves all schools

### File Conventions
- `/app/(dashboard)/[module]/page.tsx` — server component that fetches and passes data
- `/app/(dashboard)/[module]/[Module]Client.tsx` — client component for forms/interactivity
- `/app/api/[module]/route.ts` — API route
- `/lib/services/[module].ts` — business logic
- `/lib/auth/middleware-utils.ts` — add new routes to `PUBLIC_PREFIXES` or `ROUTE_PERMISSIONS`

### Deployment
- Vercel is NOT connected to GitHub auto-deploy. Always run `vercel --prod` manually after `git push`.
- After every schema change, run `npx prisma db push` before deploying.
- Seed with: `DATABASE_URL="..." npx tsx prisma/seed.ts`

---

## Current Credentials (dev/test)
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@school.edu | Admin@1234 |
| Teacher | teacher@school.edu | Teacher@1234 |
| Student | student@school.edu | Student@1234 |
| Novalss Admin | — | key: `novalss-5d80bc6a1d4118dbd0ef00a3` (from `.env`) |

---

## Phase Tracker

### ✅ Phase 0 — Foundation (COMPLETE)
- [x] Next.js project setup, Tailwind, shadcn/ui
- [x] NextAuth v5 authentication (email/password, JWT, roles)
- [x] Prisma schema — full Smart School replica (60+ models)
- [x] Database reset and seeded (Neon PostgreSQL)
- [x] Sidebar navigation component
- [x] Topbar component
- [x] Auth middleware (`lib/auth/middleware-utils.ts`)
- [x] Dashboard page with stats

---

### ✅ Phase 1 — Academic Structure (COMPLETE)
- [x] Settings page: Academic Sessions, Classes, Sections, Subjects
- [x] Settings forms: Create session, class, section, subject
- [x] ClassSection junction created in seed
- [x] SubjectGroup model in schema
- [x] AttendanceType seeded (P/A/L/H/F)
- [x] StaffAttendanceType seeded
- [x] LeaveType seeded
- [x] MarkDivision seeded
- [x] GradingScale seeded
- [x] SchoolHouse seeded
- [x] Departments & Designations seeded
- [ ] Settings UI needs updating for new ClassSection structure
- [ ] SubjectGroup management UI

---

### ✅ Phase 2 — Students Module (COMPLETE)
**Smart School reference:** `Student_model.php`, `Studentsession_model.php`

- [x] Student list page — search + current class/section/session
- [x] Add student form — 50+ fields across 5 tabs (Basic, Guardian, Address, Academic, Other)
- [x] Student enrollment form — session + classSection + rollNo
- [x] Student profile page — admissionNo, sessions, feesMasters, attendance, isPassing
- [x] Edit student dialog — PATCH `/api/students/[id]`
- [x] Disable student (with reason) — `isActive=false, disableReason, disabledAt`
- [x] Re-enable student
- [x] Enrollment history table
- [x] Guardian info section
- [x] API: GET/POST/PATCH/DELETE `/api/students`, `/api/students/[id]`
- [ ] Promote students — move to next class for new session
- [ ] Student ID card (printable)

---

### ✅ Phase 3 — Staff Module (COMPLETE)
**Smart School reference:** `Staff_model.php`, `Staffroles_model.php`

- [x] Staff list page — search + department filter
- [x] Add staff form — 40+ fields across 5 tabs
- [x] Auto-generated employeeId (EMP0001…)
- [x] Staff profile page — personal, employment, contact, subjects, payslips, social links
- [x] Edit staff dialog — full field edit + role change
- [x] Disable / Re-enable staff
- [x] Department management page — CRUD with staff count
- [x] Designation management page — CRUD with staff count
- [x] API: GET/POST `/api/staff`, GET/PATCH/DELETE `/api/staff/[id]`
- [x] API: CRUD `/api/departments`, `/api/designations`
- [ ] Teacher subject assignment UI
- [ ] Staff ID card (printable)

---

### ✅ Phase 4 — Attendance Module (COMPLETE)
**Smart School reference:** `Stuattendence_model.php`, `Staffattendancemodel.php`

- [x] Student attendance marking — session/class/date filter, mark P/A/L/H/F per student + remark
- [x] Bulk "Mark all" buttons per attendance type
- [x] Pre-fills existing marks for that day
- [x] Creates/upserts AttendanceDay + StudentAttendance records
- [x] Student attendance report — date range, per-student P/A/L/H/F counts + % (≥75% highlight)
- [x] Staff attendance marking — department/date filter, mark P/A/L/H/F/Leave
- [x] Staff attendance upsert API
- [x] API: GET/POST `/api/attendance`, `/api/attendance/staff`, `/api/attendance/report`

---

### ✅ Phase 5 — Fees Module (COMPLETE)
**Smart School reference:** `Studentfeemaster_model.php`, `Feetype_model.php`, `Feegroup_model.php`

- [x] Fee Hub page — search students, stats (total students, fee masters, collected)
- [x] Fee Setup page — CRUD for Categories, Types, Groups, Session Groups, Group Items (`/fees/setup`)
  - Fine types: NONE, PERCENTAGE, AMOUNT, per-day; due date per item
- [x] Fee Assignment page — assign fee group to class/section (bulk) or individual student (`/fees/assign`)
- [x] Fee Collection page — per-student, shows all due fees + fine calculation, record payment (`/fees/collect/[studentId]`)
- [x] Fee Session Group detail — view/manage items in a session group (`/fees/groups/[id]`)
- [x] Fee Report — date range + session filter, total collected + per-student breakdown (`/fees/report`)
- [x] API: CRUD `/api/fees/{categories,types,groups,session-groups,items,assign,collect,payments,invoices,student,report}`
- [x] Fee Carry Forward — carry previous session balance as `isSystem=true` StudentFeesMaster records
- [x] Fee Discounts — define discount types (`/fees/setup` Discounts tab), assign to students (`/fees/discounts`), apply at payment (`/api/fees/collect` with `discountIds[]`)
- [x] Print receipt — `/fees/receipt/[depositId]/[subInvoiceId]` with auto-print

---

### ✅ Phase 6 — Exams & Marks (COMPLETE)
**Smart School reference:** `Examgroup_model.php`, `Examschedule_model.php`, `Mark_model.php`

- [x] Exam Groups list page — CRUD, publish toggle (`/exam-groups`)
- [x] New Exam Group form
- [x] Exam Group detail — add subjects as exam schedules with date/time/full marks/passing marks
- [x] Mark Entry page — teacher selects schedule, enters marks per student, auto grade/pass-fail (`/exams/[id]/marks/[scheduleId]`)
- [x] Exam Results page — per exam group, ranked student results (`/exams/results/[examGroupId]`)
- [x] Exams list — filter + link to results/marks
- [x] Admit Card — generate printable admit cards per exam group + class (`/exams/admit-card`)
- [x] Marksheet/Report Card — printable per student (`/exams/marksheet`)
- [x] API: GET/POST `/api/exams`, GET/PATCH/DELETE `/api/exams/[id]`, `/api/exams/schedules`, `/api/exams/results`

---

### ✅ Phase 7 — Payroll (COMPLETE)
**Smart School reference:** `Payroll_model.php`

- [x] Payroll list page — shows payslips by month/year, filter by staff/status
- [x] Generate payslip — basic salary, allowances (HRA/DA/Bonus), deductions (Tax/PF), net salary
- [x] Payslip detail page — full breakdown with allowance/deduction line items (`/payroll/[payslipId]`)
- [x] Approve payslip
- [x] Mark as paid (payment mode + date)
- [x] Payslip print view
- [x] API: GET/POST `/api/payroll`, GET/PATCH/DELETE `/api/payroll/[id]`
- [ ] Bulk payroll generation for all staff in a month

---

### ✅ Phase 8 — Leave Management (COMPLETE)
**Smart School reference:** `Leaverequest_model.php`, `Leavetypes_model.php`

- [x] Leave list page — filter by type/status, approve/reject inline
- [x] Staff leave request form — leave type, from/to date, reason (`/leave/new`)
- [x] Approve/reject leave (admin)
- [x] Leave balance tracker per staff per type
- [x] Student leave request + approval
- [x] API: GET/POST `/api/leave/staff`, `/api/leave/students`, CRUD `/api/leave/types`

---

### ✅ Phase 9 — Transport (COMPLETE)
**Smart School reference:** `Vehicle_model.php`, `Route_model.php`, `Routepickuppoint_model.php`

- [x] Transport hub page — stats + quick links
- [x] Vehicles page — add/edit vehicle (vehicleNo, model, year, driver details)
- [x] Routes page — add routes, assign vehicle
- [x] Add vehicle form, add route form
- [x] API: CRUD `/api/transport/{vehicles,routes,pickup-points,assign}`
- [x] Pickup Points management UI — "Pickup Points" tab in `/transport`
- [x] Route Pickup Points — expandable stops on each route (timing + fee) in Routes tab
- [x] Assign student to route + pickup point — "Assignments" tab in `/transport`

---

### ✅ Phase 10 — Hostel (COMPLETE)
**Smart School reference:** `Hostel_model.php`, `Hostelroom_model.php`

- [x] Hostel hub page — stats + list
- [x] Add Hostel form — name, type, capacity, warden, address, description
- [x] Room Types, Hostels, Rooms management
- [x] Allocate student to room
- [x] API: CRUD `/api/hostel/{hostels,rooms,room-types,allocate}`

---

### ✅ Phase 11 — Library (COMPLETE)
**Smart School reference:** `Book_model.php`, `Bookissue_model.php`

- [x] Library hub page — stats + search
- [x] Book catalog — add book (title, bookNo, isbn, subject, rackNo, publisher, author, qty, cost)
- [x] Issue book form — to student or staff, with due date
- [x] Return book — calculate fine (overdue days × rate)
- [x] API: CRUD `/api/library/{books,issues}`
- [ ] Library member management
- [ ] Issue log report (separate from main reports page)

---

### ✅ Phase 12 — Inventory (COMPLETE)
**Smart School reference:** `Item_model.php`, `Itemstock_model.php`

- [x] Inventory hub page — categories + stock overview
- [x] Item catalog — add item (name, category, supplier, store, unit, reorderLevel)
- [x] Add Item form
- [x] Stock In / Stock Out
- [x] API: CRUD `/api/inventory/{categories,items,stock}`
- [x] Issue to staff — Issues tab in `/inventory`, form to issue item to staff member, tracks return date + status
- [x] Low stock alerts — amber banner on inventory page when item.quantity ≤ item.lowStockAlert

---

### ✅ Phase 13 — Front Office (COMPLETE)
**Smart School reference:** `Visitors_model.php`, `Complaint_Model.php`, `Enquiry_model.php`

- [x] Front Office hub — visitor log, complaints, enquiries tabs
- [x] Visitor log — add visitor (purpose, host, ID proof, numVisitors, in/out time)
- [x] Add Visitor form
- [x] Complaint Types management
- [x] Complaints — add complaint (type, source, description, status flow)
- [x] Add Complaint form
- [x] Enquiries — prospective admission inquiries with follow-up date
- [x] Add Enquiry form
- [x] API: CRUD `/api/front-office/{visitors,complaints,complaint-types,enquiries,dispatch}`
- [x] Dispatch log — incoming/outgoing correspondence tab in `/front-office`, API at `/api/front-office/dispatch`
- [x] Visitor checkout — "Check Out" button in Visitors tab sets outTime

---

### 🔄 Phase 14 — Communication (PARTIAL)
**Smart School reference:** `Messages_model.php`, `Notification_model.php`

- [x] Homework — assign homework per class/subject, view list (`/homework`)
- [x] Timetable — class timetable grid view + edit (`/timetable`)
- [x] Internal chat — polling-based real-time chat (`/chat`)
- [x] Notice Board — post + view notices (`/notice-board`) — basic implementation
- [x] Lesson Plans (`/lesson-plans`) — basic implementation
- [x] Bulk messaging — UI at `/messaging`, API at `/api/messaging` (schedule, group/class/individual targeting)
- [x] Notification bell — polling on load in Topbar, mark read/all-read, badge count
- [ ] SMS gateway integration — actual send via Africa's Talking / Twilio (config exists, send not wired)
- [ ] Email gateway integration — actual send via SMTP/SendGrid (config exists, send not wired)

---

### ✅ Phase 15 — Online Exams (COMPLETE)
**Smart School reference:** `Onlineexam_model.php`, `Question_model.php`

- [x] Question bank — MCQ, True/False, Short Answer, Descriptive; Easy/Medium/Hard levels
- [x] Online exam creation — title, class, subject, duration, passing%, start/end time
- [x] Add questions from bank to exam (live picker with search/filter)
- [x] Publish/unpublish exam
- [x] Student takes exam — timer, question navigator, auto-submit on timeout
- [x] Auto-grade MCQ/True-False; text answers flagged for manual grading
- [x] Results per student (score, %, pass/fail)
- [x] API: GET/POST `/api/questions`, `/api/online-exams`, `/api/online-exams/[id]`, `/api/online-exams/[id]/questions`, `/api/online-exams/[id]/attempt`

---

### ✅ Phase 16 — Reports (COMPLETE)
**Smart School reference:** `Financereports.php`, `Marksheet_model.php`

- [x] Student list report — session/class/section/gender/status filters
- [x] Attendance report — student-wise, date range, P/A/L/H/F counts + %
- [x] Staff attendance report — department + date range
- [x] Fee collection report — date range + session, total collected
- [x] Due fees report — defaulters list, total outstanding
- [x] Exam results report — exam group + class, ranked, per-subject marks
- [x] Transport route report — route-wise student list with vehicle + pickup
- [x] Library issue log — status + date range, overdue highlighting + fine
- [x] All reports: CSV export + Print
- [x] API: `/api/reports/{students,attendance,staff-attendance,fees,due-fees,exam-results,transport,library}`

---

### ✅ Phase 17 — System Administration (COMPLETE)
**Smart School reference:** `Role_model.php`, `Customfield_model.php`, `Setting_model.php`

- [x] School Profile settings — name, code, address, phone, email, website, motto, currency, dateFormat, feeDueDays
- [x] Custom Fields — CRUD for extra student/staff profile fields (Text, Number, Date, Select, Textarea)
- [x] Audit Log — search, filter by entity/action/user/date range, load-more, CSV export
- [x] Roles & Permissions — visual access matrix: 7 roles × 27 modules
- [ ] Sidebar menu management (skipped — hardcoded sidebar is sufficient)

---

### ✅ Phase 18 — Alumni (COMPLETE)
**Smart School reference:** `Alumni_model.php`

- [x] Alumni list page — search, filter by session/class, stats (total, this year, M/F)
- [x] Add alumni — select inactive student, set email/phone/occupation/address
- [x] Edit / Delete alumni record
- [x] Alumni profile page — contact info + full academic session history
- [x] Alumni Events page — CRUD with title, date range, target audience, showOnWebsite
- [x] API: CRUD `/api/alumni`, `/api/alumni/[id]`, `/api/alumni/events`, `/api/alumni/events/[id]`

---

### ✅ Phase 19 — Polish & Deploy (COMPLETE)
- [x] Mobile responsiveness — sm: breakpoints on stats cards, filter toolbars, form layouts
- [x] Loading skeletons — animated `loading.tsx` for all dashboard pages
- [x] Error boundaries — `error.tsx` (dashboard) + `global-error.tsx` (root)
- [x] Print stylesheet — globals.css: hides nav/buttons, formats tables, page-break utilities
- [x] Topbar — truncating title + responsive padding
- [ ] Connect domain (novalss.com → Vercel) — manual step via Vercel dashboard
- [ ] Performance optimisation — deferred

---

### ✅ Phase 20 — Novalss SaaS Platform (COMPLETE)

This is the multi-tenant hosting layer that wraps the school management system.

**20a. Infrastructure (COMPLETE)**
- [x] `SchoolTenant` model in `public` schema — id, name, subdomain, schemaName, plan, status, adminEmail, trialEndsAt
- [x] `lib/registry.ts` — Prisma client always connected to `public` schema
- [x] `lib/provisioning.ts` — creates Postgres schema, copies all table DDL from `public`, seeds admin User + Staff + SchoolProfile
- [x] `lib/prisma.ts` — reads `DATABASE_SCHEMA` env var, sets `search_path` so all queries hit the school's schema

**20b. Novalss Admin Dashboard (COMPLETE)**
- [x] Admin login — cookie-based key auth (`/novalss-admin/login`) — key from `NOVALSS_ADMIN_KEY` env var
- [x] Admin dashboard — school list with stats (total, active, trial, suspended) (`/novalss-admin`)
- [x] Provision new school form — name, subdomain, admin email/password, plan
- [x] Inline plan + status update per school
- [x] Delete school (with confirm)
- [x] API: GET/POST `/api/admin/schools`, PATCH/DELETE `/api/admin/schools/[id]`
- [x] API: POST `/api/admin/auth` — validates key, sets `novalss_admin_key` cookie
- [x] Routes excluded from school auth middleware (`/novalss-admin`, `/register`, `/api/admin`)

**20c. School Self-Registration (COMPLETE)**
- [x] Public registration page (`/register`) — school name, subdomain, admin credentials
- [x] Subdomain auto-suggested from school name
- [x] 3-step UX: form → provisioning → done with login link
- [x] Calls same `/api/admin/schools` POST endpoint

**20d. Tenant Routing (COMPLETE)**
- [x] Middleware: reads subdomain from `x-forwarded-host`/`host` → looks up `SchoolTenant.schemaName` → injects `x-tenant-schema` header per request (`proxy.ts`)
- [x] Per-request Prisma client factory (`lib/db.ts` `getDb()`) — reads `x-tenant-schema` header, caches clients per schema; all 24 service files + `lib/rbac.ts` migrated to use `getDb()`
- [x] Tenant-aware login: `lib/auth/config.ts` uses `getDb()` so NextAuth authenticates against the tenant's schema
- [x] 404 page for unknown subdomains (in `proxy.ts`)

---

## What's Left (Priority Order)

1. **Phase 14** — Bulk messaging + notification bell (messaging UI done; SMS/email gateway config TODO)
2. **Phase 5** — Fee Carry Forward + Discounts
3. **Phase 9** — Pickup Points UI + student assignment
4. **Phase 2** — Student promote + ID card
5. **Domain** — connect novalss.com to Vercel

---

## How to Continue in a New Chat

> "Read BUILD_PLAN.md and continue from where we left off."

Claude Code will:
1. Read this file to understand scope and status
2. Check `git log --oneline -5` to see last commits
3. Read relevant Smart School PHP models before implementing
4. Continue from "What's Left" above

**Key files to read on session start:**
- `BUILD_PLAN.md` (this file)
- `prisma/schema.prisma` — full data model
- `lib/auth/middleware-utils.ts` — route permissions
- `lib/prisma.ts` — multi-tenant DB client
- `lib/provisioning.ts` — school provisioning logic

---

## Smart School Model Reference

| Feature | PHP Model File |
|---------|---------------|
| Students | `Student_model.php`, `Studentsession_model.php` |
| Staff | `Staff_model.php` |
| Fees | `Studentfeemaster_model.php`, `Feetype_model.php`, `Feegroup_model.php` |
| Fee Carry Forward | `controllers/admin/Feesforward.php` |
| Attendance | `Stuattendence_model.php`, `Staffattendancemodel.php` |
| Exams | `Examgroup_model.php`, `Examschedule_model.php`, `Mark_model.php` |
| Payroll | `Payroll_model.php` |
| Leave | `Leaverequest_model.php`, `Leavetypes_model.php` |
| Transport | `Vehicle_model.php`, `Route_model.php`, `Routepickuppoint_model.php` |
| Library | `Book_model.php`, `Bookissue_model.php` |
| Inventory | `Item_model.php`, `Itemstock_model.php` |
| Front Office | `Visitors_model.php`, `Complaint_Model.php`, `Enquiry_model.php` |
| Online Exams | `Onlineexam_model.php`, `Question_model.php` |
| Reports | `Financereports.php`, `Marksheet_model.php` |
