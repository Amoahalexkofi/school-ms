import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.dateOfExam)  body.dateOfExam  = new Date(body.dateOfExam);
  if (body.fullMarks)   body.fullMarks   = parseInt(body.fullMarks);
  if (body.passingMarks) body.passingMarks = parseInt(body.passingMarks);
  const schedule = await ((await getDb()) as any).examSchedule.update({ where: { id }, data: body });
  return NextResponse.json(schedule);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).markEntry.deleteMany({ where: { examScheduleId: id } });
  await ((await getDb()) as any).examSchedule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
