import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { teacherId, isActive } = await req.json();
    const data: any = {};
    if (teacherId !== undefined) data.teacherId = teacherId || null;
    if (isActive  !== undefined) data.isActive  = Boolean(isActive);
    if (Object.keys(data).length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 422 });

    const db = await getDb();
    const cs = await (db as any).classSection.update({
      where: { id },
      data,
      include: {
        class:   { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return NextResponse.json(cs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const db = await getDb();
    const count = await (db as any).studentSession.count({ where: { classSectionId: id, isActive: true } });
    if (count > 0) return NextResponse.json({ error: `${count} active student(s) enrolled — cannot delete` }, { status: 409 });
    await (db as any).classSection.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
