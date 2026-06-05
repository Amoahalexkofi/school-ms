import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: examGroupId } = await params;
  try {
    const body = await req.json();
    const { sessionId, subjectId, classSectionId, dateOfExam, startTime, endTime, fullMarks, passingMarks, roomNo, note } = body;
    if (!sessionId || !subjectId || !classSectionId)
      return NextResponse.json({ error: "sessionId, subjectId and classSectionId are required" }, { status: 422 });
    if (!fullMarks || Number(fullMarks) <= 0)
      return NextResponse.json({ error: "Full marks must be positive" }, { status: 422 });
    if (!passingMarks || Number(passingMarks) <= 0)
      return NextResponse.json({ error: "Passing marks must be positive" }, { status: 422 });

    const schedule = await ((await getDb()) as any).examSchedule.create({
      data: {
        examGroupId,
        sessionId,
        subjectId,
        classSectionId,
        dateOfExam:   dateOfExam   ? new Date(dateOfExam)  : null,
        startTime:    startTime    || null,
        endTime:      endTime      || null,
        fullMarks:    parseInt(fullMarks),
        passingMarks: parseInt(passingMarks),
        roomNo:       roomNo       || null,
        note:         note         || null,
      },
      include: {
        subject:      { select: { name: true, code: true } },
        classSection: { include: { class: true, section: true } },
      },
    });
    return NextResponse.json(schedule, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "This subject is already scheduled for this class" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
