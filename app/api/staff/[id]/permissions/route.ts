import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Direct, per-staff permission overrides — no separate named "role" for the
// admin to create or manage. Under the hood this still uses the AppRole /
// RolePermission tables (so it's enforced by the exact same server-side
// check as Settings > Roles & Permissions — isApiCallPermitted in proxy.ts),
// but the hidden role is auto-created/reused per staff member and never
// shown in the general Roles list (isHidden: true).
//
// Overrides are saved at the PermissionGroup (module) level — the same
// granularity the server enforces at (getCustomPermMap OR-aggregates by
// PermissionGroup, not by individual PermissionCategory). See
// lib/permission-grouping.ts for why.

// GET: this staff member's current custom permission overrides, if any.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: staffId } = await params;
  const db = (await getDb()) as any;

  const link = await db.staffAppRole.findUnique({
    where: { staffId },
    include: { role: { include: { permissions: true } } },
  });

  return NextResponse.json({
    permissions: link?.role?.permissions?.map((p: any) => ({
      permCatId: p.permCatId,
      canView:   p.canView,
      canAdd:    p.canAdd,
      canEdit:   p.canEdit,
      canDelete: p.canDelete,
    })) ?? [],
  });
}

// POST: save this staff member's module-level overrides.
// Body: Array<
//   | { groupId: number, mode: "override", canView, canAdd, canEdit, canDelete }
//   | { groupId: number, mode: "default" }   // explicitly clear any override, fall back to base role default
// >
// An empty array clears every override and removes the hidden role entirely,
// reverting the person to plain role defaults.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: staffId } = await params;
  const db = (await getDb()) as any;

  try {
    const entries: Array<{
      groupId: number;
      mode: "override" | "default";
      canView?: boolean;
      canAdd?: boolean;
      canEdit?: boolean;
      canDelete?: boolean;
    }> = await req.json();

    const staff = await db.staff.findUnique({ where: { id: staffId }, select: { firstName: true, lastName: true } });
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    const existingLink = await db.staffAppRole.findUnique({ where: { staffId } });

    // An all-false override is a deliberate "take this module away entirely"
    // (unchecking every box by hand, as opposed to clicking Reset to
    // default) — it must still be persisted as an explicit deny row, or a
    // module a person's base role grants by default can never actually be
    // removed from them.
    const overrides = entries.filter((e) => e.mode === "override");

    if (overrides.length === 0) {
      // Nothing left to keep — drop the link and the hidden role, so this
      // person cleanly reverts to their base role's defaults.
      if (existingLink) {
        await db.staffAppRole.delete({ where: { staffId } });
        await db.appRole.delete({ where: { id: existingLink.roleId } }).catch(() => {});
      }
      return NextResponse.json({ saved: 0 });
    }

    // Find or create the hidden per-staff role. isHidden marks it as
    // auto-generated so it's excluded from the general Roles & Permissions
    // list (that screen is for reusable, admin-named roles).
    let roleId = existingLink?.roleId;
    if (!roleId) {
      const role = await db.appRole.create({
        data: { name: `Custom — ${staff.firstName} ${staff.lastName}`, isHidden: true },
      });
      roleId = role.id;
      await db.staffAppRole.create({ data: { staffId, roleId } });
    }

    const groupIds = overrides.map((e) => e.groupId);
    const categories = await db.permissionCategory.findMany({ where: { permGroupId: { in: groupIds } } });

    // Full re-save every time: clear everything, then recreate only the
    // modules that ended up with an actual override.
    await db.rolePermission.deleteMany({ where: { roleId } });
    const rows = overrides.flatMap((entry) =>
      categories
        .filter((c: any) => c.permGroupId === entry.groupId)
        .map((cat: any) => ({
          roleId,
          permCatId: cat.id,
          canView:   Boolean(entry.canView)   && cat.enableView,
          canAdd:    Boolean(entry.canAdd)    && cat.enableAdd,
          canEdit:   Boolean(entry.canEdit)   && cat.enableEdit,
          canDelete: Boolean(entry.canDelete) && cat.enableDelete,
        }))
    );
    if (rows.length) await db.rolePermission.createMany({ data: rows });

    return NextResponse.json({ saved: overrides.length });
  } catch (err: any) {
    console.error("[staff permissions POST]", err);
    return NextResponse.json({ error: "Failed to save permissions" }, { status: 500 });
  }
}
