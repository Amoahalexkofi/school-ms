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
 * null = unconditionally unrestricted, skips the granular gate entirely —
 * reserved for SUPER_ADMIN only. Every other role, ADMIN included, gets a
 * real (if broad) default PermissionMap: a custom AppRole (Settings →
 * Roles & Permissions, or a staff member's own Permissions page) can both
 * extend AND restrict it per module — see mergePerms below. Without a real
 * default here, a custom override could never actually take anything away
 * from that role, because the code would never consult it in the first place.
 *
 * EVERY role must appear here. A role that is merely *absent* reads as
 * `undefined`, and callers that treat `undefined` like `null` hand it full
 * access — which is exactly how STUDENT, PARENT and RECEPTIONIST used to skip
 * the granular gate entirely. Adding a role to UserRole without adding it here
 * is now a denial, not a bypass.
 */
export const ROLE_DEFAULTS: Record<string, PermissionMap | null> = {
  SUPER_ADMIN: null,

  // Full trust by default — matches every admin account's access today — but
  // now a real map, so Super Admin can dial an individual admin back via a
  // custom AppRole (e.g. remove Settings for one person) instead of the
  // permission grid being cosmetic for anyone in this role.
  ADMIN: {
    student_information: ALLOW,
    student_attendance:  ALLOW,
    examination:         ALLOW,
    academics:            ALLOW,
    homework:             ALLOW,
    behaviour:            ALLOW,
    lesson_plan:          ALLOW,
    online_examination:   ALLOW,
    communicate:          ALLOW,
    chat:                 ALLOW,
    library:              ALLOW,
    reports:              ALLOW,
    calendar:             ALLOW,
    fees_collection:      ALLOW,
    expense:              ALLOW,
    human_resource:       ALLOW,
    front_office:         ALLOW,
    transport:            ALLOW,
    hostel:               ALLOW,
    inventory:            ALLOW,
    alumni:               ALLOW,
    system_settings:      ALLOW,
  },

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
    calendar:             ALLOW,  // school-wide events + own tasks
  },

  ACCOUNTANT: {
    student_information:  VIEW,   // read-only (find students for fees)
    fees_collection:      ALLOW,
    expense:              ALLOW,
    human_resource:       VIEW,   // read-only /api/staff (look staff up for fees/payroll, not edit their record)
    reports:              VIEW,
    communicate:          VIEW,
    chat:                 ALLOW,
    calendar:             ALLOW,  // own tasks; school-wide events are view-only (enforced in-route)
  },

  LIBRARIAN: {
    student_information:  VIEW,   // find borrowers
    library:              ALLOW,
    communicate:          VIEW,
    chat:                 ALLOW,
    calendar:             ALLOW,  // own tasks; school-wide events are view-only (enforced in-route)
  },

  RECEPTIONIST: {
    front_office:         ALLOW,  // visitors, enquiries, calls, dispatch
    chat:                 WRITE,
    calendar:             ALLOW,  // own tasks; school-wide events are view-only (enforced in-route)
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
    calendar:             WRITE,  // view school events + own private tasks; can't post school-wide events (enforced in-route)
  },

  PARENT: {
    chat:                 WRITE,
    fees_collection:      SUBMIT, // pay a child's fees
    academics:            VIEW,
    calendar:             WRITE,  // view school events + own private tasks; can't post school-wide events (enforced in-route)
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
  { prefix: "/api/payroll",             module: "human_resource" },
  { prefix: "/api/admissions",          module: "front_office" },
  { prefix: "/api/timetable",           module: "academics" },
  { prefix: "/api/subjects",            module: "academics" },
  { prefix: "/api/subject-groups",      module: "academics" },
  { prefix: "/api/transport",           module: "transport" },
  { prefix: "/api/hostel",              module: "hostel" },
  { prefix: "/api/inventory",           module: "inventory" },
  { prefix: "/api/front-office",        module: "front_office" },
  { prefix: "/api/alumni",              module: "alumni" },
  { prefix: "/api/calendar",            module: "calendar" },
  // Settings — everything below was previously coarse-gate-only
  // (SUPER_ADMIN/ADMIN), which is why removing "Settings" from an admin's
  // custom permissions had no effect: nothing here ever consulted the
  // granular map. NOT included: /api/branches — its GET routes are also
  // used by non-admin roles for the branch switcher, so folding it in here
  // would silently break that for TEACHER/ACCOUNTANT/LIBRARIAN.
  { prefix: "/api/audit-log",           module: "system_settings" },
  { prefix: "/api/website",             module: "system_settings" },
  { prefix: "/api/school-profile",      module: "system_settings" },
  { prefix: "/api/custom-fields",       module: "system_settings" },
  { prefix: "/api/holidays",            module: "system_settings" },
  { prefix: "/api/holiday-types",       module: "system_settings" },
  { prefix: "/api/school-houses",       module: "system_settings" },
  { prefix: "/api/sources",             module: "system_settings" },
  { prefix: "/api/references",          module: "system_settings" },
  { prefix: "/api/email-config",        module: "system_settings" },
  { prefix: "/api/notification-settings", module: "system_settings" },
  { prefix: "/api/sms-config",          module: "system_settings" },
  { prefix: "/api/whatsapp-config",     module: "system_settings" },
  { prefix: "/api/attendance-settings", module: "system_settings" },
  { prefix: "/api/roles",               module: "system_settings" },
  { prefix: "/api/payment-gateways",    module: "system_settings" },
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
