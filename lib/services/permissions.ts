import { getDb } from "@/lib/db";
import {
  ROLE_DEFAULTS,
  mergePerms,
  ALLOW_ALL,
  type PermEntry,
  type PermissionMap,
} from "@/lib/permission-defaults";

export type { PermEntry, PermissionMap };
export { ALLOW_ALL };

/**
 * Returns a PermissionMap for this userId, or null if unrestricted.
 *
 * Logic:
 * 1. SUPER_ADMIN / ADMIN → null (full access)
 * 2. TEACHER / ACCOUNTANT / LIBRARIAN → start with role defaults
 * 3. If they also have a custom AppRole assigned, MERGE (OR) defaults + custom
 *    so custom permissions only ever ADD to defaults, never remove
 * 4. If custom AppRole has isSuperAdmin → null (full access)
 */
export async function getUserPermissions(userId: string): Promise<PermissionMap | null> {
  try {
    const db = await getDb();

    const user = await (db as any).user.findUnique({
      where: { id: userId },
      select: { role: true },
    }).catch(() => null);

    if (!user) return null;

    const authRole = user.role as string;
    const defaults = ROLE_DEFAULTS[authRole];

    // ADMIN / SUPER_ADMIN → unrestricted (an explicit null in ROLE_DEFAULTS).
    if (defaults === null) return null;
    // A role with no entry is not "unrestricted", it is unconfigured — show it
    // nothing rather than everything.
    if (defaults === undefined) return {};

    // Find staff record for custom AppRole lookup
    const staff = await (db as any).staff.findUnique({
      where: { userId },
      select: { id: true },
    }).catch(() => null);

    if (!staff) return defaults;

    const staffAppRole = await (db as any).staffAppRole.findUnique({
      where: { staffId: staff.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permCat: { include: { permGroup: true } },
              },
            },
          },
        },
      },
    }).catch(() => null);

    // No custom AppRole → return auth-role defaults
    if (!staffAppRole) return defaults;

    // Custom role marked as super admin → unrestricted
    if (staffAppRole.role.isSuperAdmin) return null;

    // Build custom permission map
    const customMap: PermissionMap = {};
    for (const perm of staffAppRole.role.permissions) {
      const catCode   = perm.permCat.shortCode as string;
      const groupCode = perm.permCat.permGroup.shortCode as string;

      customMap[catCode] = {
        canView:   Boolean(perm.canView),
        canAdd:    Boolean(perm.canAdd),
        canEdit:   Boolean(perm.canEdit),
        canDelete: Boolean(perm.canDelete),
      };

      if (!customMap[groupCode]) {
        customMap[groupCode] = { canView: false, canAdd: false, canEdit: false, canDelete: false };
      }
      customMap[groupCode].canView   = customMap[groupCode].canView   || Boolean(perm.canView);
      customMap[groupCode].canAdd    = customMap[groupCode].canAdd    || Boolean(perm.canAdd);
      customMap[groupCode].canEdit   = customMap[groupCode].canEdit   || Boolean(perm.canEdit);
      customMap[groupCode].canDelete = customMap[groupCode].canDelete || Boolean(perm.canDelete);
    }

    // Merge: a custom role's entry for a module overrides the auth-role
    // default (can extend or restrict); untouched modules fall back to it.
    return mergePerms(defaults, customMap);
  } catch {
    return null;
  }
}
