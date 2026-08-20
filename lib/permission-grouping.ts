// Shared by the two permission-editing UIs (Settings > Roles & Permissions,
// and a staff member's direct Permissions page). Both now edit at the
// PermissionGroup level (26 modules) because that's the only granularity the
// server actually enforces (see getCustomPermMap in proxy.ts, which
// OR-aggregates every RolePermission row by PermissionGroup.shortCode).
// Editing at the finer PermissionCategory level (89 rows) let a single
// checkbox silently override an entire module's default access — this file
// exists so both UIs translate group-level edits into category-level rows
// the same, consistent way.

export type PermState = { canView: boolean; canAdd: boolean; canEdit: boolean; canDelete: boolean };

export type PermCat = {
  id: number;
  permGroupId?: number;
  enableView: boolean;
  enableAdd: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
};

export type PermGroup = {
  id: number;
  name: string;
  shortCode: string;
  categories: PermCat[];
};

export type ExistingPerm = {
  permCatId: number;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export const EMPTY_PERM: PermState = { canView: false, canAdd: false, canEdit: false, canDelete: false };

// Raw category-level rows (as stored) → one OR-aggregated entry per group —
// mirrors exactly what proxy.ts's getCustomPermMap computes for enforcement,
// so what the UI displays as "this group's current permissions" is always
// what the server actually grants.
export function aggregateToGroups(existing: ExistingPerm[], groups: PermGroup[]): Record<number, PermState> {
  const catToGroup = new Map<number, number>();
  for (const g of groups) for (const c of g.categories) catToGroup.set(c.id, g.id);

  const map: Record<number, PermState> = {};
  for (const p of existing) {
    const groupId = catToGroup.get(p.permCatId);
    if (groupId == null) continue;
    const e = (map[groupId] ??= { ...EMPTY_PERM });
    e.canView   = e.canView   || !!p.canView;
    e.canAdd    = e.canAdd    || !!p.canAdd;
    e.canEdit   = e.canEdit   || !!p.canEdit;
    e.canDelete = e.canDelete || !!p.canDelete;
  }
  return map;
}
