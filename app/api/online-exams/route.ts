import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const exams = await ((await getDb()) as any).onlineExam.findMany({
    include: {
      class: { select: { id: true, name: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { startTime: "desc" },
  });
  return NextResponse.json(exams);
}

export async function POST(req: NextRequest) {
  try {
    const {
      title, classId, sectionId, subjectId, sessionId, instructions,
      duration, totalMarks, passingPercentage, negativeMarking, negativeMarks,
      maxAttempts, startTime, endTime, isPublished,
    } = await req.json();

    if (!title?.trim() || !startTime || !endTime || !duration)
      return NextResponse.json({ error: "title, startTime, endTime, duration required" }, { status: 422 });

    const exam = await ((await getDb()) as any).onlineExam.create({
      data: {
        title:             title.trim(),
        classId:           classId           || null,
        sectionId:         sectionId         || null,
        subjectId:         subjectId         || null,
        sessionId:         sessionId         || null,
        instructions:      instructions      || null,
        duration:          parseInt(duration),
        totalMarks:        totalMarks        ? parseFloat(totalMarks)        : null,
        passingPercentage: passingPercentage ? parseFloat(passingPercentage) : null,
        negativeMarking:   negativeMarking   ?? false,
        negativeMarks:     negativeMarks     ? parseFloat(negativeMarks)     : null,
        maxAttempts:       maxAttempts       ? parseInt(maxAttempts)         : 1,
        startTime:         new Date(startTime),
        endTime:           new Date(endTime),
        isPublished:       isPublished       ?? false,
      },
    });
    return NextResponse.json(exam, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}
