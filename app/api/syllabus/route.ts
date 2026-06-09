import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const subjectId = searchParams.get("subjectId");
  const sessionId = searchParams.get("sessionId");
  const status    = searchParams.get("status");

  const where: any = {};
  if (subjectId) where.subjectId = subjectId;
  if (sessionId) where.sessionId = sessionId;
  if (status)    where.status    = status;

  const syllabi = await ((await getDb()) as any).syllabus.findMany({
    where,
    include: { subject: { select: { name: true, code: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(syllabi);
}

export async function POST(req: NextRequest) {
  try {
    const { subjectId, topic, description, status, sessionId } = await req.json();
    if (!subjectId || !topic?.trim()) {
      return NextResponse.json({ error: "subjectId and topic are required" }, { status: 422 });
    }
    const syllabus = await ((await getDb()) as any).syllabus.create({
      data: {
        subjectId,
        topic:       topic.trim(),
        description: description || null,
        status:      status      || "PENDING",
        sessionId:   sessionId   || null,
      },
    });
    return NextResponse.json(syllabus, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
