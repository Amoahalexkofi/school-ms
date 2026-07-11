export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "TEACHER"
  | "ACCOUNTANT"
  | "LIBRARIAN"
  | "STUDENT"
  | "PARENT"
  | "RECEPTIONIST";

// Routes accessible without authentication
const PUBLIC_PREFIXES = [
  "/api/auth", "/sign-in", "/apply", "/_next", "/favicon",
  "/api/cron",          // scheduled jobs — secured by CRON_SECRET internally
  "/api/admissions/apply", // public admission application submission (POST only)
  "/novalss-admin", "/api/admin",
  "/images",           // static public assets
  "/features",         // public marketing page
  "/landing-preview",  // design-experiment preview of the landing page (noindex)
  "/forgot-password",  // password reset flow
  "/reset-password",   // password reset flow
  "/contact",          // contact form
  "/terms",            // public terms & conditions
  "/privacy",          // public privacy policy
  "/demo",             // demo auto-login
  "/robots.txt",       // SEO crawl directives
  "/sitemap.xml",      // SEO sitemap
  "/manifest.json",    // PWA manifest
  "/sw.js",            // service worker
  "/offline.html",     // offline fallback
  "/icons/",           // PWA icons
  "/opengraph-image",  // social share card (Next metadata route)
  "/twitter-image",    // social share card (Next metadata route)
  "/icon",             // favicon (app/icon.png → /icon.png)
  "/apple-icon",       // apple touch icon (app/apple-icon.png)
];

export function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// Route prefix → minimum roles that can access it
const ROUTE_PERMISSIONS: Array<{ prefix: string; roles: UserRole[] }> = [
  // File upload (any authenticated user)
  { prefix: "/api/upload", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT"] },
  // Self-service account (change password) — every authenticated role. Covers
  // both the /account page and the /api/account endpoint (stripped-path match).
  { prefix: "/account", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT", "RECEPTIONIST"] },
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
  // Accountants need the student search API for fee collection (Collect Fees
  // looks up students by class/name). Longest-prefix wins, so this opens ONLY
  // /api/students — the /students management pages stay admin/teacher-only.
  {
    prefix: "/api/students",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT"],
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
    // Students & parents may view THEIR OWN receipt (ownership enforced in the
    // page). Longest-prefix match makes this win over the staff-only /fees rule.
    prefix: "/fees/receipt",
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "STUDENT", "PARENT"],
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
  { prefix: "/onboarding",    roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/my-results",    roles: ["SUPER_ADMIN", "ADMIN", "STUDENT"] },
  { prefix: "/my-attendance", roles: ["SUPER_ADMIN", "ADMIN", "STUDENT"] },
  { prefix: "/my-fees",       roles: ["SUPER_ADMIN", "ADMIN", "STUDENT"] },
  { prefix: "/my-homework",   roles: ["SUPER_ADMIN", "ADMIN", "STUDENT"] },
  { prefix: "/my-leave",      roles: ["SUPER_ADMIN", "ADMIN", "STUDENT"] },
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
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT", "RECEPTIONIST"],
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
    roles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"],
  },
  // Admissions
  {
    prefix: "/admissions",
    roles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"],
  },
  // Reports
  {
    prefix: "/reports",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT"],
  },
  // Notifications
  {
    prefix: "/notifications",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT", "RECEPTIONIST"],
  },
  // Audit log
  {
    prefix: "/audit-log",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  { prefix: "/api/audit-log", roles: ["SUPER_ADMIN", "ADMIN"] },
  // Branches (Multi Branch add-on)
  {
    prefix: "/branches",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    prefix: "/api/branches",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN"],
  },
  // API routes for new modules
  {
    prefix: "/api/admissions",
    roles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"],
  },
  // Settings
  {
    prefix: "/settings",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  // School website management
  {
    prefix: "/website",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    prefix: "/api/website",
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
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT", "RECEPTIONIST"],
  },
  // Messaging
  {
    prefix: "/messaging",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  // Chat
  {
    prefix: "/chat",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT", "RECEPTIONIST"],
  },
  {
    prefix: "/api/chat",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT", "RECEPTIONIST"],
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
  // Grade ranges (canonical grading scale)
  { prefix: "/api/grade-ranges",   roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  // Front office APIs
  { prefix: "/api/front-office", roles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"] },
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
  { prefix: "/api/whatsapp-config",       roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/settings/whatsapp",         roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/api/attendance-settings",   roles: ["SUPER_ADMIN", "ADMIN"] },
  // Alumni
  { prefix: "/alumni",          roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/api/alumni",      roles: ["SUPER_ADMIN", "ADMIN"] },
  // Fees sub-routes
  { prefix: "/api/fees/types",             roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { prefix: "/api/fees/groups",            roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { prefix: "/api/fees/discounts/assign",  roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { prefix: "/api/fees/discounts",         roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  // Lesson plan API (lessons → topics, copy old lesson, weekly syllabus scheduler)
  { prefix: "/api/lessons", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  { prefix: "/api/topics", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
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
  // Student ID card templates
  { prefix: "/api/id-card",            roles: ["SUPER_ADMIN", "ADMIN"] },
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
  // Parent ↔ student linking
  { prefix: "/api/parents",              roles: ["SUPER_ADMIN", "ADMIN"] },
];

export function canAccessRoute(pathname: string, role: UserRole): boolean {
  // Find the most specific matching rule (longest prefix match)
  const match = ROUTE_PERMISSIONS.filter((rule) =>
    pathname.startsWith(rule.prefix)
  ).sort((a, b) => b.prefix.length - a.prefix.length)[0];

  if (!match) return false;
  return match.roles.includes(role);
}

/**
 * Authorization for API routes. An /api/<x> endpoint requires the SAME role as
 * its resource: we match against both the literal API path (for explicit
 * "/api/..." rules) AND the page-equivalent path (strip the leading "/api"),
 * taking the most specific (longest-prefix) matching rule.
 *
 * DENY-BY-DEFAULT: an API route with no matching rule is rejected. Public
 * endpoints (auth, cron, public application submit) are handled earlier by
 * isPublicRoute() and never reach here, so they are unaffected. Any new
 * authenticated API route MUST add a rule above or it will 403.
 */
export function canAccessApiRoute(pathname: string, role: UserRole): boolean {
  const stripped = pathname.replace(/^\/api/, "") || "/";
  const matches = ROUTE_PERMISSIONS.filter(
    (rule) => pathname.startsWith(rule.prefix) || stripped.startsWith(rule.prefix)
  );
  if (matches.length === 0) return false; // no rule → deny (was: allow-any, a fail-open hole)
  const best = matches.sort((a, b) => b.prefix.length - a.prefix.length)[0];
  return best.roles.includes(role);
}
