import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "TEACHER"];

/**
 * Server-side guard for staff-only pages that live under a route prefix shared
 * with students (e.g. /online-exams/*). Middleware allows students to reach the
 * prefix so they can take exams, so the authoring pages must reject non-staff
 * themselves. Redirects students/parents to a safe fallback.
 */
export async function requireStaffPage(fallback = "/dashboard"): Promise<string> {
  const session = await auth();
  const role = (session?.user as any)?.role ?? "";
  if (!STAFF_ROLES.includes(role)) redirect(fallback);
  return role;
}
