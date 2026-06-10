import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const classId   = req.nextUrl.searchParams.get("classId");
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  const where: any = { isActive: true };
  if (classId) where.classId = classId;

  const db = await getDb();
  const sections = await (db as any).classSection.findMany({
    where,
    include: {
      class:   { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      teacher: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
      _count:  { select: { studentSessions: sessionId ? { where: { sessionId } } : true } },
    },
    orderBy: [{ class: { name: "asc" } }, { section: { name: "asc" } }],
  });
  return NextResponse.json(sections);
}

export async function POST(req: NextRequest) {
  try {
    const { classId, sectionId, teacherId } = await req.json();
    if (!classId || !sectionId) return NextResponse.json({ error: "classId and sectionId required" }, { status: 422 });
    const db = await getDb();
    const cs = await (db as any).classSection.upsert({
      where: { classId_sectionId: { classId, sectionId } },
      create: { classId, sectionId, teacherId: teacherId || null },
      update: { teacherId: teacherId || null },
      include: {
        class:   { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return NextResponse.json(cs, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
