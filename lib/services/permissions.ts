import { getDb } from "@/lib/db";

export type PermEntry = { canView: boolean; canAdd: boolean; canEdit: boolean; canDelete: boolean };
export type PermissionMap = Record<string, PermEntry>;

const ALLOW_ALL: PermEntry = { canView: true, canAdd: true, canEdit: true, canDelete: true };

/**
 * Returns a PermissionMap for the given userId, or null if the user has no
 * AppRole assigned (meaning: no custom restrictions — auth role applies as-is).
 *
 * Keys are both group shortCodes (e.g. "student_information") and category
 * shortCodes (e.g. "student_admission"). Group-level canView = true if any
 * category in that group has canView: true.
 */
export async function getUserPermissions(userId: string): Promise<PermissionMap | null> {
  try {
    const db = await getDb();

    // Find the staff member linked to this user
    const staff = await (db as any).staff.findUnique({
      where: { userId },
      select: { id: true },
    }).catch(() => null);

    if (!staff) return null;

    // Find their custom AppRole assignment
    const staffAppRole = await (db as any).staffAppRole.findUnique({
      where: { staffId: staff.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permCat: {
                  include: { permGroup: true },
                },
              },
            },
          },
        },
      },
    }).catch(() => null);

    if (!staffAppRole) return null; // no custom role → use auth-role defaults

    if (staffAppRole.role.isSuperAdmin) return null; // super admin = unrestricted

    const map: PermissionMap = {};

    for (const perm of staffAppRole.role.permissions) {
      const catCode   = perm.permCat.shortCode as string;
      const groupCode = perm.permCat.permGroup.shortCode as string;

      // Category-level entry
      map[catCode] = {
        canView:   Boolean(perm.canView),
        canAdd:    Boolean(perm.canAdd),
        canEdit:   Boolean(perm.canEdit),
        canDelete: Boolean(perm.canDelete),
      };

      // Group-level entry: OR together all categories in the group
      if (!map[groupCode]) {
        map[groupCode] = { canView: false, canAdd: false, canEdit: false, canDelete: false };
      }
      map[groupCode].canView   = map[groupCode].canView   || Boolean(perm.canView);
      map[groupCode].canAdd    = map[groupCode].canAdd    || Boolean(perm.canAdd);
      map[groupCode].canEdit   = map[groupCode].canEdit   || Boolean(perm.canEdit);
      map[groupCode].canDelete = map[groupCode].canDelete || Boolean(perm.canDelete);
    }

    return map;
  } catch {
    return null;
  }
}

export { ALLOW_ALL };
