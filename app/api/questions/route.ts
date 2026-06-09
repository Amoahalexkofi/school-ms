import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const subjectId = searchParams.get("subjectId");
  const questionType = searchParams.get("questionType");

  const where: any = { isActive: true };
  if (classId) where.classId = classId;
  if (subjectId) where.subjectId = subjectId;
  if (questionType) where.questionType = questionType;

  const questions = await ((await getDb()) as any).question.findMany({
    where,
    include: {
      subject: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  try {
    const {
      staffId, subjectId, classId, sectionId, questionType, level,
      question, optionA, optionB, optionC, optionD, optionE,
      correctAnswer, wordLimit, image,
    } = await req.json();
    if (!question?.trim()) return NextResponse.json({ error: "question text required" }, { status: 422 });

    const q = await ((await getDb()) as any).question.create({
      data: {
        staffId:       staffId       || null,
        subjectId:     subjectId     || null,
        classId:       classId       || null,
        sectionId:     sectionId     || null,
        questionType:  questionType  || "MCQ",
        level:         level         || "MEDIUM",
        question:      question.trim(),
        optionA:       optionA       || null,
        optionB:       optionB       || null,
        optionC:       optionC       || null,
        optionD:       optionD       || null,
        optionE:       optionE       || null,
        correctAnswer: correctAnswer || null,
        wordLimit:     wordLimit     ? parseInt(wordLimit) : null,
        image:         image         || null,
      },
    });
    return NextResponse.json(q, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
