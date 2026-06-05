import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { TakeExamClient } from "./TakeExamClient";
import { auth } from "@/lib/auth";

async function getData(examId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  const [exam, student] = await Promise.all([
    ((await getDb()) as any).onlineExam.findUnique({
      where: { id: examId },
      include: {
        class: { select: { name: true } },
        questions: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                questionType: true,
                level: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                optionE: true,
                wordLimit: true,
                // correctAnswer is NOT sent to client
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    }),
    userId
      ? ((await getDb()) as any).student.findFirst({ where: { userId } })
      : null,
  ]);

  if (!exam) return null;

  // Check existing attempt (to pre-fill answers or show result)
  const attempt = student
    ? await ((await getDb()) as any).examAttempt.findUnique({
        where: { onlineExamId_studentId: { onlineExamId: examId, studentId: student.id } },
        include: { answers: true },
      })
    : null;

  return { exam, student, attempt };
}

export default async function TakeExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const data = await getData(examId);
  if (!data || !data.exam) notFound();

  const { exam, student, attempt } = data;

  return (
    <TakeExamClient
      exam={exam}
      studentId={student?.id ?? null}
      existingAttempt={attempt}
    />
  );
}
