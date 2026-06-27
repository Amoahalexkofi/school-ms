import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/topics?lessonId=
export async function GET(req: NextRequest) {
  const lessonId = req.nextUrl.searchParams.get("lessonId");
  if (!lessonId) return NextResponse.json({ error: "lessonId required" }, { status: 422 });
  const db = await getDb();
  const topics = await (db as any).topic.findMany({ where: { lessonId }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(topics);
}

// POST /api/topics  { lessonId, sessionId, names: string[] }
// Smart School createtopic(): accepts multiple topic names at once; new topics start incomplete.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lessonId, sessionId } = body;
    const names: string[] = (Array.isArray(body.names) ? body.names : [body.name])
      .map((n: string) => (n ?? "").trim())
      .filter(Boolean);

    if (!lessonId || !sessionId) return NextResponse.json({ error: "lessonId and sessionId are required" }, { status: 422 });
    if (!names.length) return NextResponse.json({ error: "At least one topic name is required" }, { status: 422 });

    const db = await getDb();
    await (db as any).topic.createMany({
      data: names.map((name) => ({ name, lessonId, sessionId, status: false, completeDate: null })),
    });
    return NextResponse.json({ status: "success", created: names.length }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
