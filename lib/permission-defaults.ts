// Pure permission data shared by the UI provider (lib/services/permissions.ts)
// and the middleware enforcement gate (proxy.ts). This module must stay free of
// Prisma/db imports — proxy.ts bundles it into the middleware runtime.

export type PermEntry = { canView: boolean; canAdd: boolean; canEdit: boolean; canDelete: boolean };
export type PermissionMap = Record<string, PermEntry>;

const ALLOW: PermEntry = { canView: true,  canAdd: true,  canEdit: true,  canDelete: true  };
const VIEW:  PermEntry = { canView: true,  canAdd: false, canEdit: false, canDelete: false };
const WRITE: PermEntry = { canView: true,  canAdd: true,  canEdit: true,  canDelete: false };

export const ALLOW_ALL: PermEntry = ALLOW;

/**
 * Default permissions per auth role.
 * null = unrestricted (SUPER_ADMIN / ADMIN).
 * Non-null = restricted to listed modules; Super Admin can extend via AppRole.
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
};

export function mergePerms(base: PermissionMap, extra: PermissionMap): PermissionMap {
  const result: PermissionMap = { ...base };
  for (const [code, entry] of Object.entries(extra)) {
    if (result[code]) {
      result[code] = {
        canView:   result[code].canView   || entry.canView,
        canAdd:    result[code].canAdd    || entry.canAdd,
        canEdit:   result[code].canEdit   || entry.canEdit,
        canDelete: result[code].canDelete || entry.canDelete,
      };
    } else {
      result[code] = entry;
    }
  }
  return result;
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
