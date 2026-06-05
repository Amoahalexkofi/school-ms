import { getDb } from "@/lib/db";

export async function listOnlineExams() {
  const prisma = await getDb();
  return (prisma as any).onlineExam.findMany({
    include: { class: true, _count: { select: { questions: true, attempts: true } } },
    orderBy: { startTime: "desc" },
  });
}

export async function createOnlineExam(input: {
  title: string;
  instructions?: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  classId?: string;
}) {
  if (!input.title.trim()) throw Object.assign(new Error("Title is required"), { code: "VALIDATION" });
  if (input.duration <= 0) throw Object.assign(new Error("Duration must be positive"), { code: "VALIDATION" });
  if (input.endTime <= input.startTime) throw Object.assign(new Error("End time must be after start time"), { code: "VALIDATION" });
  const prisma = await getDb();
  return (prisma as any).onlineExam.create({ data: { ...input, title: input.title.trim() } });
}

export async function addQuestion(input: {
  onlineExamId: string;
  text: string;
  options: string[];
  correctIndex: number;
  marks?: number;
}) {
  if (!input.text.trim()) throw Object.assign(new Error("Question text is required"), { code: "VALIDATION" });
  if (input.options.length < 2) throw Object.assign(new Error("At least 2 options required"), { code: "VALIDATION" });
  if (input.correctIndex < 0 || input.correctIndex >= input.options.length)
    throw Object.assign(new Error("Invalid correct answer index"), { code: "VALIDATION" });

  const prisma = await getDb();
  const exam = await (prisma as any).onlineExam.findUnique({ where: { id: input.onlineExamId } });
  if (!exam) throw Object.assign(new Error("Exam not found"), { code: "NOT_FOUND" });
  if (exam.isPublished) throw Object.assign(new Error("Cannot edit a published exam"), { code: "CONFLICT" });

  const count = await (prisma as any).question.count({ where: { onlineExamId: input.onlineExamId } });
  return (prisma as any).question.create({
    data: {
      onlineExamId: input.onlineExamId,
      text: input.text.trim(),
      options: input.options,
      correctIndex: input.correctIndex,
      marks: input.marks ?? 1,
      order: count,
    },
  });
}

export async function publishExam(examId: string) {
  const prisma = await getDb();
  const exam = await (prisma as any).onlineExam.findUnique({
    where: { id: examId },
    include: { _count: { select: { questions: true } } },
  });
  if (!exam) throw Object.assign(new Error("Exam not found"), { code: "NOT_FOUND" });
  if (exam.isPublished) throw Object.assign(new Error("Already published"), { code: "CONFLICT" });
  if (exam._count.questions === 0) throw Object.assign(new Error("Add questions before publishing"), { code: "VALIDATION" });
  return (prisma as any).onlineExam.update({ where: { id: examId }, data: { isPublished: true } });
}

export async function startAttempt(examId: string, studentId: string) {
  const prisma = await getDb();
  const exam = await (prisma as any).onlineExam.findUnique({ where: { id: examId } });
  if (!exam) throw Object.assign(new Error("Exam not found"), { code: "NOT_FOUND" });
  if (!exam.isPublished) throw Object.assign(new Error("Exam is not published"), { code: "CONFLICT" });
  const now = new Date();
  if (now < new Date(exam.startTime)) throw Object.assign(new Error("Exam has not started yet"), { code: "CONFLICT" });
  if (now > new Date(exam.endTime)) throw Object.assign(new Error("Exam has ended"), { code: "CONFLICT" });

  const existing = await (prisma as any).examAttempt.findUnique({
    where: { onlineExamId_studentId: { onlineExamId: examId, studentId } },
  });
  if (existing) throw Object.assign(new Error("Already attempted"), { code: "CONFLICT" });

  return (prisma as any).examAttempt.create({ data: { onlineExamId: examId, studentId } });
}

export async function submitAttempt(attemptId: string, answers: { questionId: string; selectedIndex: number }[]) {
  const prisma = await getDb();
  const attempt = await (prisma as any).examAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt) throw Object.assign(new Error("Attempt not found"), { code: "NOT_FOUND" });
  if (attempt.submittedAt) throw Object.assign(new Error("Already submitted"), { code: "CONFLICT" });

  const questions = await (prisma as any).question.findMany({ where: { onlineExamId: attempt.onlineExamId } });
  const qMap = new Map(questions.map((q: any) => [q.id, q]));

  let score = 0;
  const total = questions.reduce((s: number, q: any) => s + q.marks, 0);

  const answerData = answers.map((a) => {
    const q = qMap.get(a.questionId) as any;
    const isCorrect = q ? a.selectedIndex === q.correctIndex : false;
    if (isCorrect && q) score += q.marks;
    return { attemptId, questionId: a.questionId, selectedIndex: a.selectedIndex, isCorrect };
  });

  return (prisma as any).$transaction([
    (prisma as any).examAnswer.createMany({ data: answerData }),
    (prisma as any).examAttempt.update({
      where: { id: attemptId },
      data: { submittedAt: new Date(), score, total },
    }),
  ]);
}

export async function getExamWithQuestions(examId: string) {
  const prisma = await getDb();
  return (prisma as any).onlineExam.findUnique({
    where: { id: examId },
    include: { questions: { orderBy: { order: "asc" } }, class: true },
  });
}

export async function getAttemptResults(examId: string) {
  const prisma = await getDb();
  return (prisma as any).examAttempt.findMany({
    where: { onlineExamId: examId },
    include: { student: true, answers: { include: { question: true } } },
    orderBy: { score: "desc" },
  });
}
