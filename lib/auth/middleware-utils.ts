export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "TEACHER"
  | "ACCOUNTANT"
  | "LIBRARIAN"
  | "STUDENT"
  | "PARENT";

// Routes accessible without authentication
const PUBLIC_PREFIXES = [
  "/api/auth", "/sign-in", "/apply", "/_next", "/favicon",
  "/novalss-admin", "/register", "/api/admin",
  "/images",           // static public assets
  "/features",         // public marketing page
  "/forgot-password",  // password reset flow
  "/reset-password",   // password reset flow
];

export function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// Route prefix → minimum roles that can access it
const ROUTE_PERMISSIONS: Array<{ prefix: string; roles: UserRole[] }> = [
  // File upload (any authenticated user)
  { prefix: "/api/upload", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT"] },
  { prefix: "/admin/system", roles: ["SUPER_ADMIN"] },
  {
    prefix: "/admin",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    prefix: "/users",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    prefix: "/students",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    prefix: "/attendance",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    prefix: "/marks",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    prefix: "/homework",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    prefix: "/fees/invoices",
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
  },
  {
    prefix: "/fees",
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
  },
  {
    prefix: "/payroll",
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
  },
  {
    prefix: "/parent",
    roles: ["SUPER_ADMIN", "ADMIN", "PARENT"],
  },
  // ── Student portal ──
  { prefix: "/my-results",    roles: ["SUPER_ADMIN", "ADMIN", "STUDENT"] },
  { prefix: "/my-attendance", roles: ["SUPER_ADMIN", "ADMIN", "STUDENT"] },
  { prefix: "/my-fees",       roles: ["SUPER_ADMIN", "ADMIN", "STUDENT"] },
  { prefix: "/my-homework",   roles: ["SUPER_ADMIN", "ADMIN", "STUDENT"] },
  {
    prefix: "/fees/pay",
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "STUDENT", "PARENT"],
  },
  {
    prefix: "/subject-groups",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  // Shared routes
  {
    prefix: "/timetable",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    prefix: "/results",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    prefix: "/staff",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    prefix: "/departments",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    prefix: "/designations",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    prefix: "/homework",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    prefix: "/dashboard",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT"],
  },
  // Exam & academic
  {
    prefix: "/exam-groups",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    prefix: "/exams",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    prefix: "/online-exams",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT"],
  },
  // Finance
  {
    prefix: "/finance",
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
  },
  {
    prefix: "/leave",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  // Library
  {
    prefix: "/library",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "LIBRARIAN", "STUDENT"],
  },
  // Transport
  {
    prefix: "/transport",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  // Hostel
  {
    prefix: "/hostel",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  // Inventory
  {
    prefix: "/inventory",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  // Front office
  {
    prefix: "/front-office",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  // Admissions
  {
    prefix: "/admissions",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  // Reports
  {
    prefix: "/reports",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT"],
  },
  // Notifications
  {
    prefix: "/notifications",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT"],
  },
  // Audit log
  {
    prefix: "/audit-log",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  // API routes for new modules
  {
    prefix: "/api/admissions",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  // Settings
  {
    prefix: "/settings",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  // Lesson plans
  {
    prefix: "/lesson-plans",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  // Notice board
  {
    prefix: "/notice-board",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT"],
  },
  // Messaging
  {
    prefix: "/messaging",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  // Chat
  {
    prefix: "/chat",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT"],
  },
  {
    prefix: "/api/chat",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT"],
  },
  // School profile API
  {
    prefix: "/api/school-profile",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  // Settings APIs
  { prefix: "/api/sessions",  roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/api/classes",   roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/api/sections",  roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/api/subjects",  roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  // Finance APIs
  { prefix: "/api/finance",   roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  // Library APIs
  { prefix: "/api/library",   roles: ["SUPER_ADMIN", "ADMIN", "LIBRARIAN", "TEACHER"] },
  // Inventory APIs
  { prefix: "/api/inventory", roles: ["SUPER_ADMIN", "ADMIN"] },
  // Mark divisions API
  { prefix: "/api/mark-divisions", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  // Front office APIs
  { prefix: "/api/front-office", roles: ["SUPER_ADMIN", "ADMIN"] },
  // Attendance types (read-only, used by attendance forms)
  { prefix: "/api/attendance-types", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  // Notices API
  { prefix: "/api/notices",   roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  // Messaging API
  { prefix: "/api/messaging", roles: ["SUPER_ADMIN", "ADMIN"] },
  // Online exams APIs
  { prefix: "/api/questions", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  { prefix: "/api/online-exams", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT"] },
  // Reports APIs
  { prefix: "/api/reports", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT"] },
  // Custom fields API
  { prefix: "/api/custom-fields",         roles: ["SUPER_ADMIN", "ADMIN"] },
  // Roles & permissions APIs
  { prefix: "/api/roles",                 roles: ["SUPER_ADMIN", "ADMIN"] },
  // Settings sub-APIs
  { prefix: "/api/holidays",              roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/api/holiday-types",         roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/api/school-houses",         roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/api/sources",               roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/api/references",            roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/api/email-config",          roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/api/notification-settings", roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/api/sms-config",            roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/api/attendance-settings",   roles: ["SUPER_ADMIN", "ADMIN"] },
  // Alumni
  { prefix: "/alumni",          roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/api/alumni",      roles: ["SUPER_ADMIN", "ADMIN"] },
  // Fees sub-routes
  { prefix: "/api/fees/types",             roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { prefix: "/api/fees/groups",            roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { prefix: "/api/fees/discounts/assign",  roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { prefix: "/api/fees/discounts",         roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  // Lesson plans API
  { prefix: "/api/lesson-plans", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  // Syllabus API
  { prefix: "/api/syllabus", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  // Grades API
  { prefix: "/api/grades", roles: ["SUPER_ADMIN", "ADMIN"] },
  // Subject groups API
  { prefix: "/api/subject-groups", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  // Class sections API (teacher assignment)
  { prefix: "/api/class-sections", roles: ["SUPER_ADMIN", "ADMIN"] },
  // Inventory suppliers and stores
  { prefix: "/api/inventory/suppliers", roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/api/inventory/stores",    roles: ["SUPER_ADMIN", "ADMIN"] },
  // Disable reasons
  { prefix: "/api/disable-reasons",    roles: ["SUPER_ADMIN", "ADMIN"] },
  // Fee reminders
  { prefix: "/api/fees/reminders",     roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  // Payment gateways
  { prefix: "/api/payment-gateways",   roles: ["SUPER_ADMIN", "ADMIN"] },
  // Online fee payment (initiate + verify accessible to all authenticated roles)
  { prefix: "/api/fees/pay",           roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "STUDENT", "PARENT"] },
  // Certificate templates
  { prefix: "/api/certificates",       roles: ["SUPER_ADMIN", "ADMIN"] },
  // Marksheet templates
  { prefix: "/api/marksheets",         roles: ["SUPER_ADMIN", "ADMIN"] },
  // Staff ID card templates
  { prefix: "/api/staff-id-cards",     roles: ["SUPER_ADMIN", "ADMIN"] },
  // Student & staff timelines
  { prefix: "/api/timelines",          roles: ["SUPER_ADMIN", "ADMIN"] },
  // Subject-level attendance
  { prefix: "/api/subject-attendance", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  // Share content
  { prefix: "/api/share-contents",     roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  // Admit card templates
  { prefix: "/api/admit-card-templates", roles: ["SUPER_ADMIN", "ADMIN"] },
  // Library members
  { prefix: "/api/library/members",      roles: ["SUPER_ADMIN", "ADMIN", "LIBRARIAN"] },
  // Broadcast notifications
  { prefix: "/api/notifications/send",   roles: ["SUPER_ADMIN", "ADMIN"] },
];

export function canAccessRoute(pathname: string, role: UserRole): boolean {
  // Find the most specific matching rule (longest prefix match)
  const match = ROUTE_PERMISSIONS.filter((rule) =>
    pathname.startsWith(rule.prefix)
  ).sort((a, b) => b.prefix.length - a.prefix.length)[0];

  if (!match) return false;
  return match.roles.includes(role);
}
