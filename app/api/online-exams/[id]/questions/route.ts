import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Add question to exam
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: onlineExamId } = await params;
  try {
    const { questionId, marks = 1 } = await req.json();

    // Get current max order
    const last = await (prisma as any).onlineExamQuestion.findFirst({
      where: { onlineExamId },
      orderBy: { order: "desc" },
    });
    const order = last ? last.order + 1 : 0;

    const eq = await (prisma as any).onlineExamQuestion.create({
      data: { onlineExamId, questionId, marks, order },
    });

    // Update totalQuestions count
    const count = await (prisma as any).onlineExamQuestion.count({ where: { onlineExamId } });
    await (prisma as any).onlineExam.update({
      where: { id: onlineExamId },
      data: { totalQuestions: count },
    });

    return NextResponse.json(eq, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Question already added" }, { status: 409 });
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Remove question from exam
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: onlineExamId } = await params;
  try {
    const { questionId } = await req.json();
    await (prisma as any).onlineExamQuestion.deleteMany({
      where: { onlineExamId, questionId },
    });

    const count = await (prisma as any).onlineExamQuestion.count({ where: { onlineExamId } });
    await (prisma as any).onlineExam.update({
      where: { id: onlineExamId },
      data: { totalQuestions: count },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
