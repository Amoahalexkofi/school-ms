export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "TEACHER"
  | "ACCOUNTANT"
  | "LIBRARIAN"
  | "STUDENT"
  | "PARENT";

// Routes accessible without authentication
const PUBLIC_PREFIXES = ["/api/auth", "/sign-in", "/apply", "/_next", "/favicon"];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// Route prefix → minimum roles that can access it
const ROUTE_PERMISSIONS: Array<{ prefix: string; roles: UserRole[] }> = [
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
  // Student-facing routes
  {
    prefix: "/my-results",
    roles: ["SUPER_ADMIN", "ADMIN", "STUDENT"],
  },
  {
    prefix: "/fees/pay",
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "STUDENT", "PARENT"],
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
  // Front office APIs
  { prefix: "/api/front-office", roles: ["SUPER_ADMIN", "ADMIN"] },
  // Notices API
  { prefix: "/api/notices",   roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  // Messaging API
  { prefix: "/api/messaging", roles: ["SUPER_ADMIN", "ADMIN"] },
  // Fees sub-routes
  { prefix: "/api/fees/types",  roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { prefix: "/api/fees/groups", roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
];

export function canAccessRoute(pathname: string, role: UserRole): boolean {
  // Find the most specific matching rule (longest prefix match)
  const match = ROUTE_PERMISSIONS.filter((rule) =>
    pathname.startsWith(rule.prefix)
  ).sort((a, b) => b.prefix.length - a.prefix.length)[0];

  if (!match) return false;
  return match.roles.includes(role);
}
