import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET all permissions for a role
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: roleId } = await params;
  const perms = await ((await getDb()) as any).rolePermission.findMany({
    where: { roleId },
    include: { permCat: { include: { permGroup: true } } },
  });
  return NextResponse.json(perms);
}

// POST: save full permission set for a role, at the module (PermissionGroup)
// level — the same granularity the server actually enforces (see
// getCustomPermMap in proxy.ts, which OR-aggregates by PermissionGroup, not
// by individual PermissionCategory). Saving finer than that let one checked
// box silently override a whole module's access; expanding each group entry
// into every one of its categories here keeps that impossible by construction.
// Body: Array<{ groupId: number, canView, canAdd, canEdit, canDelete }>
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: roleId } = await params;
  const db = (await getDb()) as any;
  try {
    const entries: Array<{
      groupId: number;
      canView: boolean;
      canAdd: boolean;
      canEdit: boolean;
      canDelete: boolean;
    }> = await req.json();

    const overrides = entries.filter((e) => e.canView || e.canAdd || e.canEdit || e.canDelete);

    // Full re-save every time: clear everything, then recreate only the
    // modules the admin left enabled. A module never enabled at all is
    // simply absent — this custom role grants nothing there.
    await db.rolePermission.deleteMany({ where: { roleId } });

    if (overrides.length > 0) {
      const groupIds = overrides.map((e) => e.groupId);
      const categories = await db.permissionCategory.findMany({ where: { permGroupId: { in: groupIds } } });

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
    }

    return NextResponse.json({ saved: overrides.length });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save permissions" }, { status: 500 });
  }
}
