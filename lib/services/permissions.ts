import { getDb } from "@/lib/db";

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
const ROLE_DEFAULTS: Record<string, PermissionMap | null> = {
  SUPER_ADMIN: null,
  ADMIN:       null,

  TEACHER: {
    student_information:  VIEW,   // see students, not add/edit/delete
    student_attendance:   ALLOW,  // mark attendance
    examination:          ALLOW,  // create exams, enter marks
    academics:            ALLOW,  // timetable, subjects, results
    homework:             ALLOW,
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

function mergePerms(base: PermissionMap, extra: PermissionMap): PermissionMap {
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

    // ADMIN / SUPER_ADMIN → unrestricted
    if (defaults === null || defaults === undefined) return null;

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

    // Merge: defaults OR custom (custom only extends, never restricts)
    return mergePerms(defaults, customMap);
  } catch {
    return null;
  }
}

export { ALLOW_ALL as _ALLOW_ALL };
