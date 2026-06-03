# Technical Design Document
# School Management System (SMS)
**Version:** 1.0  
**Date:** 2026-06-03  
**Based on:** PRD_SchoolManagementSystem.md v1.0  

---

## 1. Overview

This document defines the technical design for building the School Management System described in the PRD. It covers system architecture, data models, API design, component structure, authentication, and implementation decisions for each module.

---

## 2. Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components, route handlers, proxy, single deployment |
| Language | TypeScript 5 | Type safety across client and server |
| Database | PostgreSQL (Neon serverless) | Relational integrity, JSON support, free tier for dev |
| ORM | Prisma 7 | Type-safe queries, migrations, schema-as-code |
| DB Driver | `@prisma/adapter-pg` | Prisma 7 requires driver adapter for direct connections |
| Auth | NextAuth v5 (credentials + JWT) | Session without DB round-trip on every request |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility-first, accessible component library |
| File Storage | Cloudflare R2 (or AWS S3) | Homework attachments, profile photos, PDFs |
| PDF | `@react-pdf/renderer` | Marksheets, receipts, ID cards — server-side rendering |
| Email | Resend | Transactional email (fee reminders, absence alerts) |
| SMS | Africa's Talking / Twilio | Bulk SMS to parents |
| Real-time | Server-Sent Events (polling fallback) | Notifications bell; upgrade to Pusher/Supabase if chat is needed |
| Background jobs | Inngest | Fee reminders, report generation, bulk email/SMS |
| Testing | Jest + React Testing Library | Unit, integration, component tests |
| Deployment | Vercel | Zero-config, edge network, env management |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser / PWA                        │
│          Next.js App Router (React Server Components)    │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                  Next.js Server                          │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │  proxy.ts  │  │  API Routes │  │  Server Actions  │  │
│  │ (JWT auth) │  │  /api/...   │  │  (form submits)  │  │
│  └────────────┘  └──────┬──────┘  └────────┬─────────┘  │
│                         │                  │             │
│  ┌──────────────────────▼──────────────────▼──────────┐  │
│  │               Service Layer (lib/services/)         │  │
│  │  students | attendance | marks | fees | homework   │  │
│  └──────────────────────┬───────────────────────────┘  │
│                          │                              │
│  ┌───────────────────────▼───────────────────────────┐  │
│  │          Domain Layer (lib/domain/)                │  │
│  │  grades | attendance | fees | timetable | session  │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ Prisma + pg adapter
┌──────────────────────▼──────────────────────────────────┐
│              Neon PostgreSQL (serverless)                 │
└─────────────────────────────────────────────────────────┘
                       │
         ┌─────────────┼────────────────┐
         ▼             ▼                ▼
    Cloudflare R2   Resend/Twilio    Inngest
    (file storage)  (email/SMS)    (background jobs)
```

### Layer Responsibilities

| Layer | Location | Responsibility |
|---|---|---|
| **Proxy** | `proxy.ts` | JWT auth check, role-based redirect — edge-safe, no DB |
| **Route Handlers** | `app/api/**/route.ts` | HTTP in/out, validation, error mapping to status codes |
| **Server Actions** | `app/**/actions.ts` | Form submissions from Server Components |
| **Services** | `lib/services/` | Orchestrate DB queries, call domain logic |
| **Domain** | `lib/domain/` | Pure business rules (no DB, no I/O) |
| **Prisma client** | `lib/prisma.ts` | Singleton with pg driver adapter |

---

## 4. Database Schema

### 4.1 Core Entities

```
User ──────────────┬─── Student
                   ├─── Staff
                   └─── Parent ───── Student (children)

AcademicSession ───┬─── Class ──── Section ──── StudentEnrollment ── Student
                   ├─── ExamGroup
                   ├─── FeeGroup
                   └─── AttendanceDay ── StudentAttendance

Class ─────────────── Subject ──── TeacherSubject ── Staff

Section ───────────┬─── TimetableSlot
                   ├─── AttendanceDay
                   └─── Homework

ExamGroup ─────────── ExamSchedule ──┬─── MarkEntry ── Student
                                     └─── Subject

FeeGroup ──────────── FeeGroupItem ── FeeType
FeeInvoice ────────┬─── FeePayment
(Student+FeeGroup) └─── FeeDiscount ── DiscountType

GradingScale ──────── GradeRange

Staff ─────────────── StaffAttendance

Notification ──────── User
Homework ──────────── HomeworkAcknowledgement ── Student
```

### 4.2 Multi-School Strategy

Use **shared database with `schoolId` scoping** for v1 (simpler to operate). Every top-level entity (`AcademicSession`, `Staff`, `Student`, etc.) carries a `schoolId` foreign key. Row-level security enforced in the service layer.

Add a `School` model:

```prisma
model School {
  id       String @id @default(cuid())
  name     String
  logo     String?
  timezone String @default("Africa/Accra")
  settings Json   @default("{}")

  sessions AcademicSession[]
  staff    Staff[]
  students Student[]
}
```

### 4.3 Key Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Admission numbers | `ADM-{YEAR}-{NNNN}` generated in service layer | Avoids DB sequence race conditions |
| Marks storage | `Decimal` not `Float` | Prevents floating-point rounding errors in totals |
| Attendance | One `AttendanceDay` row per section/date; one `StudentAttendance` row per student | Efficient bulk marking; supports late edits |
| Timetable | `startTime`/`endTime` as `String` ("08:00") | Simpler than storing full `DateTime` for repeating weekly schedules |
| Grading | Separate `GradingScale` model with `GradeRange[]` | Configurable per school, not hardcoded |
| Sessions | `isActive` boolean + enforce single active via service layer | Simple; multi-session switching is an admin action |

---

## 5. Authentication & Authorisation

### 5.1 Auth Flow

```
1. User visits any protected route
2. proxy.ts intercepts → calls getToken() (JWT decode, no DB)
3. No token → redirect /sign-in?callbackUrl=...
4. Has token → check canAccessRoute(pathname, role)
5. Unauthorised role → redirect /dashboard
6. Authorised → NextResponse.next()

Sign-in flow:
1. POST /api/auth/callback/credentials (NextAuth handler)
2. authorize() → prisma.user.findUnique + bcrypt.compare
3. JWT created with { id, email, role }
4. Session cookie set (httpOnly, SameSite=Lax)
```

### 5.2 Role Permission Matrix

| Route prefix | SUPER_ADMIN | ADMIN | TEACHER | ACCOUNTANT | LIBRARIAN | STUDENT | PARENT |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/admin/system` | ✓ | | | | | | |
| `/admin` | ✓ | ✓ | | | | | |
| `/students` | ✓ | ✓ | ✓ | | | | |
| `/attendance` | ✓ | ✓ | ✓ | | | | |
| `/marks` | ✓ | ✓ | ✓ | | | | |
| `/fees` | ✓ | ✓ | | ✓ | | | |
| `/payroll` | ✓ | ✓ | | ✓ | | | |
| `/library` | ✓ | ✓ | | | ✓ | | |
| `/timetable` | ✓ | ✓ | ✓ | | | ✓ | ✓ |
| `/my-results` | ✓ | ✓ | | | | ✓ | |
| `/parent` | ✓ | ✓ | | | | | ✓ |
| `/dashboard` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/api/*` | any authenticated user (handlers own fine-grained auth) |

### 5.3 Password Policy

- Minimum 8 characters, enforced in service layer
- bcrypt with cost factor 12
- No plaintext ever stored or logged
- Password reset via email token (Resend + time-limited JWT)

---

## 6. API Design

### 6.1 Conventions

- All routes under `/api/`
- Request body: JSON
- Response: JSON
- Error shape: `{ "error": "human readable message" }`
- Success shape: the resource or array of resources

### 6.2 Status Code Map

| Scenario | Status |
|---|---|
| Success (read) | 200 |
| Success (created) | 201 |
| Success (no body) | 204 |
| Missing required field | 400 |
| Unauthenticated | 401 |
| Forbidden role | 403 |
| Not found | 404 |
| Conflict (duplicate/already paid) | 409 |
| Domain validation failure | 422 |
| Unexpected server error | 500 |

### 6.3 Route Inventory

#### Students
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/students` | Create student + user account |
| `GET` | `/api/students/[id]` | Get student by ID |
| `PATCH` | `/api/students/[id]` | Update student profile |
| `DELETE` | `/api/students/[id]` | Delete (blocks if enrolled) |
| `GET` | `/api/students` | List/search students (with filters) |

#### Attendance
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/attendance` | Mark attendance for a section/date |
| `GET` | `/api/attendance` | Summary for a student in a session |

#### Marks & Exams
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/marks` | Submit marks for a student |
| `GET` | `/api/marks` | Get results by student + exam group |
| `POST` | `/api/exam-groups` | Create exam group |
| `GET` | `/api/exam-groups/[id]/schedules` | Get group with schedules |
| `POST` | `/api/exam-groups/[id]/schedules` | Add exam schedule |
| `PATCH` | `/api/exam-groups/[id]/publish` | Publish results |

#### Fees
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/fees/invoices` | Generate invoice |
| `POST` | `/api/fees/payments` | Record payment |
| `GET` | `/api/fees/invoices` | List invoices (filter by student/status) |

#### Timetable
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/timetable` | Get section timetable |
| `POST` | `/api/timetable` | Add slot (conflict detection) |
| `DELETE` | `/api/timetable/[id]` | Remove slot |

#### Homework
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/homework` | List homework for section |
| `POST` | `/api/homework` | Create assignment |
| `PATCH` | `/api/homework/[id]/acknowledge` | Student acknowledges |

#### Notifications
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/notifications` | Get notifications + unread count |
| `PATCH` | `/api/notifications` | Mark one or all as read |

#### Auth
| Method | Path | Description |
|---|---|---|
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth handlers |

---

## 7. Module Technical Design

### 7.1 Session & Class Management

- `AcademicSession` — one active session at a time; enforced by service checking `isActive` count before activation
- `Class` scoped to session; copying classes from previous session is a utility function
- Student promotion: creates new `StudentEnrollment` in new session's section; old enrollment retained for history
- Custom fields: store as `Json` on `Student`/`Staff` models; schema for each field stored in `School.settings`

### 7.2 Attendance

**Daily marking flow:**
1. Teacher selects section + date → GET enrolled students
2. UI renders `AttendanceForm` with all students defaulting to PRESENT
3. Teacher flags absences → POST `/api/attendance`
4. Service upserts `AttendanceDay` then bulk-upserts `StudentAttendance`
5. Background job (Inngest) triggers parent notification for each ABSENT student

**Percentage calculation:**
- PRESENT and LATE = 1 day
- HALF_DAY = 0.5 days
- HOLIDAY = excluded from denominator
- Formula: `effectiveDays / totalSchoolDays × 100`

**Threshold alerts:** configurable per school in `School.settings.attendanceThreshold` (default 75%)

### 7.3 Exam & Marks

**Publish gate:** `ExamGroup.published = false` until admin explicitly publishes. Students/parents query only published groups. Service layer enforces this.

**Grade calculation:**
1. `calculateTotalMarks(theory, practical?)`
2. `calculatePercentage(total, maxMarks)`
3. `calculateGrade(percentage, gradeScale)` → looks up school's default `GradingScale`
4. `isPassingGrade(total, passingMarks, maxMarks)`

All pure functions in `lib/domain/grades.ts` — no side effects, fully testable.

**Rank calculation:** Run after all marks are entered for a section/exam group. Sort by total descending, assign rank. Store on `MarkEntry`.

### 7.4 Fee Management

**Invoice generation:**
1. Sum all `FeeType.amount` in the assigned `FeeGroup`
2. Apply `FeeDiscount` records if any
3. Create `FeeInvoice` with `netAmount` and `status = UNPAID`

**Payment status state machine:**
```
UNPAID → PARTIAL (paidAmount > 0 && paidAmount < totalAmount)
UNPAID/PARTIAL → PAID (paidAmount >= totalAmount)
PAID → (terminal, no further payments accepted)
```

**Fee reminders:** Inngest cron job daily at 08:00 — query invoices with `dueDate < today AND status != PAID` → send email/SMS via Resend/Africa's Talking.

### 7.5 Notifications

- Created server-side by services (not directly by client)
- Client polls `GET /api/notifications?userId=...` every 30 seconds for the bell count
- Upgrade path: replace polling with Server-Sent Events at `/api/notifications/stream`
- Types: `FEE_DUE | RESULT_PUBLISHED | HOMEWORK_ASSIGNED | EXAM_SCHEDULED | ABSENCE_MARKED | GENERAL`

### 7.6 File Storage (Homework Attachments, Photos)

```
Upload flow:
1. Client requests presigned URL: POST /api/uploads/presign
2. Server generates R2 presigned PUT URL (60s TTL)
3. Client uploads directly to R2 (bypasses server)
4. Client confirms: POST /api/uploads/confirm { key, entityId, entityType }
5. Server saves key to DB record

File types allowed: PDF, JPG, PNG, DOCX (max 10MB)
Path convention: {schoolId}/{entityType}/{entityId}/{filename}
```

### 7.7 PDF Generation

Use `@react-pdf/renderer` in a Next.js API route:

```
GET /api/pdf/marksheet?studentId=...&examGroupId=...
GET /api/pdf/fee-receipt?invoiceId=...
GET /api/pdf/id-card?studentId=...
GET /api/pdf/timetable?sectionId=...
```

Each returns `Content-Type: application/pdf`. Run via Vercel Functions (not Edge).

### 7.8 Real-time Chat

For v1: polling every 5 seconds on active chat window.  
For v2: upgrade to Pusher Channels or Supabase Realtime.

Schema:
```prisma
model ChatRoom {
  id           String        @id @default(cuid())
  type         ChatRoomType  // DIRECT | GROUP
  participants ChatParticipant[]
  messages     ChatMessage[]
}

model ChatMessage {
  id         String   @id @default(cuid())
  roomId     String
  senderId   String
  body       String
  fileUrl    String?
  createdAt  DateTime @default(now())
}
```

---

## 8. Frontend Architecture

### 8.1 Page Structure

```
app/
  (public)/
    sign-in/page.tsx
    apply/page.tsx              ← online admission form

  (dashboard)/
    layout.tsx                  ← sidebar + topbar shell
    dashboard/page.tsx
    students/
      page.tsx                  ← list
      [id]/page.tsx             ← profile
      new/page.tsx
    attendance/
      page.tsx                  ← mark attendance
      reports/page.tsx
    marks/
      page.tsx                  ← mark entry
      results/page.tsx
    fees/
      page.tsx                  ← invoices list
      [id]/page.tsx
    timetable/page.tsx
    homework/page.tsx
    exam-groups/page.tsx
    notifications/page.tsx
    admin/
      sessions/page.tsx
      classes/page.tsx
      staff/page.tsx
      settings/page.tsx

  api/...                       ← route handlers
```

### 8.2 Data Fetching Pattern

- **Server Components** fetch data directly via service functions (no HTTP round-trip)
- **Client Components** use `fetch()` to hit API routes for interactive actions (forms, real-time updates)
- Loading states: React Suspense boundaries wrapping server component data fetches
- Error states: `error.tsx` files per route segment

### 8.3 Component Hierarchy

```
Layout (sidebar, topbar, notification bell)
└── Page (server component — fetches initial data)
    ├── DataTable / List (server rendered)
    │   └── Row actions (client — calls API routes)
    ├── Forms (client components)
    │   ├── AttendanceForm
    │   ├── MarkEntryForm
    │   ├── SignInForm
    │   └── FeeInvoiceCard
    └── Summary cards (client for real-time, server for static)
        ├── DashboardStats
        ├── AttendanceSummaryCard
        └── ResultsTable
```

### 8.4 State Management

- No global state library — use React `useState`/`useReducer` for local form state
- Server state (lists, profiles) — refetch after mutations via `router.refresh()`
- Notification count — local `useState` updated by polling interval

---

## 9. Background Jobs (Inngest)

| Job | Trigger | Action |
|---|---|---|
| `fee.reminder` | Cron: daily 08:00 | Query overdue invoices → send email/SMS per student |
| `attendance.absent-notify` | Event: attendance marked | For each ABSENT student → notify parent |
| `result.published-notify` | Event: exam group published | Notify all enrolled students + parents |
| `homework.assigned-notify` | Event: homework created | Notify all students in section |
| `report.generate` | On demand | Generate heavy reports async, store in R2, notify when ready |

---

## 10. Security Design

| Concern | Mitigation |
|---|---|
| SQL injection | Prisma parameterised queries — no raw SQL in hot paths |
| XSS | React escapes by default; no `dangerouslySetInnerHTML` |
| CSRF | NextAuth uses CSRF token for credential sign-in |
| Auth bypass | `proxy.ts` runs on every non-public request before any page code |
| Mass assignment | Service layer only picks explicitly allowed fields from request body |
| File upload abuse | Presigned URLs expire in 60s; type + size validated server-side before signing |
| Rate limiting | Vercel WAF + custom rate-limit on `/api/auth` routes (max 10 req/min per IP) |
| Secrets | Never in code — loaded from Vercel env vars; `.env` gitignored |
| Audit log | Middleware writes `AuditLog` row on mutating API calls (user, action, entity, timestamp) |

---

## 11. Performance Design

| Concern | Strategy |
|---|---|
| Slow list pages | Cursor-based pagination; DB indexes on `studentId`, `sectionId`, `date`, `sessionId` |
| Report generation | Run async via Inngest; cache result in R2 for 1 hour |
| N+1 queries | Prisma `include` with nested selects; never loop and query |
| Dashboard stats | Single parallel `Promise.all` of aggregate queries |
| PDF generation | Server-side via API route with Vercel 300s timeout; stream response |
| Images | Next.js `<Image>` with R2 CDN URL; auto WebP conversion |
| Cold starts | Vercel Fluid Compute; Prisma connection pooling via `pg.Pool` |

### Database Indexes to Add

```sql
-- Attendance lookups
CREATE INDEX idx_attendance_student_session ON "StudentAttendance"("studentId");
CREATE INDEX idx_attendance_day_section ON "AttendanceDay"("sectionId", "date");

-- Fee queries
CREATE INDEX idx_invoice_student ON "FeeInvoice"("studentId");
CREATE INDEX idx_invoice_status ON "FeeInvoice"("status");
CREATE INDEX idx_invoice_due ON "FeeInvoice"("dueDate") WHERE status != 'PAID';

-- Mark queries
CREATE INDEX idx_mark_student ON "MarkEntry"("studentId");
CREATE INDEX idx_mark_schedule ON "MarkEntry"("examScheduleId");

-- Notification polling
CREATE INDEX idx_notif_user_unread ON "Notification"("userId", "isRead");
```

---

## 12. Deployment Architecture

```
Vercel (production)
├── Next.js app (Fluid Compute — Node.js, not Edge)
├── API routes: all /api/* → server functions
├── proxy.ts → edge (JWT decode only, no DB)
└── Static assets → CDN

Neon (database)
├── Production branch: main
└── Dev branch: dev (used in preview deployments)

Cloudflare R2
└── Bucket: school-ms-files
    └── Public CDN: files.school-ms.com

Inngest
└── Background job workers (triggered by Vercel functions)

Resend
└── Transactional email

Environment variables (managed via Vercel)
├── DATABASE_URL
├── AUTH_SECRET
├── NEXTAUTH_URL
├── R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET
├── RESEND_API_KEY
├── INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY
└── TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN (or AFRICASTALKING_API_KEY)
```

---

## 13. Development Phases (Technical Milestones)

### Phase 1 — Foundation (Weeks 1–4)
- [ ] Prisma schema: all core models
- [ ] Auth: NextAuth credentials, JWT, proxy guard, role matrix
- [ ] Admin: school setup, session, class, section, subject CRUD
- [ ] Student + staff enrollment
- [ ] Dashboard skeleton per role

### Phase 2 — Academic Core (Weeks 5–10)
- [ ] Timetable builder with conflict detection
- [ ] Attendance marking + summary + parent notification
- [ ] Homework create/view/acknowledge + file attachments
- [ ] Exam group + schedule + mark entry + publish
- [ ] Marksheet PDF

### Phase 3 — Finance (Weeks 11–14)
- [ ] Fee types, groups, invoice generation
- [ ] Payment recording (cash/bank/online)
- [ ] Receipt PDF
- [ ] Fee reminders via Inngest cron
- [ ] Stripe integration (online payment)
- [ ] Income/expense ledger

### Phase 4 — Communication & Extra (Weeks 15–18)
- [ ] In-app notifications (polling → SSE)
- [ ] Bulk email/SMS (Resend + Africa's Talking)
- [ ] Internal chat (polling v1)
- [ ] Library CRUD + issue/return
- [ ] Hostel + transport management

### Phase 5 — Advanced (Weeks 19–24)
- [ ] Online admission form + approval workflow
- [ ] Online exam (MCQ + auto-grade)
- [ ] Payroll
- [ ] Inventory
- [ ] Front office (visitors, complaints)
- [ ] Additional payment gateways
- [ ] Audit log

### Phase 6 — Scale (Weeks 25–28)
- [ ] Multi-school (`schoolId` scoping through all queries)
- [ ] Performance: DB indexes, query optimisation
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Multi-language (i18n with `next-intl`)
- [ ] Theme system (CSS variables per school)
- [ ] Security audit

---

## 14. Open Technical Decisions

| Question | Options | Recommendation |
|---|---|---|
| Multi-tenancy | Shared DB with `schoolId` vs. DB-per-school | Shared DB for v1 — simpler ops; migrate later if isolation becomes a compliance requirement |
| Real-time | Polling vs. SSE vs. Pusher | Start with polling (30s interval) for notifications; add SSE when chat is built |
| File storage | R2 vs. S3 vs. Supabase Storage | R2 — no egress fees, Cloudflare CDN included |
| Payment gateway | Stripe first | Most documented; add regional gateways in Phase 5 based on target market |
| Chat | In-house vs. Stream.io | In-house polling for v1; Stream.io if realtime becomes critical |
| Report format | React PDF vs. Puppeteer | React PDF for simple marksheets; Puppeteer for pixel-perfect HTML templates |

---

*Document prepared 2026-06-03*
