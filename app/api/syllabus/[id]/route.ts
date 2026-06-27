import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const FIELDS = [
  "topicId", "date", "timeFrom", "timeTo", "createdForId", "subTopic", "presentation",
  "teachingMethod", "generalObjectives", "previousKnowledge", "comprehensiveQuestions",
  "lectureYoutubeUrl", "attachment",
] as const;

// PATCH /api/syllabus/[id] — edit a scheduled entry.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const b = await req.json();
    const data: any = {};
    for (const f of FIELDS) {
      if (b[f] === undefined) continue;
      if (f === "date") data.date = b.date ? new Date(b.date) : undefined;
      else if (f === "topicId" || f === "timeFrom" || f === "timeTo") data[f] = b[f];
      else data[f] = b[f] || null;
    }
    const db = await getDb();
    const entry = await (db as any).subjectSyllabus.update({ where: { id }, data });
    return NextResponse.json(entry);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/syllabus/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const db = await getDb();
    await (db as any).subjectSyllabus.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
