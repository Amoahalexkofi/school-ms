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
    prefix: "/dashboard",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT"],
  },
];

export function canAccessRoute(pathname: string, role: UserRole): boolean {
  // Find the most specific matching rule (longest prefix match)
  const match = ROUTE_PERMISSIONS.filter((rule) =>
    pathname.startsWith(rule.prefix)
  ).sort((a, b) => b.prefix.length - a.prefix.length)[0];

  if (!match) return false;
  return match.roles.includes(role);
}
