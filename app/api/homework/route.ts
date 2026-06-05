import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classSectionId = searchParams.get("classSectionId");
  if (!classSectionId) return NextResponse.json({ error: "classSectionId required" }, { status: 400 });
  try {
    const homework = await (prisma as any).homework.findMany({
      where: { classSectionId, isActive: true },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        staff:   { select: { id: true, firstName: true, lastName: true } },
        acknowledgements: { select: { id: true, studentId: true } },
      },
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(homework);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, subjectId, classSectionId, staffId, sessionId, dueDate } = await req.json();
    if (!title || !subjectId || !classSectionId || !sessionId || !dueDate)
      return NextResponse.json({ error: "title, subjectId, classSectionId, sessionId, dueDate required" }, { status: 422 });

    const hw = await (prisma as any).homework.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        subjectId,
        classSectionId,
        staffId: staffId || null,
        sessionId,
        dueDate: new Date(dueDate),
      },
    });
    return NextResponse.json(hw, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
