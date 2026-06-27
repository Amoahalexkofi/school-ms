import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/lessons?classSectionId=&subjectId=&sessionId=
// Lists lessons (with their topics) for a subject in a class-section.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const classSectionId = sp.get("classSectionId");
  const subjectId      = sp.get("subjectId");
  const sessionId      = sp.get("sessionId");

  const where: any = {};
  if (classSectionId) where.classSectionId = classSectionId;
  if (subjectId)      where.subjectId      = subjectId;
  if (sessionId)      where.sessionId      = sessionId;

  const db = await getDb();
  const lessons = await (db as any).lesson.findMany({
    where,
    include: {
      subject:      { select: { id: true, name: true, code: true } },
      classSection: { include: { class: { select: { name: true } }, section: { select: { name: true } } } },
      topics:       { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(lessons);
}

// POST /api/lessons  { classSectionId, subjectId, sessionId, names: string[] }
// Smart School createlesson(): accepts multiple lesson names at once.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { classSectionId, subjectId, sessionId } = body;
    const names: string[] = (Array.isArray(body.names) ? body.names : [body.name])
      .map((n: string) => (n ?? "").trim())
      .filter(Boolean);

    if (!classSectionId || !subjectId || !sessionId) {
      return NextResponse.json({ error: "classSectionId, subjectId and sessionId are required" }, { status: 422 });
    }
    if (!names.length) return NextResponse.json({ error: "At least one lesson name is required" }, { status: 422 });

    const db = await getDb();
    await (db as any).lesson.createMany({
      data: names.map((name) => ({ name, classSectionId, subjectId, sessionId })),
    });
    return NextResponse.json({ status: "success", created: names.length }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
