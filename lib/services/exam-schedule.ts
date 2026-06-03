import { prisma } from "@/lib/prisma";

export interface CreateExamGroupInput {
  name: string;
  sessionId: string;
  startDate: Date;
  endDate: Date;
}

export interface AddExamScheduleInput {
  examGroupId: string;
  subjectId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  maxMarks: number;
  passingMarks: number;
  room?: string;
}

export async function createExamGroup(input: CreateExamGroupInput) {
  if (!input.name.trim()) throw new Error("name is required");
  if (!input.sessionId) throw new Error("sessionId is required");
  if (input.endDate <= input.startDate) throw new Error("endDate must be after startDate");

  return (prisma as any).examGroup.create({
    data: {
      name: input.name.trim(),
      sessionId: input.sessionId,
      startDate: input.startDate,
      endDate: input.endDate,
      published: false,
    },
  });
}

export async function addExamSchedule(input: AddExamScheduleInput) {
  if (input.maxMarks <= 0) throw new Error("maxMarks must be greater than 0");
  if (input.passingMarks > input.maxMarks) throw new Error("passingMarks cannot exceed maxMarks");
  if (input.endTime <= input.startTime) throw new Error("endTime must be after startTime");

  const group = await (prisma as any).examGroup.findUnique({
    where: { id: input.examGroupId },
  });
  if (!group) throw new Error("exam group not found");
  if (group.published) throw new Error("cannot modify a published exam group");

  return (prisma as any).examSchedule.create({
    data: {
      examGroupId: input.examGroupId,
      subjectId: input.subjectId,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      maxMarks: input.maxMarks,
      passingMarks: input.passingMarks,
      room: input.room,
    },
  });
}

export async function publishExamGroup(examGroupId: string) {
  const group = await (prisma as any).examGroup.findUnique({
    where: { id: examGroupId },
  });
  if (!group) throw new Error("exam group not found");
  if (group.published) throw new Error("exam group is already published");

  const schedules = await (prisma as any).examSchedule.findMany({
    where: { examGroupId },
  });
  if (schedules.length === 0) throw new Error("cannot publish an exam group with no schedules");

  return (prisma as any).examGroup.update({
    where: { id: examGroupId },
    data: { published: true },
  });
}

export async function getExamGroupWithSchedules(examGroupId: string) {
  return (prisma as any).examGroup.findUnique({
    where: { id: examGroupId },
    include: {
      schedules: {
        include: {
          subject: { select: { name: true, code: true } },
        },
        orderBy: { date: "asc" },
      },
    },
  });
}
