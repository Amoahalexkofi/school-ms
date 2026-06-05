import { getDb } from "@/lib/db";
import {
  validateSlot,
  type TimetableSlot,
  type DayOfWeek,
} from "@/lib/domain/timetable";

export async function getSectionTimetable(sectionId: string) {
  const prisma = await getDb();
  return (prisma as any).timetableSlot.findMany({
    where: { sectionId },
    orderBy: [{ day: "asc" }, { period: "asc" }],
    include: {
      subject: { select: { name: true, code: true } },
      staff: { select: { firstName: true, lastName: true } },
    },
  });
}

export async function addTimetableSlot(input: {
  sectionId: string;
  day: DayOfWeek;
  period: number;
  startTime: string;
  endTime: string;
  staffId?: string;
  subjectId?: string;
}) {
  const candidate: TimetableSlot = {
    id: "__new__",
    sectionId: input.sectionId,
    day: input.day,
    period: input.period,
    startTime: input.startTime,
    endTime: input.endTime,
    staffId: input.staffId,
  };
  validateSlot(candidate);

  const prisma = await getDb();
  const existing: TimetableSlot[] = await (prisma as any).timetableSlot.findMany({
    where: { sectionId: input.sectionId, day: input.day },
  });

  const dupPeriod = existing.find((s) => s.period === input.period);
  if (dupPeriod) {
    throw new Error(
      `duplicate period ${input.period} on ${input.day} for section ${input.sectionId}`
    );
  }

  if (input.staffId) {
    const teacherSlots: TimetableSlot[] = await (prisma as any).timetableSlot.findMany({
      where: { staffId: input.staffId, day: input.day, period: input.period },
    });
    if (teacherSlots.length > 0) {
      throw new Error(
        `teacher is double-booked on ${input.day} period ${input.period}`
      );
    }
  }

  return (prisma as any).timetableSlot.create({ data: input });
}
