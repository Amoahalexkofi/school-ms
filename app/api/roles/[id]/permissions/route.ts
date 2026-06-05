import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all permissions for a role
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: roleId } = await params;
  const perms = await (prisma as any).rolePermission.findMany({
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
    await (prisma as any).rolePermission.deleteMany({ where: { roleId } });

    // Insert new ones (only where at least one action is enabled)
    const toInsert = permissions.filter(
      (p) => p.canView || p.canAdd || p.canEdit || p.canDelete
    );

    if (toInsert.length > 0) {
      await (prisma as any).rolePermission.createMany({
        data: toInsert.map((p) => ({ roleId, ...p })),
      });
    }

    return NextResponse.json({ saved: toInsert.length });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save permissions" }, { status: 500 });
  }
}
