import { getDb } from "@/lib/db";

export async function listLessonPlans(filters?: { staffId?: string; sectionId?: string; subjectId?: string }) {
  const prisma = await getDb();
  return (prisma as any).lessonPlan.findMany({
    where: {
      ...(filters?.staffId ? { staffId: filters.staffId } : {}),
      ...(filters?.sectionId ? { sectionId: filters.sectionId } : {}),
      ...(filters?.subjectId ? { subjectId: filters.subjectId } : {}),
    },
    include: { staff: true, subject: true, section: { include: { class: true } } },
    orderBy: { date: "desc" },
  });
}

export async function createLessonPlan(input: {
  staffId: string;
  subjectId: string;
  sectionId: string;
  date: Date;
  topic: string;
  description?: string;
}) {
  if (!input.topic.trim()) throw Object.assign(new Error("Topic is required"), { code: "VALIDATION" });
  const prisma = await getDb();
  return (prisma as any).lessonPlan.create({
    data: { ...input, topic: input.topic.trim() },
    include: { staff: true, subject: true, section: { include: { class: true } } },
  });
}

export async function updateLessonPlanStatus(id: string, status: "DRAFT" | "SUBMITTED" | "APPROVED") {
  const prisma = await getDb();
  const plan = await (prisma as any).lessonPlan.findUnique({ where: { id } });
  if (!plan) throw Object.assign(new Error("Lesson plan not found"), { code: "NOT_FOUND" });
  return (prisma as any).lessonPlan.update({ where: { id }, data: { status } });
}
