/**
 * Permission-gate regression check.
 *
 * Walks every role through the two gates a real request passes — the coarse
 * role allowlist (canAccessApiRoute) and the granular matrix (ROLE_DEFAULTS +
 * moduleForApiPath + actionForMethod) — and asserts the outcome for the calls
 * each role actually makes.
 *
 * Run: npx tsx scripts/check-permission-gate.ts
 */
import { canAccessApiRoute, type UserRole } from "../lib/auth/middleware-utils";
import { ROLE_DEFAULTS, moduleForApiPath, actionForMethod } from "../lib/permission-defaults";

/** Mirrors isApiCallPermitted() in proxy.ts for a user with no custom AppRole. */
function granularAllows(role: string, pathname: string, method: string): boolean {
  const defaults = ROLE_DEFAULTS[role];
  if (defaults === null) return true;
  if (defaults === undefined) return false;
  const mod = moduleForApiPath(pathname);
  if (!mod) return true; // unmapped → coarse gate only
  return defaults[mod]?.[actionForMethod(method)] === true;
}

function allowed(role: string, pathname: string, method: string) {
  return canAccessApiRoute(pathname, role as UserRole) && granularAllows(role, pathname, method);
}

type Case = { role: string; path: string; method: string; want: boolean; why: string };

const CASES: Case[] = [
  // ── Portal roles must keep working ──
  { role: "STUDENT", path: "/api/chat", method: "GET", want: true, why: "read own conversations" },
  { role: "STUDENT", path: "/api/chat/abc", method: "POST", want: true, why: "send a message" },
  { role: "STUDENT", path: "/api/online-exams", method: "GET", want: true, why: "list exams" },
  { role: "STUDENT", path: "/api/online-exams/attempt", method: "POST", want: true, why: "start an attempt" },
  { role: "STUDENT", path: "/api/fees/pay", method: "POST", want: true, why: "initiate own payment" },
  { role: "STUDENT", path: "/api/timetable", method: "GET", want: true, why: "view timetable" },
  // Pre-existing coarse-gate behaviour, asserted so it can't drift silently:
  // /api/library and /api/homework are staff-only by design — STUDENT/PARENT
  // have no "homework" entry in ROLE_DEFAULTS, so the portal reads homework
  // data server-side. (proxy.ts carves out a narrow PATCH .../acknowledge
  // exception for the student submit action, not exercised by this script.)
  { role: "STUDENT", path: "/api/library", method: "GET", want: false, why: "/api/library is staff-only" },
  { role: "STUDENT", path: "/api/homework", method: "GET", want: false, why: "/api/homework is staff-only" },
  // /api/notifications/send GET is readable by every role (announcements
  // targeted at them); POST/DELETE is admin-only via a proxy.ts method
  // guard, not exercised by this script's coarse+granular check.
  { role: "STUDENT", path: "/api/notifications/send", method: "GET", want: true, why: "read announcements targeted at students" },

  { role: "PARENT", path: "/api/chat", method: "GET", want: true, why: "read conversations" },
  { role: "PARENT", path: "/api/chat/abc", method: "POST", want: true, why: "message the school" },
  { role: "PARENT", path: "/api/fees/pay", method: "POST", want: true, why: "pay a child's fees" },
  { role: "PARENT", path: "/api/timetable", method: "GET", want: true, why: "see timetable" },
  { role: "PARENT", path: "/api/homework", method: "GET", want: false, why: "/api/homework is staff-only" },

  { role: "RECEPTIONIST", path: "/api/front-office/visitors", method: "GET", want: true, why: "visitor book" },
  { role: "RECEPTIONIST", path: "/api/front-office/visitors", method: "POST", want: true, why: "log a visitor" },
  { role: "RECEPTIONIST", path: "/api/front-office/enquiries", method: "DELETE", want: true, why: "manage enquiries" },
  { role: "RECEPTIONIST", path: "/api/admissions", method: "POST", want: true, why: "unmapped → coarse only" },
  { role: "RECEPTIONIST", path: "/api/chat/abc", method: "POST", want: true, why: "message staff" },

  // ── The hole this change closes ──
  { role: "STUDENT", path: "/api/students", method: "GET", want: false, why: "no student roster" },
  { role: "STUDENT", path: "/api/students/x", method: "DELETE", want: false, why: "cannot delete students" },
  { role: "STUDENT", path: "/api/fees", method: "GET", want: false, why: "no school-wide fee data" },
  { role: "STUDENT", path: "/api/reports", method: "GET", want: false, why: "no reports" },
  { role: "STUDENT", path: "/api/staff", method: "GET", want: false, why: "no staff records" },
  { role: "PARENT", path: "/api/students", method: "GET", want: false, why: "no student roster" },
  { role: "PARENT", path: "/api/library", method: "GET", want: false, why: "not granted to parents" },
  { role: "RECEPTIONIST", path: "/api/fees", method: "GET", want: false, why: "no fee data" },
  { role: "RECEPTIONIST", path: "/api/staff", method: "GET", want: false, why: "no HR data" },
  { role: "RECEPTIONIST", path: "/api/students", method: "DELETE", want: false, why: "cannot delete students" },

  // ── Staff roles unchanged ──
  { role: "TEACHER", path: "/api/attendance", method: "POST", want: true, why: "mark attendance" },
  { role: "TEACHER", path: "/api/students", method: "GET", want: true, why: "view students" },
  { role: "TEACHER", path: "/api/students/x", method: "DELETE", want: false, why: "view-only on students" },
  { role: "TEACHER", path: "/api/fees", method: "GET", want: false, why: "no fee access" },
  { role: "ACCOUNTANT", path: "/api/fees/collect", method: "POST", want: true, why: "collect fees" },
  { role: "ACCOUNTANT", path: "/api/attendance", method: "POST", want: false, why: "not their module" },
  { role: "LIBRARIAN", path: "/api/library/issues", method: "POST", want: true, why: "issue a book" },
  { role: "LIBRARIAN", path: "/api/fees", method: "GET", want: false, why: "no fee access" },
  { role: "ADMIN", path: "/api/students/x", method: "DELETE", want: true, why: "unrestricted" },
  { role: "SUPER_ADMIN", path: "/api/students/x", method: "DELETE", want: true, why: "unrestricted" },
  // Deny-by-default binds even SUPER_ADMIN: a route with no coarse rule is
  // rejected, which is what makes canAccessApiRoute safe for new endpoints.
  { role: "SUPER_ADMIN", path: "/api/anything", method: "DELETE", want: false, why: "no coarse rule" },

  // ── An unknown role must be denied, not waved through ──
  { role: "NEW_ROLE_NOBODY_CONFIGURED", path: "/api/students", method: "GET", want: false, why: "deny by default" },
  { role: "NEW_ROLE_NOBODY_CONFIGURED", path: "/api/chat", method: "GET", want: false, why: "deny by default" },
];

let failed = 0;
for (const c of CASES) {
  const got = allowed(c.role, c.path, c.method);
  if (got !== c.want) {
    failed++;
    console.error(
      `FAIL  ${c.role.padEnd(28)} ${c.method.padEnd(6)} ${c.path.padEnd(34)} want=${c.want} got=${got}  (${c.why})`
    );
  }
}

// Every role in the coarse allowlist must have a granular entry.
const ROLES = ["SUPER_ADMIN","ADMIN","TEACHER","ACCOUNTANT","LIBRARIAN","STUDENT","PARENT","RECEPTIONIST"];
for (const r of ROLES) {
  if (!(r in ROLE_DEFAULTS)) {
    failed++;
    console.error(`FAIL  role ${r} has no ROLE_DEFAULTS entry — it would be denied everything`);
  }
}

console.log(`${CASES.length + ROLES.length} checks, ${failed} failed`);
process.exit(failed ? 1 : 0);
