import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { topic, description, status, date, subjectId, classSectionId } = await req.json();
    const data: any = {};
    if (topic          !== undefined) data.topic          = topic?.trim()  || null;
    if (description    !== undefined) data.description    = description    || null;
    if (status         !== undefined) data.status         = status;
    if (date           !== undefined && date) data.date   = new Date(date);
    if (subjectId      !== undefined) data.subjectId      = subjectId      || null;
    if (classSectionId !== undefined) data.classSectionId = classSectionId || null;
    const plan = await ((await getDb()) as any).lessonPlan.update({ where: { id }, data });
    return NextResponse.json(plan);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ((await getDb()) as any).lessonPlan.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
