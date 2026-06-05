import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { name, isActive } = await req.json();
    const data: any = {};
    if (name !== undefined)     data.name     = name.trim();
    if (isActive !== undefined) data.isActive = isActive;
    const desig = await ((await getDb()) as any).designation.update({ where: { id }, data });
    return NextResponse.json(desig);
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Name already taken" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const staffCount = await ((await getDb()) as any).staff.count({ where: { designationId: id } });
    if (staffCount > 0)
      return NextResponse.json({ error: `Cannot delete — ${staffCount} staff member(s) assigned` }, { status: 409 });
    await ((await getDb()) as any).designation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
