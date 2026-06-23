import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { grade, gradePoint, markFrom, markTo, isActive } = await req.json();
    const data: any = {};
    if (grade      !== undefined) data.grade      = grade?.trim();
    if (gradePoint !== undefined) data.gradePoint = gradePoint === "" ? 0 : parseFloat(gradePoint);
    if (markFrom   !== undefined) data.markFrom   = parseFloat(markFrom);
    if (markTo     !== undefined) data.markTo     = parseFloat(markTo);
    if (isActive   !== undefined) data.isActive   = Boolean(isActive);
    const r = await ((await getDb()) as any).gradeRange.update({ where: { id }, data });
    return NextResponse.json(r);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ((await getDb()) as any).gradeRange.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
