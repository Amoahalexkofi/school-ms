import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Direct, per-staff permission overrides — no separate named "role" for the
// admin to create or manage. Under the hood this still uses the AppRole /
// RolePermission tables (so it's enforced by the exact same server-side
// check as Settings > Roles & Permissions — isApiCallPermitted in proxy.ts),
// but the hidden role is auto-created/reused per staff member and never
// shown in the general Roles list (isSystem: true).

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

// POST: save the full set of custom overrides for this staff member.
// Body: Array<{ permCatId: number, canView, canAdd, canEdit, canDelete }>
// An empty array clears all overrides and removes the hidden role entirely,
// reverting the person to plain role defaults.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: staffId } = await params;
  const db = (await getDb()) as any;

  try {
    const permissions: Array<{
      permCatId: number;
      canView: boolean;
      canAdd: boolean;
      canEdit: boolean;
      canDelete: boolean;
    }> = await req.json();

    const staff = await db.staff.findUnique({ where: { id: staffId }, select: { firstName: true, lastName: true } });
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    const existingLink = await db.staffAppRole.findUnique({ where: { staffId } });

    if (permissions.length === 0) {
      // Nothing customized — drop the link and the hidden role, so this
      // person cleanly reverts to their base role's defaults.
      if (existingLink) {
        await db.staffAppRole.delete({ where: { staffId } });
        await db.appRole.delete({ where: { id: existingLink.roleId } }).catch(() => {});
      }
      return NextResponse.json({ saved: 0 });
    }

    // Find or create the hidden per-staff role. isSystem marks it as
    // auto-generated so it's excluded from the general Roles & Permissions
    // list (that screen is for reusable, admin-named roles).
    let roleId = existingLink?.roleId;
    if (!roleId) {
      const role = await db.appRole.create({
        data: { name: `Custom — ${staff.firstName} ${staff.lastName}`, isSystem: true },
      });
      roleId = role.id;
      await db.staffAppRole.create({ data: { staffId, roleId } });
    }

    await db.rolePermission.deleteMany({ where: { roleId } });
    await db.rolePermission.createMany({
      data: permissions.map((p) => ({
        roleId,
        permCatId: p.permCatId,
        canView:   Boolean(p.canView),
        canAdd:    Boolean(p.canAdd),
        canEdit:   Boolean(p.canEdit),
        canDelete: Boolean(p.canDelete),
      })),
    });

    return NextResponse.json({ saved: permissions.length });
  } catch (err: any) {
    console.error("[staff permissions POST]", err);
    return NextResponse.json({ error: "Failed to save permissions" }, { status: 500 });
  }
}
