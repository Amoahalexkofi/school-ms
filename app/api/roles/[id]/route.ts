import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = await ((await getDb()) as any).appRole.findUnique({
    where: { id },
    include: {
      permissions: {
        include: { permCat: { include: { permGroup: true } } },
      },
    },
  });
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(role);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const role = await ((await getDb()) as any).appRole.update({ where: { id }, data: body });
    return NextResponse.json(role);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const role = await ((await getDb()) as any).appRole.findUnique({ where: { id } });
    if (role?.isSystem) return NextResponse.json({ error: "Cannot delete system role" }, { status: 403 });
    await ((await getDb()) as any).appRole.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
