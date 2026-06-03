import { prisma } from "@/lib/prisma";

export interface CreateHomeworkInput {
  title: string;
  description?: string;
  subjectId: string;
  sectionId: string;
  assignedById: string;
  dueDate: Date;
}

export interface ListHomeworkFilter {
  sectionId: string;
  subjectId?: string;
}

export async function createHomework(input: CreateHomeworkInput) {
  if (!input.title.trim()) throw new Error("title is required");
  if (!input.subjectId) throw new Error("subjectId is required");
  if (!input.sectionId) throw new Error("sectionId is required");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(input.dueDate);
  due.setHours(0, 0, 0, 0);
  if (due < today) throw new Error("dueDate cannot be in the past");

  return (prisma as any).homework.create({
    data: {
      title: input.title.trim(),
      description: input.description,
      subjectId: input.subjectId,
      sectionId: input.sectionId,
      assignedById: input.assignedById,
      dueDate: input.dueDate,
    },
  });
}

export async function listHomework(filter: ListHomeworkFilter) {
  const where: Record<string, unknown> = { sectionId: filter.sectionId };
  if (filter.subjectId) where.subjectId = filter.subjectId;

  return (prisma as any).homework.findMany({
    where,
    orderBy: { dueDate: "asc" },
    include: {
      subject: { select: { name: true, code: true } },
      assignedBy: { select: { firstName: true, lastName: true } },
    },
  });
}

export async function acknowledgeHomework(homeworkId: string, studentId: string) {
  const hw = await (prisma as any).homework.findUnique({ where: { id: homeworkId } });
  if (!hw) throw new Error("homework not found");

  return (prisma as any).homeworkAcknowledgement.upsert({
    where: {
      homeworkId_studentId: { homeworkId, studentId },
    },
    create: { homeworkId, studentId, acknowledgedAt: new Date() },
    update: { acknowledgedAt: new Date() },
  });
}
