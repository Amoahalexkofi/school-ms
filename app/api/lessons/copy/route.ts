import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// POST /api/lessons/copy
// { targetClassSectionId, targetSubjectId, sessionId, topicIds: string[] }
// Smart School saveCopyLesson(): clone selected topics (grouped by their source
// lesson) into new lessons under the target subject/class-section. Copied topics
// reset to incomplete.
export async function POST(req: NextRequest) {
  try {
    const { targetClassSectionId, targetSubjectId, sessionId, topicIds } = await req.json();
    if (!targetClassSectionId || !targetSubjectId || !sessionId) {
      return NextResponse.json({ error: "targetClassSectionId, targetSubjectId and sessionId are required" }, { status: 422 });
    }
    if (!Array.isArray(topicIds) || !topicIds.length) {
      return NextResponse.json({ error: "Select at least one topic to copy" }, { status: 422 });
    }

    const db = await getDb();
    const topics = await (db as any).topic.findMany({
      where: { id: { in: topicIds } },
      include: { lesson: { select: { id: true, name: true } } },
    });
    if (!topics.length) return NextResponse.json({ error: "No matching topics found" }, { status: 404 });

    // Group selected topics by their source lesson.
    const byLesson = new Map<string, { name: string; topics: string[] }>();
    for (const t of topics) {
      const key = t.lesson.id;
      if (!byLesson.has(key)) byLesson.set(key, { name: t.lesson.name, topics: [] });
      byLesson.get(key)!.topics.push(t.name);
    }

    let lessonsCreated = 0;
    let topicsCreated = 0;
    for (const { name, topics: topicNames } of byLesson.values()) {
      const lesson = await (db as any).lesson.create({
        data: { name, subjectId: targetSubjectId, classSectionId: targetClassSectionId, sessionId },
      });
      lessonsCreated++;
      await (db as any).topic.createMany({
        data: topicNames.map((tn) => ({ name: tn, lessonId: lesson.id, sessionId, status: false, completeDate: null })),
      });
      topicsCreated += topicNames.length;
    }

    return NextResponse.json({ status: "success", lessonsCreated, topicsCreated }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
