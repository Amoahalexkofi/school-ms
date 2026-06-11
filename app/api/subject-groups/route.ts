import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  const where: any = {};
  if (sessionId) where.sessionId = sessionId;
  const db = await getDb();
  const groups = await (db as any).subjectGroup.findMany({
    where,
    include: {
      subjects: { include: { subject: { select: { id: true, name: true, code: true } } } },
      sections: { include: { classSection: { include: { class: { select: { id: true, name: true } }, section: { select: { id: true, name: true } } } } } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, sessionId, subjectIds, classSectionIds } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 422 });
    if (!sessionId) return NextResponse.json({ error: "sessionId is required" }, { status: 422 });

    const db = await getDb();
    const group = await (db as any).subjectGroup.create({
      data: {
        name:        name.trim(),
        description: description || null,
        sessionId,
        subjects: subjectIds?.length
          ? { create: (subjectIds as string[]).map((subjectId) => ({ subjectId })) }
          : undefined,
        sections: classSectionIds?.length
          ? { create: (classSectionIds as string[]).map((classSectionId) => ({ classSectionId })) }
          : undefined,
      },
      include: {
        subjects: { include: { subject: { select: { id: true, name: true, code: true } } } },
        sections: { include: { classSection: { include: { class: { select: { id: true, name: true } }, section: { select: { id: true, name: true } } } } } },
      },
    });
    return NextResponse.json(group, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Section already assigned to another group" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
