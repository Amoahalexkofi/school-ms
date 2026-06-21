/**
 * Seeds online-exam questions and a published, takeable exam into the demo
 * (public schema). Idempotent: re-running won't duplicate questions or the exam.
 *
 *   DATABASE_URL="..." npx tsx prisma/seed-online-exam.ts
 */
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter }) as any;

type Q = {
  question: string;
  type: "MCQ" | "TRUE_FALSE";
  level: "EASY" | "MEDIUM" | "HARD";
  a?: string; b?: string; c?: string; d?: string;
  correct: string; // for MCQ: "A".."D"; for TRUE_FALSE: "true"/"false"
};

const QUESTIONS: Q[] = [
  { question: "What is 7 × 8?", type: "MCQ", level: "EASY",
    a: "54", b: "56", c: "63", d: "48", correct: "B" },
  { question: "Which of these is a prime number?", type: "MCQ", level: "MEDIUM",
    a: "9", b: "15", c: "17", d: "21", correct: "C" },
  { question: "What is the value of 1/2 + 1/4?", type: "MCQ", level: "MEDIUM",
    a: "1/6", b: "2/6", c: "3/4", d: "1/3", correct: "C" },
  { question: "The largest planet in our solar system is Jupiter.", type: "TRUE_FALSE", level: "EASY",
    correct: "true" },
  { question: "Accra is the capital city of Ghana.", type: "TRUE_FALSE", level: "EASY",
    correct: "true" },
  { question: "Which word is a noun?", type: "MCQ", level: "EASY",
    a: "Run", b: "Quickly", c: "Teacher", d: "Beautiful", correct: "C" },
  { question: "What is 100 ÷ 4?", type: "MCQ", level: "EASY",
    a: "20", b: "25", c: "30", d: "40", correct: "B" },
  { question: "Water boils at 50°C at sea level.", type: "TRUE_FALSE", level: "MEDIUM",
    correct: "false" },
];

async function main() {
  console.log("→ Seeding online exam questions…");

  const session = await prisma.academicSession.findFirst({ where: { isActive: true } });
  if (!session) throw new Error("No active session found");

  // Target the demo student's class so student.demo can actually take it; fall
  // back to Basic 1, then the first class.
  let klass: any = null;
  const demoUser = await prisma.user.findFirst({ where: { email: { contains: "student.demo" } } });
  if (demoUser) {
    const demoStudent = await prisma.student.findUnique({
      where: { userId: demoUser.id },
      include: { sessions: { include: { classSection: { include: { class: true } } }, orderBy: { createdAt: "desc" }, take: 1 } },
    });
    klass = demoStudent?.sessions?.[0]?.classSection?.class ?? null;
  }
  klass =
    klass ??
    (await prisma.class.findUnique({ where: { name: "Basic 1" } })) ??
    (await prisma.class.findFirst({ orderBy: { name: "asc" } }));
  if (!klass) throw new Error("No class found");

  // A subject for the class (questions can be tagged with one)
  const subject =
    (await prisma.subject.findFirst({ where: { classId: klass.id, sessionId: session.id } })) ??
    (await prisma.subject.findFirst());

  // Find-or-create each question (dedupe on exact question text + class)
  const questionIds: string[] = [];
  for (const q of QUESTIONS) {
    let existing = await prisma.question.findFirst({
      where: { question: q.question, classId: klass.id },
    });
    if (!existing) {
      existing = await prisma.question.create({
        data: {
          question: q.question,
          questionType: q.type,
          level: q.level,
          classId: klass.id,
          subjectId: subject?.id ?? null,
          optionA: q.a ?? null,
          optionB: q.b ?? null,
          optionC: q.c ?? null,
          optionD: q.d ?? null,
          correctAnswer: q.correct,
          isActive: true,
        },
      });
    }
    questionIds.push(existing.id);
  }
  console.log(`  ✓ ${questionIds.length} questions ready`);

  // Find-or-create a published exam scoped to the class, live for the next 30 days
  const title = "General Knowledge Quiz";
  let exam = await prisma.onlineExam.findFirst({ where: { title, classId: klass.id } });
  const now = new Date();
  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (!exam) {
    exam = await prisma.onlineExam.create({
      data: {
        title,
        classId: klass.id,
        subjectId: subject?.id ?? null,
        sessionId: session.id,
        instructions: "Answer all questions. Each question carries 1 mark. Good luck!",
        duration: 30,
        passingPercentage: 50,
        startTime: new Date(now.getTime() - 60 * 60 * 1000), // started an hour ago → Live now
        endTime: end,
        isPublished: true,
      },
    });
    console.log(`  ✓ created exam "${title}" (Live)`);
  } else {
    // Make sure it's published and currently live so students can take it
    exam = await prisma.onlineExam.update({
      where: { id: exam.id },
      data: {
        isPublished: true,
        startTime: new Date(now.getTime() - 60 * 60 * 1000),
        endTime: end,
      },
    });
    console.log(`  ✓ exam "${title}" exists — ensured Live & published`);
  }

  // Attach questions to the exam (unique on [onlineExamId, questionId])
  let order = 0;
  for (const qid of questionIds) {
    await prisma.onlineExamQuestion.upsert({
      where: { onlineExamId_questionId: { onlineExamId: exam.id, questionId: qid } },
      create: { onlineExamId: exam.id, questionId: qid, marks: 1, order: order++ },
      update: { order: order++ },
    });
  }

  // Keep totalQuestions / totalMarks in sync
  await prisma.onlineExam.update({
    where: { id: exam.id },
    data: { totalQuestions: questionIds.length, totalMarks: questionIds.length },
  });

  console.log(`  ✓ linked ${questionIds.length} questions to "${title}" for ${klass.name}`);
  console.log("✓ Done — students in", klass.name, "can now take the exam.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
