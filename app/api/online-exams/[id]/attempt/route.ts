import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST: start attempt OR submit answers
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: onlineExamId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Resolve student from user
  const student = await (prisma as any).student.findFirst({
    where: { userId: session.user.id },
  });
  if (!student) return NextResponse.json({ error: "Student record not found" }, { status: 403 });

  const body = await req.json();
  const { action, answers } = body; // action: "start" | "submit"

  if (action === "start") {
    // Create or return existing attempt
    const existing = await (prisma as any).examAttempt.findUnique({
      where: { onlineExamId_studentId: { onlineExamId, studentId: student.id } },
    });
    if (existing) return NextResponse.json(existing);

    const attempt = await (prisma as any).examAttempt.create({
      data: { onlineExamId, studentId: student.id },
    });
    return NextResponse.json(attempt, { status: 201 });
  }

  if (action === "submit") {
    const attempt = await (prisma as any).examAttempt.findUnique({
      where: { onlineExamId_studentId: { onlineExamId, studentId: student.id } },
    });
    if (!attempt) return NextResponse.json({ error: "No attempt found" }, { status: 404 });
    if (attempt.submittedAt) return NextResponse.json({ error: "Already submitted" }, { status: 409 });

    // Load exam questions with correct answers
    const examQuestions = await (prisma as any).onlineExamQuestion.findMany({
      where: { onlineExamId },
      include: { question: true },
    });

    let score = 0;
    const total = examQuestions.reduce((s: number, eq: any) => s + eq.marks, 0);

    // Upsert answers
    for (const eq of examQuestions) {
      const ans = answers?.[eq.questionId];
      const q = eq.question;
      let isCorrect = false;
      let selectedIndex: number | null = null;
      let textAnswer: string | null = null;

      if (q.questionType === "MCQ" || q.questionType === "TRUE_FALSE") {
        selectedIndex = ans != null ? parseInt(ans) : null;
        const options = ["A", "B", "C", "D", "E"];
        const correct = q.correctAnswer?.toUpperCase();
        if (correct && selectedIndex != null) {
          isCorrect = options[selectedIndex] === correct;
        }
        if (isCorrect) score += eq.marks;
      } else {
        textAnswer = ans ?? null;
        // Descriptive/short answer requires manual grading
      }

      await (prisma as any).examAnswer.upsert({
        where: { attemptId_questionId: { attemptId: attempt.id, questionId: eq.questionId } },
        create: { attemptId: attempt.id, questionId: eq.questionId, selectedIndex, textAnswer, isCorrect },
        update: { selectedIndex, textAnswer, isCorrect },
      });
    }

    const updated = await (prisma as any).examAttempt.update({
      where: { id: attempt.id },
      data: { submittedAt: new Date(), score, total },
    });

    return NextResponse.json({ ...updated, examQuestions });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

// GET: fetch attempt for current student
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: onlineExamId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const student = await (prisma as any).student.findFirst({
    where: { userId: session.user.id },
  });
  if (!student) return NextResponse.json(null);

  const attempt = await (prisma as any).examAttempt.findUnique({
    where: { onlineExamId_studentId: { onlineExamId, studentId: student.id } },
    include: { answers: true },
  });
  return NextResponse.json(attempt);
}
