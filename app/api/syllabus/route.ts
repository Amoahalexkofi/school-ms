import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/syllabus?classSectionId=&subjectId=&sessionId=&from=&to=&createdForId=
// Weekly syllabus entries (Smart School subject_syllabus). Optional date window
// (from/to, YYYY-MM-DD) for the week view; filters via topic → lesson.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const classSectionId = sp.get("classSectionId");
  const subjectId      = sp.get("subjectId");
  const sessionId      = sp.get("sessionId");
  const createdForId   = sp.get("createdForId");
  const from           = sp.get("from");
  const to             = sp.get("to");

  const where: any = {};
  if (sessionId)    where.sessionId    = sessionId;
  if (createdForId) where.createdForId = createdForId;
  if (from || to)   where.date = { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) };

  const lessonFilter: any = {};
  if (classSectionId) lessonFilter.classSectionId = classSectionId;
  if (subjectId)      lessonFilter.subjectId      = subjectId;
  if (Object.keys(lessonFilter).length) where.topic = { lesson: lessonFilter };

  const db = await getDb();
  const entries = await (db as any).subjectSyllabus.findMany({
    where,
    include: {
      topic: { include: { lesson: { include: {
        subject:      { select: { name: true, code: true } },
        classSection: { include: { class: { select: { name: true } }, section: { select: { name: true } } } },
      } } } },
      createdFor: { select: { firstName: true, lastName: true, employeeId: true } },
    },
    orderBy: [{ date: "asc" }, { timeFrom: "asc" }],
  });
  return NextResponse.json(entries);
}

// POST /api/syllabus — create a scheduled lesson-plan entry.
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const { topicId, sessionId, date, timeFrom, timeTo } = b;
    if (!topicId || !sessionId || !date || !timeFrom || !timeTo) {
      return NextResponse.json({ error: "topicId, sessionId, date, timeFrom and timeTo are required" }, { status: 422 });
    }
    const db = await getDb();
    const entry = await (db as any).subjectSyllabus.create({
      data: {
        topicId, sessionId, date: new Date(date), timeFrom, timeTo,
        createdForId:           b.createdForId || null,
        createdById:            b.createdById || null,
        subTopic:               b.subTopic || null,
        presentation:           b.presentation || null,
        teachingMethod:         b.teachingMethod || null,
        generalObjectives:      b.generalObjectives || null,
        previousKnowledge:      b.previousKnowledge || null,
        comprehensiveQuestions: b.comprehensiveQuestions || null,
        lectureYoutubeUrl:      b.lectureYoutubeUrl || null,
        attachment:             b.attachment || null,
      },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
