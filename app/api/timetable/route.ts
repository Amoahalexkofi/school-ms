import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classSectionId = searchParams.get("classSectionId");
  if (!classSectionId) return NextResponse.json({ error: "classSectionId required" }, { status: 400 });
  try {
    const slots = await (prisma as any).timetableSlot.findMany({
      where: { classSectionId },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        staff:   { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ day: "asc" }, { timeFrom: "asc" }],
    });
    return NextResponse.json(slots);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { classSectionId, subjectId, staffId, day, timeFrom, timeTo, roomNo, sessionId } = await req.json();
    if (!classSectionId || !subjectId || !day || !timeFrom || !timeTo)
      return NextResponse.json({ error: "classSectionId, subjectId, day, timeFrom, timeTo required" }, { status: 422 });

    // Upsert: same class-section + subject + day → update existing
    const existing = await (prisma as any).timetableSlot.findFirst({ where: { classSectionId, subjectId, day } });
    const data = { classSectionId, subjectId, staffId: staffId || null, day, timeFrom, timeTo, roomNo: roomNo || null, sessionId: sessionId || null };
    const slot = existing
      ? await (prisma as any).timetableSlot.update({ where: { id: existing.id }, data })
      : await (prisma as any).timetableSlot.create({ data });

    return NextResponse.json(slot, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
