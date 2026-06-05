import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Action = "canView" | "canAdd" | "canEdit" | "canDelete";

/**
 * Check if the current logged-in user has a specific permission.
 * Super Admin (isSuperAdmin role OR UserRole.SUPER_ADMIN) always returns true.
 * Falls back to true for SUPER_ADMIN/ADMIN UserRole if no AppRole assigned.
 */
export async function hasPermission(shortCode: string, action: Action = "canView"): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  // Super Admin at UserRole level always has full access
  const userRole = (session.user as any).role as string | undefined;
  if (userRole === "SUPER_ADMIN") return true;

  // Lookup the staff's AppRole
  const staffRole = await (prisma as any).staffAppRole.findFirst({
    where: { staff: { userId: session.user.id } },
    include: {
      role: {
        include: {
          permissions: {
            include: { permCat: true },
          },
        },
      },
    },
  });

  if (!staffRole) {
    // No AppRole assigned — fall back to UserRole-based defaults
    if (userRole === "ADMIN") return true;
    if (userRole === "TEACHER" && ["student_attendance", "homework", "student", "subject"].includes(shortCode)) return true;
    if (userRole === "ACCOUNTANT" && ["income", "expense", "collect_fees", "fees_type", "fees_group", "search_fees_payment", "search_due_fees"].includes(shortCode)) return true;
    if (userRole === "LIBRARIAN" && ["books", "issue_return"].includes(shortCode)) return true;
    return false;
  }

  if (staffRole.role.isSuperAdmin) return true;

  const perm = staffRole.role.permissions.find(
    (p: any) => p.permCat.shortCode === shortCode
  );
  if (!perm) return false;
  return perm[action] === true;
}

/**
 * Get all permissions for the current user as a flat map.
 * { "student": { canView: true, canAdd: true, ... }, ... }
 */
export async function getUserPermissions(): Promise<Record<string, Record<Action, boolean>>> {
  const session = await auth();
  if (!session?.user?.id) return {};
  if ((session.user as any).role === "SUPER_ADMIN") return {}; // handled separately

  const staffRole = await (prisma as any).staffAppRole.findFirst({
    where: { staff: { userId: session.user.id } },
    include: {
      role: {
        include: {
          permissions: { include: { permCat: true } },
        },
      },
    },
  });

  if (!staffRole) return {};
  if (staffRole.role.isSuperAdmin) return {};

  const map: Record<string, Record<Action, boolean>> = {};
  for (const p of staffRole.role.permissions) {
    map[p.permCat.shortCode] = {
      canView:   p.canView,
      canAdd:    p.canAdd,
      canEdit:   p.canEdit,
      canDelete: p.canDelete,
    };
  }
  return map;
}
