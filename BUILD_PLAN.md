# School Management System — Build Plan
**Reference:** Smart School v7.1.0 (source at `~/Downloads/smart-school-school-7.1.0 (1)/`)
**Stack:** Next.js 16 (App Router) · TypeScript · Prisma · PostgreSQL (Neon) · Tailwind · shadcn/ui
**Live URL:** https://school-ms-kappa.vercel.app
**Repo:** https://github.com/Amoahalexkofi/school-ms
**Last updated:** 2026-06-04

---

## Guiding Principle
We are building an **exact replica of Smart School v7.1.0** in a modern Next.js/Prisma stack.
Before implementing any feature, read the corresponding PHP model in:
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

### File Conventions
- `/app/(dashboard)/[module]/page.tsx` — server component that fetches and passes data
- `/app/(dashboard)/[module]/[Module]Client.tsx` — client component for forms/interactivity
- `/app/api/[module]/route.ts` — API route
- `/lib/services/[module].ts` — business logic
- `/lib/auth/middleware-utils.ts` — add new routes to `ROUTE_PERMISSIONS` when adding pages

### Deployment
- Vercel is NOT connected to GitHub auto-deploy. Always run `vercel --prod` manually after pushing.
- After every schema change, run `npx prisma db push` before deploying.
- Seed with: `DATABASE_URL="..." npx tsx prisma/seed.ts`

---

## Current Credentials (dev/test)
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@school.edu | Admin@1234 |
| Teacher | teacher@school.edu | Teacher@1234 |
| Student | student@school.edu | Student@1234 |

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
- [ ] **TODO:** Settings UI needs updating for new ClassSection structure (currently shows old Class+sessionId pattern)
- [ ] **TODO:** Add SubjectGroup management to Settings

---

### 🔄 Phase 2 — Students Module (IN PROGRESS)
**Smart School reference:** `Student_model.php`, `Studentsession_model.php`

- [x] Student list page — shows students with their current class/section/session
- [x] Add student form — all 50+ fields (Basic, Guardian, Address, Academic, Other tabs)
- [x] Student enrollment form — session + classSection + rollNo (within Add form)
- [x] Student profile page — rebuilt for new schema (admissionNo, sessions, feesMasters, attendanceType.keyValue, isPassing)
- [x] Edit student — dialog in profile page, PATCH `/api/students/[id]`
- [x] Disable student (with reason) — dialog in profile page, sets `isActive=false, disableReason, disabledAt`
- [x] Re-enable student — one-click in profile page
- [x] Enrollment history table — shown when student has multiple sessions
- [x] Guardian info section — shown when father/mother/guardian data exists
- [x] API: GET/POST/PATCH/DELETE `/api/students`, `/api/students/[id]`
- [ ] Promote students — move to next class for new session
- [ ] Student ID card view (printable)

---

### ✅ Phase 3 — Staff Module (COMPLETE)
**Smart School reference:** `Staff_model.php`, `Staffroles_model.php`

- [x] Staff list page — search + department filter (StaffClient.tsx)
- [x] Add staff form — 40+ fields across 5 tabs (Personal, Employment, Contact, Financial, Social)
- [x] Auto-generated employeeId (EMP0001, EMP0002…) if not provided
- [x] Staff profile page — all fields: personal, employment/finance, contact, subjects taught, class teacher of, social links, payslips
- [x] Edit staff dialog — full field edit + role change (PATCH /api/staff/[id])
- [x] Disable / Re-enable staff (sets isActive + disabledAt)
- [x] Department management page — CRUD with staff count (`/departments`)
- [x] Designation management page — CRUD with staff count (`/designations`)
- [x] API: GET/POST `/api/staff`, GET/PATCH/DELETE `/api/staff/[id]`
- [x] API: POST/PATCH/DELETE `/api/departments`, `/api/departments/[id]`
- [x] API: POST/PATCH/DELETE `/api/designations`, `/api/designations/[id]`
- [x] Routes added to middleware-utils.ts
- [ ] Teacher subject assignment UI (currently stored in schema, no management page yet)
- [ ] Staff ID card view (printable)

---

### ⬜ Phase 4 — Attendance Module (TODO)
**Smart School reference:** `Stuattendence_model.php`, `Staffattendancemodel.php`

- [ ] Student attendance marking page:
  - Select: session, class, section → resolves classSectionId
  - Select: date
  - List all students in that classSection for that session
  - Mark each with AttendanceType (P/A/L/H/F) + optional remark
  - Bulk "Mark All Present" button
  - Save (creates AttendanceDay + StudentAttendance records)
- [ ] Student attendance report (per student, date range)
- [ ] Class-wise attendance report
- [ ] Staff attendance marking page
- [ ] Staff attendance report
- [ ] Attendance settings (schedule time windows per class)
- [ ] API: POST `/api/attendance` (updated), GET `/api/attendance/report`

---

### ⬜ Phase 5 — Fees Module (TODO — complete rebuild)
**Smart School reference:** `Studentfeemaster_model.php`, `Feetype_model.php`, `Feegroup_model.php`

This is the most complex module. Build in this exact order:

**5a. Fee Setup (admin)**
- [ ] Fee Categories page — CRUD (`/fees/categories`)
- [ ] Fee Types page — CRUD, linked to category (`/fees/types`)
- [ ] Fee Groups page — CRUD (`/fees/groups`)
- [ ] Fee Session Groups — link fee group to a session
- [ ] Fee Group Items — add fee types to a session group with amount + fine rules
  - Fine types: NONE, PERCENTAGE, AMOUNT, per-day
  - Due date per item
- [ ] Fee Master — class-level fee templates

**5b. Student Fee Assignment**
- [ ] Assign fee group to a class (bulk) — creates `StudentFeesMaster` for all students in class
- [ ] Assign fee group to individual student
- [ ] View assigned fees per student

**5c. Fee Collection**
- [ ] Fee collection page — search by student, show all due fees with fine calculation
- [ ] Record payment — updates `FeeDeposit.amountDetail` JSON
- [ ] Partial payment support
- [ ] Apply discount to invoice
- [ ] Print receipt

**5d. Fee Reports**
- [ ] Fee collection report (date range, class, status)
- [ ] Due fee report (defaulters list)
- [ ] Fee statement per student (full history)

**5e. Fee Carry Forward**
- [ ] Carry forward page — select class/section, shows previous session balance per student
- [ ] Run carry forward — creates system `StudentFeesMaster` records with `isSystem=true`
- [ ] Due days setting (from `SchoolProfile.feeDueDays`)

**5f. Discounts**
- [ ] Fee Discounts page — define discount types (%, fixed, with limit/expiry)
- [ ] Assign discount to student
- [ ] Apply at payment time

---

### ⬜ Phase 6 — Exams & Marks (TODO)
**Smart School reference:** `Examgroup_model.php`, `Examschedule_model.php`, `Mark_model.php`

- [ ] Exam Groups page — CRUD (Term 1, Midterm, Finals, etc.)
- [ ] Exam Schedule page — add subjects to exam group with date/time/marks
- [ ] Publish exam group
- [ ] Mark Entry page — teacher selects exam schedule, enters marks per student
  - Show: student name, full marks, passing marks
  - Enter: marks obtained (or mark absent)
  - Auto-calculate: grade, pass/fail
- [ ] Results page — per exam group, shows all student results with rank
- [ ] Rank generation
- [ ] Admit card generation (printable)
- [ ] Marksheet/Report card (printable)
- [ ] Grade setup page (configure grade ranges)
- [ ] Mark Division setup page

---

### ⬜ Phase 7 — Payroll (TODO)
**Smart School reference:** `Payroll_model.php`

- [ ] Payroll list page — shows payslips by month/year
- [ ] Generate payslip for staff member:
  - Basic salary (from staff record)
  - Add allowances (HRA, DA, Bonus, etc.) — configurable line items
  - Add deductions (Tax, PF, etc.) — configurable line items
  - Leave deduction integration
  - Calculate net salary
- [ ] Approve payslip
- [ ] Mark as paid (with payment mode + date)
- [ ] Payslip print view
- [ ] Bulk payroll for all staff in a month
- [ ] API: `/api/payroll`, `/api/payroll/[id]`

---

### ⬜ Phase 8 — Leave Management (TODO)
**Smart School reference:** `Leaverequest_model.php`, `Leavetypes_model.php`

- [ ] Leave Types page — CRUD (Casual, Sick, Earned, etc. with days allowed)
- [ ] Staff leave request form
- [ ] Staff leave list (pending, approved, rejected)
- [ ] Approve/reject leave (admin/principal)
- [ ] Leave balance tracker per staff per type
- [ ] Student leave request form
- [ ] Student leave approval
- [ ] Leave calendar view
- [ ] API routes for all operations

---

### ⬜ Phase 9 — Transport (TODO)
**Smart School reference:** `Vehicle_model.php`, `Route_model.php`, `Routepickuppoint_model.php`

- [ ] Vehicles page — add/edit vehicle (vehicleNo, model, year, driver details)
- [ ] Routes page — add routes, assign vehicle
- [ ] Pickup Points — independent master list
- [ ] Route Pickup Points — add points to route with timing + fee
- [ ] Assign student to route + pickup point
- [ ] Transport fee auto-fill on student enrollment
- [ ] Route-wise student list report

---

### ⬜ Phase 10 — Hostel (TODO)
**Smart School reference:** `Hostel_model.php`, `Hostelroom_model.php`

- [ ] Room Types page — CRUD (Single, Double, 4-Bed, Dormitory)
- [ ] Hostels page — add hostels
- [ ] Rooms page — add rooms to hostel (with roomType, capacity)
- [ ] Allocate student to room
- [ ] Hostel occupancy report

---

### ⬜ Phase 11 — Library (TODO)
**Smart School reference:** `Book_model.php`, `Bookissue_model.php`

- [ ] Book catalog — full fields (title, bookNo, isbn, subject, rackNo, publisher, author, qty, cost)
- [ ] Add/edit book
- [ ] Issue book (to student or staff, with due date)
- [ ] Return book (calculate fine: ₵0.50/day overdue)
- [ ] Library member management
- [ ] Issue log report

---

### ⬜ Phase 12 — Inventory (TODO)
**Smart School reference:** `Item_model.php`, `Itemstock_model.php`

- [ ] Item Categories, Suppliers, Stores management
- [ ] Item catalog
- [ ] Stock In / Stock Out
- [ ] Issue to staff/student
- [ ] Low stock alerts
- [ ] Stock report

---

### ⬜ Phase 13 — Front Office (TODO)
**Smart School reference:** `Visitors_model.php`, `Complaint_Model.php`, `Enquiry_model.php`

- [ ] Visitor Purposes management
- [ ] Visitor log (with purpose dropdown, host, ID proof, numVisitors)
- [ ] Visitor checkout + report
- [ ] Complaint Types management
- [ ] Complaints (with type, status flow)
- [ ] Enquiries (for prospective admissions, with follow-up)
- [ ] Dispatch log (incoming/outgoing correspondence)

---

### ⬜ Phase 14 — Communication (TODO)
**Smart School reference:** `Messages_model.php`, `Notification_model.php`

- [ ] Notice Board (post notices with audience targeting) — partially done
- [ ] Bulk messaging (SMS/Email/In-App) — partially done
- [ ] Notification bell (real-time or polling) — partially done
- [ ] Internal chat — done (polling-based)
- [ ] SMS gateway configuration (Africa's Talking / Twilio)
- [ ] Email configuration (SMTP/SendGrid)

---

### ⬜ Phase 15 — Online Exams (TODO)
**Smart School reference:** `Onlineexam_model.php`, `Question_model.php`

- [ ] Question bank — add questions (MCQ, True/False, Short Answer, Descriptive)
  - Fields: questionType, level (Easy/Medium/Hard), question, optA-E, correctAnswer
- [ ] Online exam creation — title, class, subject, duration, passing%, start/end time
- [ ] Add questions from bank to exam
- [ ] Publish exam
- [ ] Student takes exam (timer, auto-submit)
- [ ] Auto-grade MCQ, manual grade descriptive
- [ ] Results per student

---

### ⬜ Phase 16 — Reports (TODO)
**Smart School reference:** `Financereports.php`, `Marksheet_model.php`

- [ ] Student list report (filter by class/section/session)
- [ ] Attendance report (student-wise, class-wise, date range)
- [ ] Staff attendance report
- [ ] Fee collection report (date range, class, status)
- [ ] Due fee report
- [ ] Financial summary (income vs expense)
- [ ] Exam results report
- [ ] Mark sheet PDF per student
- [ ] Transport route list
- [ ] Library issue log
- All reports: screen view + print + CSV export

---

### ⬜ Phase 17 — System Administration (TODO)
**Smart School reference:** `Role_model.php`, `Customfield_model.php`, `Setting_model.php`

- [ ] Custom Fields — admin adds extra fields to student/staff profiles
- [ ] School Profile settings (name, logo, currency, dateFormat, feeDueDays)
- [ ] Audit Log page — searchable activity log
- [ ] Roles & Permissions page
- [ ] Sidebar menu management (show/hide per role)

---

### ⬜ Phase 18 — Alumni (TODO)
**Smart School reference:** `Alumni_model.php`

- [ ] When student's `isAlumni=true` (from promotion), create Alumni record
- [ ] Alumni list page
- [ ] Alumni profile (current contact, occupation)

---

### ⬜ Phase 19 — Polish & Deploy (TODO)
- [ ] Mobile responsiveness audit
- [ ] Loading states on all forms
- [ ] Error boundaries
- [ ] Print stylesheets for ID cards, mark sheets, receipts
- [ ] Connect domain (novalss.com → Vercel)
- [ ] Performance optimisation

---

## How to Continue in a New Chat

When starting a new Claude Code session, say:

> "Read BUILD_PLAN.md and continue from where we left off."

Claude Code will:
1. Read this file to understand the full scope and current phase
2. Check git log to see the latest commits
3. Read the relevant Smart School PHP models before implementing anything
4. Continue building the next incomplete phase

**Key files to read on session start:**
- `BUILD_PLAN.md` (this file) — build tracker
- `PRD_SchoolManagementSystem.md` — full product requirements
- `prisma/schema.prisma` — current data model
- `lib/auth/middleware-utils.ts` — route permissions

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
