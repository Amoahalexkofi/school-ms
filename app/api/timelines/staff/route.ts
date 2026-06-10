import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Timeline_model — staff_timeline table

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const staffId = searchParams.get("staffId");
  if (!staffId) return NextResponse.json({ error: "staffId is required" }, { status: 422 });
  const db = await getDb();
  const timelines = await (db as any).staffTimeline.findMany({
    where: { staffId },
    orderBy: { timelineDate: "asc" },
  });
  return NextResponse.json(timelines);
}

export async function POST(req: NextRequest) {
  try {
    const { staffId, title, timelineDate, description, document, status } = await req.json();
    if (!staffId)      return NextResponse.json({ error: "staffId is required" }, { status: 422 });
    if (!title?.trim()) return NextResponse.json({ error: "title is required" }, { status: 422 });
    if (!timelineDate) return NextResponse.json({ error: "timelineDate is required" }, { status: 422 });
    const db = await getDb();
    const entry = await (db as any).staffTimeline.create({
      data: {
        staffId,
        title:        title.trim(),
        timelineDate: new Date(timelineDate),
        description:  description?.trim() || "",
        document:     document || null,
        status:       status   || "yes",
      },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
