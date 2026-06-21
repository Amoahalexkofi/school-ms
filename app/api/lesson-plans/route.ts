import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sessionId      = searchParams.get("sessionId");
  const staffId        = searchParams.get("staffId");
  const subjectId      = searchParams.get("subjectId");
  const classSectionId = searchParams.get("classSectionId");
  const status         = searchParams.get("status");

  const where: any = {};
  if (sessionId)      where.sessionId      = sessionId;
  if (staffId)        where.staffId        = staffId;
  if (subjectId)      where.subjectId      = subjectId;
  if (classSectionId) where.classSectionId = classSectionId;
  if (status)         where.status         = status;

  const plans = await ((await getDb()) as any).lessonPlan.findMany({
    where,
    include: {
      staff:        { select: { firstName: true, lastName: true } },
      subject:      { select: { name: true } },
      classSection: { include: { class: { select: { name: true } }, section: { select: { name: true } } } },
      session:      { select: { session: true } },
    },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  try {
    const { staffId, subjectId, classSectionId, sessionId, date, topic, description, status } = await req.json();
    if (!staffId || !subjectId || !classSectionId || !sessionId || !date || !topic?.trim()) {
      return NextResponse.json({ error: "staffId, subjectId, classSectionId, sessionId, date, topic are required" }, { status: 422 });
    }
    const plan = await ((await getDb()) as any).lessonPlan.create({
      data: {
        staffId,
        subjectId,
        classSectionId,
        sessionId,
        date:        new Date(date),
        topic:       topic.trim(),
        description: description || null,
        status:      status || "DRAFT",
      },
    });
    return NextResponse.json(plan, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
