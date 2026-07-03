import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const SCHED_ALLOWED = ["subjectId","classSectionId","sessionId","dateOfExam","startTime","endTime","fullMarks","passingMarks","roomNo","isActive","isPublished"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  for (const key of SCHED_ALLOWED) {
    if (key in body) {
      if (key === "dateOfExam" && body[key]) data[key] = new Date(body[key]);
      else if (["fullMarks","passingMarks"].includes(key) && body[key] !== undefined) data[key] = body[key] ? parseInt(body[key]) : null;
      else data[key] = body[key] ?? null;
    }
  }
  const schedule = await ((await getDb()) as any).examSchedule.update({ where: { id }, data });
  return NextResponse.json(schedule);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).markEntry.deleteMany({ where: { examScheduleId: id } });
  await ((await getDb()) as any).examSchedule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
