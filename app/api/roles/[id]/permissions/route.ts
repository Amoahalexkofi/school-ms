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

// POST: save full permission set for a role
// Body: Array<{ permCatId: number, canView: bool, canAdd: bool, canEdit: bool, canDelete: bool }>
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: roleId } = await params;
  try {
    const permissions: Array<{
      permCatId: number;
      canView: boolean;
      canAdd: boolean;
      canEdit: boolean;
      canDelete: boolean;
    }> = await req.json();

    // Delete all existing permissions for this role
    await ((await getDb()) as any).rolePermission.deleteMany({ where: { roleId } });

    // Insert one row per category the client sent — including all-false
    // rows. A category with every box unchecked is a deliberate "this custom
    // role has no access here", which must persist so it can override an
    // auth-role default that would otherwise grant it (see mergePerms).
    // Categories the admin never touched at all simply aren't in this array.
    if (permissions.length > 0) {
      await ((await getDb()) as any).rolePermission.createMany({
        data: permissions.map((p) => ({
          roleId,
          permCatId: p.permCatId,
          canView:   Boolean(p.canView),
          canAdd:    Boolean(p.canAdd),
          canEdit:   Boolean(p.canEdit),
          canDelete: Boolean(p.canDelete),
        })),
      });
    }

    return NextResponse.json({ saved: permissions.length });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save permissions" }, { status: 500 });
  }
}
