import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const subjectId = searchParams.get("subjectId");
  const questionType = searchParams.get("questionType");

  const where: any = { isActive: true };
  if (classId) where.classId = classId;
  if (subjectId) where.subjectId = subjectId;
  if (questionType) where.questionType = questionType;

  const questions = await (prisma as any).question.findMany({
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
    const body = await req.json();
    const question = await (prisma as any).question.create({ data: body });
    return NextResponse.json(question, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
