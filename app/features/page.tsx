import Link from "next/link";
import {
  GraduationCap, ArrowRight, Users, DollarSign, ClipboardList,
  BookOpen, Bus, Building2, Package, PhoneCall, Clock, FileText,
  MessageSquare, Bell, BarChart3, UserCheck, Award, Calendar,
  CreditCard, Laptop, Home, CheckCircle2,
} from "lucide-react";
import { SkulaNav } from "@/components/SkulaNav";

const MODULES = [
  {
    id: "students",
    icon: Users,
    color: "blue",
    category: "Academic",
    name: "Student Management",
    tagline: "Every student. Every detail. One place.",
    description:
      "The backbone of the entire system. From the moment a student is admitted to the day they graduate, every piece of information lives here — profiles, academic history, session records, guardian contacts, and documents.",
    who: "Admin, Class Teacher",
    features: [
      "Custom admission forms with configurable fields per school",
      "Student profiles with photo, guardian info, medical notes, and documents",
      "Session-based enrollment — students re-enrolled each academic year automatically",
      "Class and section assignment with one-click promotion at term/year end",
      "Automatic student ID generation and printable ID cards with school branding",
      "Disable/archive students with reason tracking (transfer, withdrawal, graduation)",
      "Student timeline — a full activity log of every action taken on the record",
      "Parent portal access provisioned automatically at enrollment",
      "Bulk import from spreadsheet for schools migrating existing data",
      "Advanced search and filter by class, section, session, status, or any custom field",
    ],
    mockup: (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800">Student Profiles</span>
          <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-full">842 enrolled</span>
        </div>
        <div className="divide-y">
          {[
            { n: "Kwame Asante", c: "Grade 9A", s: "Active", i: "KA", col: "bg-blue-100 text-blue-700" },
            { n: "Ama Boateng", c: "Grade 7B", s: "Active", i: "AB", col: "bg-violet-100 text-violet-700" },
            { n: "Kofi Mensah", c: "Grade 11A", s: "Active", i: "KM", col: "bg-emerald-100 text-emerald-700" },
            { n: "Akua Osei", c: "Grade 8C", s: "Active", i: "AO", col: "bg-amber-100 text-amber-700" },
          ].map(s => (
            <div key={s.n} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-8 h-8 rounded-full ${s.col} flex items-center justify-center text-xs font-black shrink-0`}>{s.i}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{s.n}</p>
                <p className="text-xs text-gray-400">{s.c}</p>
              </div>
              <span className="text-xs text-emerald-600 bg-emerald-50 font-bold px-2 py-0.5 rounded-full shrink-0">{s.s}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "fees",
    icon: DollarSign,
    color: "violet",
    category: "Finance",
    name: "Fee Management",
    tagline: "Know exactly who paid. Who owes. Right now.",
    description:
      "The module school administrators use the most. Every pesewa tracked, every receipt printable, every outstanding balance visible in real time. No more reconciling payments in WhatsApp groups.",
    who: "Admin, Accountant",
    features: [
      "Configurable fee types (tuition, levies, PTA, uniforms, etc.) per session",
      "Fee groups — assign a fee structure to a whole class or section at once",
      "Per-student invoicing with automatic carry-forward of outstanding balances",
      "Discounts — fixed or percentage, assigned per student or per group",
      "Instant printable receipts with school letterhead, logo, and receipt number",
      "Outstanding balance dashboard — see who owes what at a glance",
      "Fee waiver and scholarship tracking with audit trail",
      "Payment history per student — every transaction with date, amount, and method",
      "Automated SMS and email reminders for unpaid invoices",
      "Term and session-based financial summaries for the principal",
    ],
    mockup: (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800">Fee Receipt #RCP-2025-0842</span>
          <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full">Paid ✓</span>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex justify-between text-sm py-1 border-b border-gray-50">
            <span className="text-gray-500">Tuition Fee</span><span className="font-semibold text-gray-900">GH₵ 1,200.00</span>
          </div>
          <div className="flex justify-between text-sm py-1 border-b border-gray-50">
            <span className="text-gray-500">ICT Levy</span><span className="font-semibold text-gray-900">GH₵ 80.00</span>
          </div>
          <div className="flex justify-between text-sm py-1 border-b border-gray-50">
            <span className="text-gray-500">PTA Dues</span><span className="font-semibold text-gray-900">GH₵ 40.00</span>
          </div>
          <div className="flex justify-between text-sm py-1 border-b border-gray-50">
            <span className="text-emerald-600">Scholarship (10%)</span><span className="font-semibold text-emerald-600">– GH₵ 132.00</span>
          </div>
          <div className="flex justify-between pt-2 mt-1">
            <span className="font-bold text-gray-900">Total Paid</span>
            <span className="text-xl font-black text-violet-600">GH₵ 1,188.00</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "attendance",
    icon: UserCheck,
    color: "emerald",
    category: "Academic",
    name: "Attendance",
    tagline: "Mark once. Reports write themselves.",
    description:
      "Daily attendance recorded digitally by the class teacher. Absent students flagged automatically. Parents notified. The principal sees school-wide attendance at a glance without asking anyone.",
    who: "Teacher, Admin",
    features: [
      "Daily attendance marking per class and section — present, absent, late, excused",
      "Configurable attendance types to match your school's terminology",
      "Bulk marking — mark everyone present, then adjust exceptions",
      "Automatic notification to parent when a student is marked absent",
      "Attendance percentage per student — flagged when below threshold",
      "Class-wise and school-wide attendance reports by day, week, or term",
      "Subject-level attendance for secondary schools tracking per-period absences",
      "Attendance summary on each student's profile and parent portal",
      "Holiday management — attendance not required on gazetted holidays",
      "Teacher can add remarks against each attendance entry",
    ],
    mockup: (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b px-4 py-3">
          <span className="text-sm font-bold text-gray-800">Grade 9A — Today's Attendance</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[{l:"Present",v:"28",c:"bg-emerald-50 text-emerald-700"},{l:"Absent",v:"3",c:"bg-rose-50 text-rose-700"},{l:"Late",v:"1",c:"bg-amber-50 text-amber-700"}].map(s=>(
              <div key={s.l} className={`${s.c} rounded-xl p-2.5 text-center`}>
                <p className="text-xl font-black">{s.v}</p>
                <p className="text-[10px] font-semibold mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[{n:"Kwame Asante",s:"present"},{n:"Ama Boateng",s:"absent"},{n:"Kofi Mensah",s:"present"},{n:"Akua Osei",s:"late"}].map(r=>(
              <div key={r.n} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">{r.n}</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${r.s==="present"?"bg-emerald-50 text-emerald-700":r.s==="absent"?"bg-rose-50 text-rose-600":"bg-amber-50 text-amber-700"}`}>
                  {r.s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "exams",
    icon: ClipboardList,
    color: "indigo",
    category: "Academic",
    name: "Exams & Results",
    tagline: "Marks in. Ranked marksheets out. No Excel.",
    description:
      "The module that saves teachers three days of work every term. Enter marks by subject, and Skula calculates totals, grades, positions, and generates print-ready marksheets — automatically.",
    who: "Teacher, Admin",
    features: [
      "Exam groups and exam scheduling with configurable subjects per class",
      "Marks entry per subject — one teacher per subject, controlled by the admin",
      "Configurable grade scales: A1-F9 for WASSCE, A-E for BECE, or custom",
      "Mark divisions — configure pass/fail thresholds per exam or per subject",
      "Auto-calculated totals, grade, rank in class, and rank in year",
      "Printable admit cards generated before each exam with student photo and schedule",
      "Branded ranked marksheets — school logo, principal's remarks, parent signature block",
      "Term-average and cumulative running totals across exam groups",
      "Bulk marks import from a spreadsheet if teachers prefer Excel entry",
      "Results locked for editing after the principal publishes them",
    ],
    mockup: (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800">Term 2 Results — Grade 9A</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-full">Published</span>
        </div>
        <table className="w-full text-xs">
          <thead><tr className="bg-gray-50 border-b">
            <th className="text-left px-4 py-2 text-gray-400 font-semibold">Student</th>
            <th className="text-center px-2 py-2 text-gray-400 font-semibold">Total</th>
            <th className="text-center px-2 py-2 text-gray-400 font-semibold">Grade</th>
            <th className="text-center px-2 py-2 text-gray-400 font-semibold">Rank</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {[{n:"Kwame Asante",t:456,g:"A1",r:1},{n:"Ama Boateng",t:441,g:"A2",r:2},{n:"Kofi Mensah",t:418,g:"B2",r:3},{n:"Akua Osei",t:402,g:"B3",r:4}].map(r=>(
              <tr key={r.n}>
                <td className="px-4 py-2.5 font-semibold text-gray-800">{r.n}</td>
                <td className="text-center px-2 py-2.5 text-gray-700">{r.t}</td>
                <td className="text-center px-2 py-2.5"><span className={`px-2 py-0.5 rounded text-[10px] font-black ${r.r<=2?"bg-emerald-100 text-emerald-700":"bg-blue-100 text-blue-700"}`}>{r.g}</span></td>
                <td className="text-center px-2 py-2.5 font-black text-gray-900">#{r.r}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "timetable",
    icon: Calendar,
    color: "amber",
    category: "Academic",
    name: "Timetable",
    tagline: "Build the whole school timetable in minutes.",
    description:
      "Configure periods, assign subjects and teachers to each slot, and publish. Every teacher sees only their timetable. Every student and parent sees their class timetable. Zero paper schedules.",
    who: "Admin, Teacher, Student, Parent",
    features: [
      "Configurable school periods and break times per day",
      "Period assignment by class, section, subject, and teacher",
      "Teacher conflict detection — warns if the same teacher is double-booked",
      "Subject group support — a single timetable entry can span multiple sections",
      "Per-class view and per-teacher view from the same configuration",
      "Students and parents see their class timetable on the portal",
      "Printable timetable PDF for physical display in classrooms",
      "Holiday-aware — timetable entries on holidays shown as cancelled",
      "Timetable history per session — view any past term's schedule",
    ],
    mockup: (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b px-4 py-3"><span className="text-sm font-bold text-gray-800">Grade 9A — Week Timetable</span></div>
        <div className="p-3 overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead><tr>
              <th className="text-left py-1.5 text-gray-400 font-semibold pr-2">Period</th>
              {["Mon","Tue","Wed","Thu","Fri"].map(d=><th key={d} className="text-center py-1.5 text-gray-400 font-semibold px-1">{d}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {[
                {p:"7:30",cols:["Mathematics","English","Science","Social","Maths"]},
                {p:"8:20",cols:["English","Science","Social","Maths","English"]},
                {p:"9:10",cols:["Science","Social","Maths","English","ICT"]},
                {p:"10:00",cols:["BREAK","BREAK","BREAK","BREAK","BREAK"]},
                {p:"10:20",cols:["Social","ICT","English","Science","Social"]},
              ].map(r=>(
                <tr key={r.p}>
                  <td className="py-2 pr-2 text-gray-400 font-medium whitespace-nowrap">{r.p}</td>
                  {r.cols.map((c,i)=>(
                    <td key={i} className="text-center px-1 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${c==="BREAK"?"bg-gray-100 text-gray-400":c==="Mathematics"||c==="Maths"?"bg-indigo-50 text-indigo-700":c==="English"?"bg-blue-50 text-blue-700":c==="Science"?"bg-emerald-50 text-emerald-700":c==="ICT"?"bg-purple-50 text-purple-700":"bg-amber-50 text-amber-700"}`}>{c}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    id: "staff",
    icon: Users,
    color: "rose",
    category: "Administration",
    name: "Staff & HR",
    tagline: "Your team. Every contract, leave, and payslip tracked.",
    description:
      "Full staff management from hiring to departure. HR records, qualifications, designations, and departments — with payroll and leave management built in so your accountant and principal stay aligned.",
    who: "Admin, HR",
    features: [
      "Staff profiles with qualifications, designation, department, and contract details",
      "Role assignment — Teacher, Accountant, Librarian, custom roles as needed",
      "Staff ID cards with photo and school branding, printable on demand",
      "Leave application and approval workflow — teacher applies, admin approves",
      "Leave balance tracking — annual, sick, casual, and custom leave types",
      "Payroll configuration — salary, allowances, deductions per staff member",
      "Monthly payslip generation and PDF download",
      "Staff activity timeline — who did what and when across the system",
      "Department and designation management for org chart clarity",
      "Staff disable/archive with reason tracking for leavers",
    ],
    mockup: (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800">Staff Directory</span>
          <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-full">64 staff</span>
        </div>
        <div className="divide-y">
          {[
            {n:"Mr. Kweku Ansa",r:"Mathematics Teacher",d:"Teaching Staff",col:"bg-rose-100 text-rose-700"},
            {n:"Mrs. Abena Sarpong",r:"Head of Accounts",d:"Finance",col:"bg-amber-100 text-amber-700"},
            {n:"Mr. Yaw Darko",r:"Librarian",d:"Administration",col:"bg-blue-100 text-blue-700"},
            {n:"Ms. Efua Asante",r:"ICT Teacher",d:"Teaching Staff",col:"bg-violet-100 text-violet-700"},
          ].map(s=>(
            <div key={s.n} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-8 h-8 rounded-full ${s.col} flex items-center justify-center text-xs font-black shrink-0`}>{s.n.split(" ").map(w=>w[0]).slice(1,3).join("")}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{s.n}</p>
                <p className="text-xs text-gray-400">{s.r} · {s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "library",
    icon: BookOpen,
    color: "teal",
    category: "Facilities",
    name: "Library",
    tagline: "Every book. Every borrower. Every due date.",
    description:
      "A complete library management system embedded in the school platform. Catalogue books, issue them to students or staff, track returns, and fine defaulters — without a separate system.",
    who: "Librarian, Admin, Teacher, Student",
    features: [
      "Book catalogue with title, author, ISBN, publisher, edition, and quantity",
      "Book categories for easy browsing and filtering",
      "Issue books to students or staff with due date configuration",
      "Return tracking — overdue books flagged automatically",
      "Fine calculation for overdue returns, recorded against the borrower",
      "Book availability status — how many copies are in vs. issued",
      "Library member management — who is authorised to borrow",
      "Student can check their borrowed books and due dates on the portal",
      "Search and filter the catalogue by any field",
      "Library usage reports — most borrowed books, active members, overdue summary",
    ],
    mockup: (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800">Library — Book Issues</span>
          <span className="text-xs bg-teal-100 text-teal-700 font-bold px-2.5 py-1 rounded-full">12 overdue</span>
        </div>
        <div className="divide-y">
          {[
            {t:"Mathematics for BECE",b:"Kwame Asante",d:"10 Jun",o:false},
            {t:"English Grammar Mastery",b:"Ama Boateng",d:"4 Jun",o:true},
            {t:"Integrated Science Textbook",b:"Kofi Mensah",d:"8 Jun",o:false},
            {t:"Social Studies Companion",b:"Akua Osei",d:"2 Jun",o:true},
          ].map(r=>(
            <div key={r.t} className="px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{r.t}</p>
                  <p className="text-xs text-gray-400">{r.b} · Due {r.d}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${r.o?"bg-rose-50 text-rose-600":"bg-emerald-50 text-emerald-700"}`}>{r.o?"Overdue":"Active"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "transport",
    icon: Bus,
    color: "orange",
    category: "Facilities",
    name: "Transport",
    tagline: "Every route, every vehicle, every student on board.",
    description:
      "Manage the school's bus fleet and routes. Assign students to vehicles and pickup points. Parents know which bus their child is on. No more confusion at dismissal time.",
    who: "Admin",
    features: [
      "Vehicle registration — bus name, plate number, capacity, driver details",
      "Route configuration — define stops and assign vehicles to routes",
      "Student-to-route assignment — which bus each student takes",
      "Driver contact details accessible to the admin on demand",
      "Transport fee integration — link transport levy to the fee module",
      "Printable route lists for each driver",
      "Parent can see their child's assigned bus and route on the portal",
      "Route and vehicle report — utilisation and passenger counts",
    ],
    mockup: (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b px-4 py-3"><span className="text-sm font-bold text-gray-800">Bus Routes</span></div>
        <div className="divide-y">
          {[
            {r:"Route A — Accra North",v:"GH-2341 · 45 seats",s:38,col:"bg-orange-100 text-orange-700"},
            {r:"Route B — East Legon",v:"GH-5512 · 32 seats",s:29,col:"bg-blue-100 text-blue-700"},
            {r:"Route C — Tema",v:"GH-8801 · 50 seats",s:47,col:"bg-emerald-100 text-emerald-700"},
          ].map(r=>(
            <div key={r.r} className="flex items-center gap-3 px-4 py-3.5">
              <div className={`w-9 h-9 rounded-xl ${r.col} flex items-center justify-center shrink-0`}>
                <Bus className="h-4 w-4"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{r.r}</p>
                <p className="text-xs text-gray-400">{r.v}</p>
              </div>
              <span className="text-xs font-black text-gray-700">{r.s} students</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "hostel",
    icon: Home,
    color: "purple",
    category: "Facilities",
    name: "Hostel / Dormitory",
    tagline: "Every bed. Every boarder. Zero confusion.",
    description:
      "For boarding schools — manage dormitory rooms, assign students, track boarding fees, and maintain house records. Housemasters have visibility into their specific house without seeing others.",
    who: "Admin, Housemaster",
    features: [
      "Hostel and room configuration — block, room number, bed capacity",
      "Student room assignment — assign any enrolled student to a room",
      "Occupancy tracking — see which rooms are full, partial, or empty",
      "House/boarding fee integration with the fee module",
      "Housemaster role — view their house only, no other access",
      "Boarding student reports — full list of students per house and per room",
      "Printable room allocation list for physical notice boards",
      "Vacate tracking when a boarder leaves mid-term",
    ],
    mockup: (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800">Hostel — Asante House</span>
          <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-full">94% full</span>
        </div>
        <div className="p-4 grid grid-cols-4 gap-2">
          {Array.from({length:16},(_,i)=>({r:`Room ${i+1}`,full: i<14})).map(r=>(
            <div key={r.r} className={`rounded-xl border p-2 text-center ${r.full?"bg-purple-50 border-purple-200":"bg-gray-50 border-gray-200"}`}>
              <p className="text-[10px] font-bold text-gray-600 mb-0.5">{r.r}</p>
              <div className={`w-2 h-2 rounded-full mx-auto ${r.full?"bg-purple-500":"bg-gray-300"}`}/>
            </div>
          ))}
        </div>
        <div className="px-4 pb-3 flex gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block"/>Occupied</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block"/>Vacant</span>
        </div>
      </div>
    ),
  },
  {
    id: "inventory",
    icon: Package,
    color: "cyan",
    category: "Facilities",
    name: "Inventory",
    tagline: "Every item in your school store. Accounted for.",
    description:
      "Track school assets and storeroom inventory — from textbooks to lab equipment to furniture. Issue items to staff or departments and maintain a complete record of stock movement.",
    who: "Admin, Store Manager",
    features: [
      "Item catalogue with category, unit, and opening stock",
      "Supplier management — who supplies what, at what cost",
      "Stock receipt — record new deliveries from suppliers",
      "Issue items to staff or departments with quantity and date",
      "Current stock balance — auto-calculated from receipts minus issues",
      "Low stock alerts — get notified when an item falls below minimum",
      "Store management — track stock across multiple stores or rooms",
      "Full audit trail — every movement recorded with who, when, and why",
      "Inventory reports — stock summary, movement history, by category",
    ],
    mockup: (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800">Store Inventory</span>
          <span className="text-xs bg-rose-100 text-rose-600 font-bold px-2.5 py-1 rounded-full">3 low stock</span>
        </div>
        <div className="divide-y">
          {[
            {item:"Exercise Books (A4)",qty:120,unit:"packs",low:false},
            {item:"Blue Pens (box)",qty:8,unit:"boxes",low:true},
            {item:"Whiteboard Markers",qty:4,unit:"packs",low:true},
            {item:"A4 Paper (ream)",qty:45,unit:"reams",low:false},
          ].map(r=>(
            <div key={r.item} className="flex items-center justify-between px-4 py-2.5">
              <div>
                <p className="text-sm font-medium text-gray-800">{r.item}</p>
                <p className="text-xs text-gray-400">{r.qty} {r.unit} remaining</p>
              </div>
              {r.low && <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Low</span>}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "front-office",
    icon: PhoneCall,
    color: "sky",
    category: "Administration",
    name: "Front Office",
    tagline: "Every visitor. Every call. Every complaint. Logged.",
    description:
      "The front desk module. Log visitors, track phone calls, handle complaints from parents, and manage postal items — so nothing slips through the cracks at the school gate.",
    who: "Admin, Receptionist",
    features: [
      "Visitor log — name, purpose, who they're visiting, time in and out",
      "Phone call register — incoming and outgoing calls with notes",
      "Complaint management — log, assign, and track resolution of parent complaints",
      "Postal and dispatch register — incoming letters, parcels, and outgoing mail",
      "All front-office entries stamped with date, time, and the staff who logged them",
      "Quick search across all front-office logs by name, date, or type",
      "Export logs to PDF for records compliance",
    ],
    mockup: (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b px-4 py-3"><span className="text-sm font-bold text-gray-800">Today's Visitors</span></div>
        <div className="divide-y">
          {[
            {n:"Mr. Kofi Adu",p:"Parent — fee payment",t:"9:14 AM",s:"In"},
            {n:"Mrs. Grace Asante",p:"Parent — result query",t:"10:02 AM",s:"Out"},
            {n:"GES Inspector",p:"School inspection",t:"11:30 AM",s:"In"},
          ].map(v=>(
            <div key={v.n} className="px-4 py-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{v.n}</p>
                <p className="text-xs text-gray-400">{v.p} · {v.t}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${v.s==="In"?"bg-emerald-50 text-emerald-700":"bg-gray-100 text-gray-500"}`}>{v.s}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "online-exams",
    icon: Laptop,
    color: "indigo",
    category: "Academic",
    name: "Online Exams",
    tagline: "Set it. Students write it. Results instant.",
    description:
      "Create multiple-choice and written online exams. Students log in on their devices and write within the set window. Results are auto-marked for MCQs and submitted for manual marking for written answers.",
    who: "Teacher, Admin, Student",
    features: [
      "Question bank — build a library of questions by subject and topic",
      "Exam creation — select questions, set duration and available window",
      "Multiple choice auto-marking — instant results after submission",
      "Written/essay questions submitted for teacher review and marking",
      "Timed exam with automatic submission when time expires",
      "Student can see their result immediately after auto-marked exam",
      "Teacher gets a class performance summary after all submissions",
      "Exam access controlled by the admin — students can't open early",
      "Question shuffle — different order per student to reduce copying",
    ],
    mockup: (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-white">Mathematics Quiz — Term 2</span>
          <span className="text-xs bg-white/20 text-white font-bold px-2.5 py-1 rounded-full">⏱ 32:14 left</span>
        </div>
        <div className="p-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">Q4. If 3x + 7 = 22, what is the value of x?</p>
          <div className="space-y-2">
            {[{l:"A",v:"3",s:false},{l:"B",v:"5",s:true},{l:"C",v:"7",s:false},{l:"D",v:"9",s:false}].map(o=>(
              <div key={o.l} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${o.s?"bg-indigo-50 border-indigo-400":"border-gray-200 hover:bg-gray-50"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${o.s?"bg-indigo-600 text-white":"bg-gray-100 text-gray-600"}`}>{o.l}</span>
                <span className={`text-sm ${o.s?"text-indigo-700 font-semibold":"text-gray-700"}`}>{o.v}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <span className="text-xs text-gray-400">Question 4 of 20</span>
            <button className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold">Next →</button>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "homework",
    icon: FileText,
    color: "violet",
    category: "Academic",
    name: "Homework",
    tagline: "Assigned digitally. Submitted digitally. No lost books.",
    description:
      "Teachers assign homework with a due date and description. Students see it on their portal, submit responses or uploads, and teachers mark and return feedback — all in one place.",
    who: "Teacher, Student, Parent",
    features: [
      "Homework creation — subject, class/section, due date, instructions, and attachments",
      "Students see assigned homework on their portal dashboard",
      "Digital submission — students type answers or upload files",
      "Teacher marks and adds feedback per submission",
      "Parents see pending homework and submission status on parent portal",
      "Overdue homework flagged for teacher and parent",
      "Homework calendar view — see the week's assignments at a glance",
      "Homework history per student and per subject",
    ],
    mockup: (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b px-4 py-3"><span className="text-sm font-bold text-gray-800">Homework — This Week</span></div>
        <div className="divide-y">
          {[
            {s:"Mathematics",t:"Solve exercise 4.2 questions 1–10",d:"Tomorrow",sub:true},
            {s:"English",t:"Write a 3-paragraph composition on climate change",d:"Fri 13 Jun",sub:false},
            {s:"Science",t:"Label the parts of a plant cell diagram",d:"Fri 13 Jun",sub:false},
          ].map(h=>(
            <div key={h.s} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black text-violet-600 uppercase tracking-wider">{h.s}</span>
                  <p className="text-sm text-gray-800 mt-0.5">{h.t}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Due {h.d}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-1 ${h.sub?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"}`}>{h.sub?"Submitted":"Pending"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "notice",
    icon: Bell,
    color: "amber",
    category: "Communication",
    name: "Notice Board",
    tagline: "Announcements reach everyone. Instantly.",
    description:
      "Post notices to the whole school, a specific class, or a specific role. Staff, students, and parents see notices relevant to them on their dashboard. No more printing and pinning papers.",
    who: "Admin, Teacher, All roles (read)",
    features: [
      "Create notices with title, description, and optional file attachment",
      "Target notices to specific roles, classes, or the whole school",
      "Notices appear on the dashboard of every targeted user immediately",
      "Notice history — all past notices searchable by date and title",
      "Admin can delete or archive notices",
      "Students and parents see notices on their portal home screen",
    ],
    mockup: (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b px-4 py-3"><span className="text-sm font-bold text-gray-800">School Notices</span></div>
        <div className="divide-y">
          {[
            {t:"End of Term Examinations",d:"Posted 10 Jun · All Students",col:"bg-rose-50 border-rose-100"},
            {t:"PTA Meeting — Saturday 14 Jun",d:"Posted 9 Jun · All Parents",col:"bg-amber-50 border-amber-100"},
            {t:"Staff Welfare Meeting",d:"Posted 8 Jun · Teaching Staff",col:"bg-blue-50 border-blue-100"},
          ].map(n=>(
            <div key={n.t} className={`${n.col} mx-3 my-2 rounded-xl border px-3 py-2.5`}>
              <p className="text-sm font-semibold text-gray-900">{n.t}</p>
              <p className="text-xs text-gray-500 mt-0.5">{n.d}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "reports",
    icon: BarChart3,
    color: "indigo",
    category: "Administration",
    name: "Reports",
    tagline: "Every number your principal and board will ever ask for.",
    description:
      "Pre-built reports covering every aspect of the school — financial summaries, student demographics, attendance statistics, exam analysis, and more. Export any report as PDF or CSV.",
    who: "Admin, Accountant, Teacher",
    features: [
      "Financial report — total fees collected, outstanding balances, by term and by class",
      "Student demographic report — gender, class distribution, admission trends",
      "Attendance summary — school-wide and per-class average attendance rates",
      "Exam analysis — class average, highest/lowest score, subject-wise performance",
      "Staff report — headcount by department, designation, and employment type",
      "Library report — most borrowed books, overdue items, active members",
      "Transport report — route utilisation and assigned students",
      "All reports filterable by session and term",
      "One-click PDF export for board meetings and GES inspection",
    ],
    mockup: (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm p-4">
        <p className="text-sm font-bold text-gray-800 mb-4">Term 2 Summary Report</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[{l:"Fees Collected",v:"GH₵ 142,800",c:"text-violet-600"},{l:"Outstanding",v:"GH₵ 18,400",c:"text-rose-600"},{l:"Avg Attendance",v:"94.2%",c:"text-emerald-600"},{l:"Exam Average",v:"68.4%",c:"text-blue-600"}].map(s=>(
            <div key={s.l} className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{s.l}</p>
              <p className={`text-lg font-black mt-0.5 ${s.c}`}>{s.v}</p>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-1.5 h-16">
          {[{m:"Jan",p:55},{m:"Feb",p:70},{m:"Mar",p:88},{m:"Apr",p:65},{m:"May",p:92},{m:"Jun",p:75,h:true}].map(b=>(
            <div key={b.m} className="flex-1 flex flex-col items-center gap-0.5">
              <div className={`w-full rounded-t ${b.h?"bg-indigo-600":"bg-indigo-200"}`} style={{height:`${b.p}%`}}/>
              <span className="text-[8px] text-gray-400">{b.m}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; light: string; border: string }> = {
  blue:   { bg:"bg-blue-600",   text:"text-blue-600",   light:"bg-blue-50",   border:"border-blue-100" },
  violet: { bg:"bg-violet-600", text:"text-violet-600", light:"bg-violet-50", border:"border-violet-100" },
  emerald:{ bg:"bg-emerald-600",text:"text-emerald-600",light:"bg-emerald-50",border:"border-emerald-100"},
  indigo: { bg:"bg-indigo-600", text:"text-indigo-600", light:"bg-indigo-50", border:"border-indigo-100" },
  amber:  { bg:"bg-amber-500",  text:"text-amber-600",  light:"bg-amber-50",  border:"border-amber-100" },
  rose:   { bg:"bg-rose-600",   text:"text-rose-600",   light:"bg-rose-50",   border:"border-rose-100"  },
  teal:   { bg:"bg-teal-600",   text:"text-teal-600",   light:"bg-teal-50",   border:"border-teal-100"  },
  orange: { bg:"bg-orange-500", text:"text-orange-600", light:"bg-orange-50", border:"border-orange-100"},
  purple: { bg:"bg-purple-600", text:"text-purple-600", light:"bg-purple-50", border:"border-purple-100"},
  cyan:   { bg:"bg-cyan-600",   text:"text-cyan-600",   light:"bg-cyan-50",   border:"border-cyan-100"  },
  sky:    { bg:"bg-sky-600",    text:"text-sky-600",    light:"bg-sky-50",    border:"border-sky-100"   },
};

export default function FeaturesPage() {
  const categories = [...new Set(MODULES.map(m => m.category))];

  return (
    <div className="min-h-screen bg-white antialiased">

      <SkulaNav />

      {/* HERO */}
      <section className="bg-slate-950 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:"radial-gradient(circle at 1px 1px,rgba(255,255,255,0.04) 1px,transparent 0)", backgroundSize:"32px 32px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 text-slate-400 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            {MODULES.length} modules · Everything included · No add-ons
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-[1.02]">
            Every feature your<br />
            <span className="text-indigo-400">school will ever need.</span>
          </h1>
          <p className="mt-6 text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto">
            Skula is not a collection of bolt-on modules. Every feature below is included in every plan, fully connected, sharing one database — so data entered once flows everywhere.
          </p>
          {/* Category quick-links */}
          <div className="flex flex-wrap justify-center gap-2 mt-10">
            {categories.map(cat => (
              <a key={cat} href={`#${cat.toLowerCase()}`}
                 className="text-sm font-semibold text-slate-400 border border-white/10 bg-white/5 px-4 py-1.5 rounded-full hover:bg-white/10 transition-colors">
                {cat}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* MODULE SECTIONS */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-32">
        {categories.map(cat => (
          <div key={cat} id={cat.toLowerCase()}>
            {/* Category header */}
            <div className="flex items-center gap-4 mb-14">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">{cat}</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <div className="space-y-24">
              {MODULES.filter(m => m.category === cat).map((mod, idx) => {
                const Icon = mod.icon;
                const c = COLOR_MAP[mod.color] ?? COLOR_MAP.indigo;
                const isEven = idx % 2 === 0;

                return (
                  <div key={mod.id} id={mod.id}
                       className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${!isEven ? "lg:[&>*:first-child]:order-2" : ""}`}>

                    {/* Copy */}
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center shadow-lg`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className={`text-xs font-black uppercase tracking-widest ${c.text}`}>{cat}</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{mod.name}</h2>
                      <p className={`mt-1 text-lg font-bold ${c.text}`}>{mod.tagline}</p>
                      <p className="mt-4 text-gray-500 leading-relaxed">{mod.description}</p>

                      <div className={`mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${c.text} ${c.light} ${c.border} border px-3 py-1.5 rounded-full`}>
                        <UserCheck className="h-3 w-3" /> Used by: {mod.who}
                      </div>

                      <ul className="mt-7 space-y-2.5">
                        {mod.features.map(f => (
                          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                            <CheckCircle2 className={`h-4 w-4 ${c.text} shrink-0 mt-0.5`} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Mockup */}
                    <div className={`${c.light} ${c.border} border rounded-3xl p-8`}>
                      {mod.mockup}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM CTA */}
      <section className="bg-slate-950 py-24 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            All {MODULES.length} modules.<br />
            <span className="text-indigo-400">One price. Live in 2 minutes.</span>
          </h2>
          <p className="mt-5 text-slate-400 text-lg">No feature is locked behind a higher plan. Everything you read on this page is available from day one.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-black hover:bg-indigo-500 transition-colors shadow-2xl shadow-indigo-600/30">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="inline-flex items-center justify-center gap-2 border border-slate-700 text-slate-400 px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 hover:text-white transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center"><GraduationCap className="h-4 w-4 text-white"/></div>
            <span className="font-black text-white text-sm">Skula</span>
          </div>
          <p className="text-xs text-gray-700">© {new Date().getFullYear()} Novalss. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/" className="text-[13px] font-semibold text-slate-700 hover:text-gray-400">Home</Link>
            <Link href="/#pricing" className="text-[13px] font-semibold text-slate-700 hover:text-gray-400">Pricing</Link>
            <Link href="/sign-in" className="text-[13px] font-semibold text-slate-700 hover:text-gray-400">Sign in</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
