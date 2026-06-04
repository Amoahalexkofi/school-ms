import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { ExamDetailClient } from "./ExamDetailClient";
import { notFound } from "next/navigation";

async function getData(id: string) {
  const [exam, allQuestions, classes, subjects] = await Promise.all([
    (prisma as any).onlineExam.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true } },
        questions: {
          include: {
            question: {
              include: { subject: { select: { id: true, name: true } } },
            },
          },
          orderBy: { order: "asc" },
        },
        attempts: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
            answers: true,
          },
          orderBy: { submittedAt: "desc" },
        },
      },
    }),
    (prisma as any).question.findMany({
      where: { isActive: true },
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    (prisma as any).class.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).subject.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { exam, allQuestions, classes, subjects };
}

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { exam, allQuestions, classes, subjects } = await getData(id);
  if (!exam) notFound();

  return (
    <div className="flex flex-col flex-1">
      <Topbar title={`Exam: ${exam.title}`} />
      <ExamDetailClient exam={exam} allQuestions={allQuestions} classes={classes} subjects={subjects} />
    </div>
  );
}
