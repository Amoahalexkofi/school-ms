// Pure permission data shared by the UI provider (lib/services/permissions.ts)
// and the middleware enforcement gate (proxy.ts). This module must stay free of
// Prisma/db imports — proxy.ts bundles it into the middleware runtime.

export type PermEntry = { canView: boolean; canAdd: boolean; canEdit: boolean; canDelete: boolean };
export type PermissionMap = Record<string, PermEntry>;

const ALLOW: PermEntry = { canView: true,  canAdd: true,  canEdit: true,  canDelete: true  };
const VIEW:  PermEntry = { canView: true,  canAdd: false, canEdit: false, canDelete: false };
const WRITE: PermEntry = { canView: true,  canAdd: true,  canEdit: true,  canDelete: false };
// Read plus create-own — portal actions like sending a chat message, starting
// an online-exam attempt, or initiating a fee payment.
const SUBMIT: PermEntry = { canView: true, canAdd: true, canEdit: false, canDelete: false };

export const ALLOW_ALL: PermEntry = ALLOW;

/**
 * Default permissions per auth role.
 * null = unrestricted (SUPER_ADMIN / ADMIN) — a deliberate choice.
 * Non-null = restricted to listed modules; a custom AppRole (Settings →
 * Roles & Permissions) can both extend and restrict these per module — see
 * mergePerms below.
 *
 * EVERY role must appear here. A role that is merely *absent* reads as
 * `undefined`, and callers that treat `undefined` like `null` hand it full
 * access — which is exactly how STUDENT, PARENT and RECEPTIONIST used to skip
 * the granular gate entirely. Adding a role to UserRole without adding it here
 * is now a denial, not a bypass.
 */
export const ROLE_DEFAULTS: Record<string, PermissionMap | null> = {
  SUPER_ADMIN: null,
  ADMIN:       null,

  TEACHER: {
    student_information:  VIEW,   // see students, not add/edit/delete
    student_attendance:   ALLOW,  // mark attendance
    examination:          ALLOW,  // create exams, enter marks
    academics:            ALLOW,  // timetable, subjects, results
    homework:             ALLOW,
    behaviour:            WRITE,  // log incidents; admins delete
    lesson_plan:          ALLOW,
    online_examination:   ALLOW,
    communicate:          WRITE,  // post notices, not delete
    chat:                 ALLOW,
    library:              VIEW,   // search only
    reports:              VIEW,
  },

  ACCOUNTANT: {
    student_information:  VIEW,   // read-only (find students for fees)
    fees_collection:      ALLOW,
    expense:              ALLOW,
    human_resource:       VIEW,   // view payroll, not edit staff
    reports:              VIEW,
    communicate:          VIEW,
    chat:                 ALLOW,
  },

  LIBRARIAN: {
    student_information:  VIEW,   // find borrowers
    library:              ALLOW,
    communicate:          VIEW,
    chat:                 ALLOW,
  },

  RECEPTIONIST: {
    front_office:         ALLOW,  // visitors, enquiries, calls, dispatch
    chat:                 WRITE,
  },

  // Portal roles. These mirror what the coarse gate (canAccessApiRoute)
  // already allows, so today's access is unchanged — the point is that the
  // matrix now *governs* them instead of waving them through.
  // Homework and library are deliberately absent: the coarse gate already
  // denies STUDENT/PARENT on /api/homework and /api/library, so the portals
  // read that data server-side. Listing them here would grant access these
  // roles have never had.
  STUDENT: {
    chat:                 WRITE,
    online_examination:   SUBMIT, // start/submit own attempt; proxy's method
                                  // guard still blocks create/edit/publish
    fees_collection:      SUBMIT, // initiate own payment (/api/fees/pay)
    academics:            VIEW,   // timetable
  },

  PARENT: {
    chat:                 WRITE,
    fees_collection:      SUBMIT, // pay a child's fees
    academics:            VIEW,
  },
};

// A custom AppRole's entry for a module is authoritative — it can grant
// access the base auth-role default lacks, and it can just as validly revoke
// access the default has (e.g. View allowed, Delete explicitly withheld).
// Module codes the custom role never touches at all fall back to the base
// default. Without this, "Roles & Permissions" could show a box unchecked
// while the auth-role baseline silently kept granting it underneath.
export function mergePerms(base: PermissionMap, extra: PermissionMap): PermissionMap {
  return { ...base, ...extra };
}

// ── API-route → permission-module mapping (middleware enforcement) ────────────
// Longest prefix wins. Prefixes NOT listed are governed only by the coarse
// role gate (canAccessApiRoute) — notably self-service routes like /api/leave
// (staff's own leave), /api/account, /api/notifications, /api/upload.

const API_MODULE_MAP: { prefix: string; module: string }[] = [
  { prefix: "/api/students",            module: "student_information" },
  { prefix: "/api/attendance",          module: "student_attendance" },
  { prefix: "/api/attendance-types",    module: "student_attendance" },
  { prefix: "/api/attendance-settings", module: "student_attendance" },
  { prefix: "/api/subject-attendance",  module: "student_attendance" },
  { prefix: "/api/exams",               module: "examination" },
  { prefix: "/api/grade-ranges",        module: "examination" },
  { prefix: "/api/mark-divisions",      module: "examination" },
  { prefix: "/api/marksheets",          module: "examination" },
  { prefix: "/api/homework",            module: "homework" },
  { prefix: "/api/behaviour",           module: "behaviour" },
  { prefix: "/api/lessons",             module: "lesson_plan" },
  { prefix: "/api/topics",              module: "lesson_plan" },
  { prefix: "/api/syllabus",            module: "lesson_plan" },
  { prefix: "/api/online-exams",        module: "online_examination" },
  { prefix: "/api/questions",           module: "online_examination" },
  { prefix: "/api/notices",             module: "communicate" },
  { prefix: "/api/messaging",           module: "communicate" },
  { prefix: "/api/chat",                module: "chat" },
  { prefix: "/api/library",             module: "library" },
  { prefix: "/api/reports",             module: "reports" },
  { prefix: "/api/fees",                module: "fees_collection" },
  { prefix: "/api/finance",             module: "expense" },
  { prefix: "/api/staff",               module: "human_resource" },
  { prefix: "/api/admissions",          module: "front_office" },
  { prefix: "/api/timetable",           module: "academics" },
  { prefix: "/api/subjects",            module: "academics" },
  { prefix: "/api/subject-groups",      module: "academics" },
  { prefix: "/api/transport",           module: "transport" },
  { prefix: "/api/hostel",              module: "hostel" },
  { prefix: "/api/inventory",           module: "inventory" },
  { prefix: "/api/front-office",        module: "front_office" },
  { prefix: "/api/alumni",              module: "alumni" },
];

export function moduleForApiPath(pathname: string): string | null {
  let best: { prefix: string; module: string } | null = null;
  for (const rule of API_MODULE_MAP) {
    if (pathname.startsWith(rule.prefix) && (!best || rule.prefix.length > best.prefix.length)) {
      best = rule;
    }
  }
  return best?.module ?? null;
}

export function actionForMethod(method: string): keyof PermEntry {
  switch (method.toUpperCase()) {
    case "POST":   return "canAdd";
    case "PATCH":
    case "PUT":    return "canEdit";
    case "DELETE": return "canDelete";
    default:       return "canView"; // GET / HEAD / OPTIONS
  }
}
