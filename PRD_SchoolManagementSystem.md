# Product Requirements Document
# School Management System (SMS)
**Version:** 1.0  
**Date:** 2026-06-03  
**Based on analysis of:** Smart School v7.1.0 source code  

---

## 1. Executive Summary

A School Management System (SMS) is an all-in-one web platform that digitizes and centralizes every operational aspect of a school — from student enrollment and academic tracking to fee collection, HR, communication, and reporting. This PRD defines what to build, who it's for, and how it should behave when built from scratch with a modern stack.

---

## 2. Problem Statement

Schools today manage:
- Student records in spreadsheets or paper files
- Fee collection manually with no digital receipts or reminders
- Attendance tracked on paper with no analytics
- Communication scattered across WhatsApp, email, and phone calls
- Exams and results managed per-teacher with no unified gradebook
- No visibility for parents into their child's daily school life

This creates data silos, operational inefficiency, errors, and poor parent-school engagement. A unified SMS platform solves all of this.

---

## 3. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Digitize school operations | 100% of core workflows (attendance, fees, exams) managed in-app |
| Reduce admin workload | Admin spends <30 min/day on routine data entry |
| Improve fee collection rate | Fee default rate drops by 30% via reminders and online payment |
| Increase parent engagement | >70% of parents log in at least once per week |
| Reduce report generation time | Any report generated in <10 seconds |

---

## 4. Target Users & Roles

| Role | Who They Are | Primary Goal |
|------|-------------|--------------|
| **Super Admin** | School owner / IT admin | Configure the system, manage all data |
| **Admin** | School principal / admin staff | Day-to-day management of all modules |
| **Teacher** | Subject or class teacher | Mark attendance, upload content, enter marks |
| **Accountant** | Finance officer | Manage fees, income, expenses, payroll |
| **Librarian** | Library staff | Manage books, issue/return tracking |
| **Student** | Enrolled student | View timetable, marks, fees, homework |
| **Parent** | Student's guardian | Monitor child's attendance, fees, results |

Each role has **granular, configurable permissions** — admins can restrict or expand what each sub-role can see or do.

---

## 5. Scope — Modules

### 5.1 Core Academic Modules

#### 5.1.1 Session & Class Management
- Academic sessions (years) with start/end dates
- Classes (Grade 1, Form 2, JSS 3, etc.) and sections (A, B, C)
- Assign class teachers per section
- Student-to-class mapping with promotion/transfer between sessions
- Custom fields on student/staff profiles

#### 5.1.2 Subject Management
- Create subjects, assign to classes
- Subject groups (science group, arts group)
- Batch-subject assignments
- Teacher-subject mapping per class/section

#### 5.1.3 Timetable
- Period-by-period weekly timetable per class/section
- Conflict detection (teacher double-booked)
- Printable timetable per class and per teacher
- Student view of their own timetable

#### 5.1.4 Lesson Plans & Syllabus
- Teacher uploads lesson plan per subject/date
- Syllabus tracker — topics covered vs. pending
- Admin can review lesson plans

#### 5.1.5 Homework
- Teacher assigns homework per class/subject with due date
- Attach files (PDF, images)
- Student views and acknowledges
- Teacher marks as evaluated

---

### 5.2 Attendance

#### 5.2.1 Student Attendance
- Mark attendance per class/section per day (Present / Absent / Late / Half-day)
- Bulk mark (mark all present, then flag absents)
- Subject-wise attendance (per lecture, not just per day)
- Attendance reports: student-wise, class-wise, date-range
- Auto-notify parent on absence via SMS/email

#### 5.2.2 Staff Attendance
- Mark staff attendance daily
- Biometric device integration (import via API or CSV)
- Leave deduction based on attendance
- Staff attendance reports

#### 5.2.3 Settings
- Define working days per week
- Holiday calendar integration (absences on holidays not counted)
- Minimum attendance % threshold alerts

---

### 5.3 Exam & Assessment

#### 5.3.1 Exam Groups & Schedules
- Create exam groups (Term 1, Midterm, Finals, Unit Test)
- Exam schedule per class/subject with date, time, room, max marks
- Auto-generate admit cards (printable PDF per student)

#### 5.3.2 Mark Entry
- Teacher enters marks per student per subject
- Configurable: theory marks + practical marks
- Grade calculation based on configurable grading scales
- Marks division (A+, A, B+, B, C, F…) with configurable ranges

#### 5.3.3 Results & Marksheets
- Auto-calculate totals, percentage, rank, pass/fail
- Configurable marksheet templates (printable PDF)
- CBSE-style exam result support
- Publish results — students/parents see results only after admin publishes
- Historical results per student across all sessions

#### 5.3.4 Online Exams
- Admin/teacher creates question bank (MCQ, short answer)
- Schedule online exam with time limit
- Students take exam in browser
- Auto-grade MCQ; manual grade for written answers
- Result immediately available after submission

---

### 5.4 Fee Management

#### 5.4.1 Fee Structure
- Fee types (Tuition, Sports, Library, Transport, Hostel, etc.)
- Fee categories (Monthly, Quarterly, Annual, One-time)
- Fee groups — bundle multiple fee types per class
- Assign fee groups to classes/students

#### 5.4.2 Fee Collection
- Generate fee invoices per student per term
- Record payment (cash, bank transfer, online)
- Print/download receipt PDF
- Partial payment support with balance tracking
- Fee forward — carry unpaid balance to next session

#### 5.4.3 Discounts
- Define discount types (sibling, merit, staff ward, scholarship)
- Apply discounts per student
- Stackable or mutually exclusive discount rules

#### 5.4.4 Fee Reminders
- Manual or scheduled SMS/email reminders for due fees
- Bulk reminder to all defaulters in a class

#### 5.4.5 Online Fee Payment
- Students/parents pay fees online from the portal
- Payment gateway integrations:
  - **Global:** Stripe, PayPal, Razorpay, Paystack, Flutterwave, Mollie, 2Checkout
  - **Regional:** Paytm, Cashfree, CCAvenue, Instamojo (India); JazzCash (Pakistan); PesaPal, iPay Africa (Africa); Midtrans (Indonesia); Billplz, ToyyibPay (Malaysia); SSLCommerz (Bangladesh); PayHere (Sri Lanka); PayFast (South Africa)
- Payment auto-reconciles with student fee record
- Webhook support for payment confirmations

---

### 5.5 Finance & Accounting

#### 5.5.1 Income & Expenses
- Income heads (fee income, grant, donation)
- Expense heads (salary, utilities, maintenance, stationery)
- Record income and expense transactions with date, amount, note, attachment
- Filter and search transactions

#### 5.5.2 Payroll
- Define salary structure per employee (basic + allowances + deductions)
- Generate monthly payroll
- Payslip PDF per employee
- Mark payroll as paid

#### 5.5.3 Financial Reports
- Income vs. expense summary
- Balance sheet view
- Fee collection report (collected vs. outstanding per class/session)
- Transaction history with export (CSV/PDF)

---

### 5.6 Student Management

- Add/edit student profiles with photo
- Custom fields (blood group, religion, caste, transport route, etc.)
- Parent/guardian details linked to student
- Student ID card generation (printable PDF, configurable template)
- Admission number auto-generation
- Online admission form (public-facing, configurable fields)
- Application approval workflow — review → approve → assign class
- Student transfer between classes/sections
- Alumni management (graduated students)
- Disable/archive students with reason

---

### 5.7 Staff Management

- Add/edit staff profiles (teachers, non-teaching staff)
- Departments and designations
- Role assignment (Teacher, Accountant, Librarian, etc.)
- Staff ID card generation
- Resume/CV builder within system
- Document uploads (certificates, contracts)
- Role-based portal access

---

### 5.8 Communication

#### 5.8.1 Notifications
- In-app notification bell (real-time or polling)
- Notification types: fee due, result published, homework assigned, exam schedule, absence

#### 5.8.2 SMS & Email
- Configure SMS gateway (Twilio, Nexmo, custom API)
- Configure SMTP email
- Send bulk SMS/email by role (all parents, specific class, all staff)
- Templates for common messages

#### 5.8.3 Internal Chat
- Real-time chat between any two users in the system
- Group chat per class or department
- File attachment support

#### 5.8.4 Notice Board / Timeline
- Admin/teacher posts announcements
- Visible to targeted audience (all, specific class, specific role)
- Student/parent sees timeline in their dashboard

---

### 5.9 Library Management

- Book catalog (title, author, ISBN, category, quantity)
- Issue books to students/staff with due date
- Return tracking and fine calculation for overdue
- Search and filter books
- Book availability status

---

### 5.10 Hostel Management

- Define hostels, room types, rooms
- Assign students to rooms
- School houses (house system for students)
- Hostel fee linked to fee management module

---

### 5.11 Transport Management

- Define vehicles (bus, van) with capacity and driver info
- Define routes with pickup points and timing
- Assign students to routes/pickup points
- Transport fee linked to fee management
- Route-wise student list report

---

### 5.12 Inventory Management

- Item categories and items catalog
- Stores (locations where items are kept)
- Suppliers
- Stock in/out tracking
- Issue items to staff/students
- Low-stock alerts

---

### 5.13 Front Office

- **Visitor log:** Record visitor name, purpose, host, in-time, out-time
- **Dispatch:** Outgoing dispatch log (letters, parcels)
- **Complaints:** Student/parent submits complaint; admin tracks and resolves
- **Enquiries:** Prospective parent/student enquiry form with follow-up

---

### 5.14 Front Website (CMS)

- Public-facing school website managed from within the admin panel
- Pages with rich text content
- Navigation menu management
- Programs/courses listing page
- Online admission form embed
- Exam result lookup (public)
- Annual calendar

---

### 5.15 Reports

Every module generates reports. Core reports:

| Report | Filter Options |
|--------|---------------|
| Student list | Class, section, session |
| Attendance report | Student/class/date range |
| Staff attendance | Staff/date range |
| Fee collection | Class/date range/status |
| Financial summary | Date range, head |
| Exam result | Class/exam group |
| Mark sheet | Per student |
| Transport route list | Per route |
| Library issue log | Per student/date |

All reports: view on screen, print, export CSV, export PDF.

---

### 5.16 System Administration

- **Multi-session:** New academic year = new session; historical data preserved
- **Multi-school:** Single installation can manage multiple school branches
- **Roles & Permissions:** Fully configurable — create custom roles, assign granular module permissions
- **Audit Log:** Every action logged with user + timestamp + what changed
- **Themes:** Multiple UI color themes, switchable per school
- **Language:** Multi-language support (English + regional languages), RTL support
- **Custom Fields:** Admin adds extra fields to student/staff profiles without code changes
- **Sidebar Menu:** Admin can show/hide sidebar menu items per role
- **Add-ons:** Plugin/extension system for optional features
- **Backup:** Database backup download from admin panel
- **Auto-updater:** System can check for and apply updates

---

## 6. User Stories (Priority Order)

### Must Have (MVP)
- As a **admin**, I can add students to a class and session
- As a **teacher**, I can mark daily attendance for my class
- As a **admin**, I can create fee types and collect fees from students
- As a **admin**, I can create exams and enter marks
- As a **student**, I can log in and see my timetable, attendance, and results
- As a **parent**, I can log in and see my child's attendance, fees, and results
- As a **admin**, I can send SMS/email to all parents of a class
- As a **admin**, I can generate and print marksheets and fee receipts

### Should Have
- Online fee payment via Stripe/PayPal/regional gateways
- Online admission form
- Homework upload/view
- Internal chat
- Library management
- Transport management
- Hostel management
- Staff payroll

### Nice to Have
- Online exam (browser-based)
- Biometric attendance integration
- Front website CMS
- Alumni management
- Resume builder
- Add-ons/plugin system

---

## 7. Technical Architecture

### Recommended Modern Stack

```
Frontend:        Next.js 14+ (App Router) + TypeScript
UI Components:   shadcn/ui + Tailwind CSS
Backend API:     Next.js API Routes or separate Node.js/Express
Database:        PostgreSQL (via Supabase or PlanetScale)
ORM:             Prisma
Authentication:  NextAuth.js / Clerk
File Storage:    AWS S3 / Cloudflare R2 / Supabase Storage
PDF Generation:  Puppeteer or @react-pdf/renderer
Real-time:       Pusher / Supabase Realtime (chat, notifications)
Email:           Resend / SendGrid
SMS:             Twilio / Africa's Talking
Background Jobs: Inngest / BullMQ (fee reminders, report generation)
Deployment:      Vercel (web) + Railway/Render (workers)
```

### Alternative Stack (if PHP team)
```
Backend:    Laravel 11 + PHP 8.3
Frontend:   Livewire + Alpine.js (or separate React)
Database:   MySQL / PostgreSQL
Auth:       Laravel Breeze / Jetstream (roles via Spatie)
PDF:        DomPDF / Snappy
Queue:      Laravel Queue (Redis)
```

### Database Design — Core Entities

```
schools          → id, name, logo, settings
sessions         → id, school_id, name, start_date, end_date
classes          → id, school_id, name
sections         → id, class_id, name, class_teacher_id
students         → id, school_id, name, photo, admission_no, dob, ...
student_sessions → id, student_id, session_id, class_id, section_id, roll_no
staff            → id, school_id, name, photo, department_id, designation_id
users            → id, role, email, password, entity_id (student/staff/parent)
subjects         → id, school_id, name, code
attendance       → id, student_id, date, status, section_id
exams            → id, session_id, exam_group_id, subject_id, class_id, date
marks            → id, exam_id, student_id, marks_obtained, grade
fees             → id, student_id, fee_type_id, amount, due_date, paid_at
transactions     → id, school_id, type (income/expense), amount, date
```

---

## 8. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Performance** | Page load <2s; report generation <10s |
| **Uptime** | 99.5% uptime |
| **Scalability** | Support 10,000+ students per school; 100+ schools on single instance |
| **Security** | Role-based access control; SQL injection prevention; XSS protection; HTTPS enforced; passwords bcrypt-hashed |
| **Data Privacy** | Student data never shared; GDPR-compliant data export/delete |
| **Mobile Responsive** | Full functionality on mobile browser; no native app required for v1 |
| **Offline** | Not required for v1; key pages (attendance marking) should work on slow/intermittent connection |
| **Accessibility** | WCAG 2.1 AA minimum |
| **Browser Support** | Chrome, Firefox, Safari, Edge (last 2 major versions) |

---

## 9. Development Phases

### Phase 1 — Foundation (Weeks 1–8)
- Auth system (login, roles, permissions)
- School, session, class, section, subject setup
- Student enrollment and profiles
- Staff profiles
- Basic dashboard per role

### Phase 2 — Academic Core (Weeks 9–16)
- Timetable builder
- Attendance marking and reports
- Homework module
- Exam creation, mark entry, result viewing
- Marksheet PDF generation

### Phase 3 — Finance (Weeks 17–22)
- Fee types, groups, assignment
- Fee collection and receipt PDF
- Fee reminders (SMS/email)
- Income and expense tracking
- At least one payment gateway (Stripe)

### Phase 4 — Communication & Extra Modules (Weeks 23–28)
- In-app notifications
- Bulk SMS/email
- Internal chat
- Library management
- Hostel management
- Transport management

### Phase 5 — Advanced Features (Weeks 29–36)
- Online admission with payment
- Online exams
- Payroll
- Inventory
- Front office (visitors, complaints)
- Multiple payment gateways (regional)
- Audit logs
- Backup and update system

### Phase 6 — Polish & Scale (Weeks 37–40)
- Performance optimization
- Mobile responsiveness audit
- Multi-language / RTL
- Theme system
- Add-ons architecture
- Multi-school support
- Security audit

---

## 10. Competitive Differentiation

What to do better than Smart School v7 (built on legacy CodeIgniter):

| Area | Smart School Pain Point | What to Do Better |
|------|------------------------|-------------------|
| Tech stack | CodeIgniter PHP (2015-era) | Modern Next.js with type safety, fast API |
| Mobile | Not mobile-first | Fully responsive, PWA installable |
| Real-time | No real-time chat/notifications | WebSocket-based live updates |
| API | No public API | REST + GraphQL API for mobile apps |
| UI/UX | Dated Bootstrap UI | Clean, modern shadcn/Tailwind design system |
| Onboarding | Manual setup required | Guided wizard-based school setup |
| Analytics | Basic tabular reports | Dashboard analytics with charts |
| Integrations | Limited | Zapier/Webhook support for 3rd party tools |

---

## 11. Out of Scope (v1)

- Native iOS / Android mobile app (PWA covers this)
- Learning Management System (LMS) with video hosting
- Parent-teacher video calls
- AI-powered tutoring or grading
- Multi-currency accounting / double-entry bookkeeping
- Government reporting formats (NEMIS, WAEC, etc.) — Phase 2 after market research

---

## 12. Open Questions

1. **Multi-tenancy model:** One database per school, or shared database with `school_id` scoping? (Shared DB is simpler to start; separate DB per school is safer for data isolation.)
2. **Primary market:** Ghana / West Africa specific? Or global? This affects default payment gateways, language, and compliance requirements.
3. **Pricing model:** SaaS subscription per school? Per student? One-time license?
4. **Mobile app:** PWA only for v1, or build React Native in parallel?
5. **Who hosts it:** School self-hosts, or cloud-hosted SaaS where we manage servers?

---

*Document prepared by Claude Code on 2026-06-03 based on full source code analysis of Smart School v7.1.0 by QDOCS.*
