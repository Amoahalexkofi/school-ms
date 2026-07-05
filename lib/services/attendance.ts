import { getDb } from "@/lib/db";

export async function markAttendance(input: {
  classSectionId: string;
  sessionId: string;
  date: Date;
  records: { studentId: string; studentSessionId: string; attendanceTypeId: string; inTime?: string; outTime?: string; remark?: string }[];
}): Promise<void> {
  if (!input.classSectionId) throw new Error("classSectionId is required");
  if (input.records.length === 0) throw new Error("attendance records cannot be empty");

  const now = new Date();
  now.setHours(23, 59, 59, 999);
  if (input.date > now) throw new Error("Cannot mark attendance for a future date");

  const prisma = await getDb();
  // Day + records commit atomically — a mid-save failure must not leave a
  // half-marked register.
  await (prisma as any).$transaction(async (tx: any) => {
    const attendanceDay = await tx.attendanceDay.upsert({
      where: { date_classSectionId: { date: input.date, classSectionId: input.classSectionId } },
      create: { date: input.date, classSectionId: input.classSectionId, sessionId: input.sessionId },
      update: {},
    });

    for (const r of input.records) {
      await tx.studentAttendance.upsert({
        where: { studentSessionId_attendanceDayId: { studentSessionId: r.studentSessionId, attendanceDayId: attendanceDay.id } },
        create: {
          studentId: r.studentId,
          studentSessionId: r.studentSessionId,
          attendanceDayId: attendanceDay.id,
          attendanceTypeId: r.attendanceTypeId,
          inTime: r.inTime,
          outTime: r.outTime,
          remark: r.remark,
        },
        update: {
          attendanceTypeId: r.attendanceTypeId,
          inTime: r.inTime,
          outTime: r.outTime,
          remark: r.remark,
        },
      });
    }
  }, { timeout: 30000 });
}

export async function getStudentAttendanceSummary(studentId: string, sessionId: string) {
  const prisma = await getDb();
  const rows = await (prisma as any).studentAttendance.findMany({
    where: { studentId, attendanceDay: { sessionId } },
    include: { attendanceDay: true, attendanceType: true },
  });

  const total = rows.length;
  const present = rows.filter((r: any) => r.attendanceType?.keyValue === "P").length;
  const late = rows.filter((r: any) => r.attendanceType?.keyValue === "L").length;
  const absent = rows.filter((r: any) => r.attendanceType?.keyValue === "A").length;
  const halfDay = rows.filter((r: any) => r.attendanceType?.keyValue === "F").length;
  const holiday = rows.filter((r: any) => r.attendanceType?.keyValue === "H").length;

  const schoolDays = total - holiday;
  const effectivePresent = present + late + halfDay * 0.5;
  const percentage = schoolDays > 0 ? Math.round((effectivePresent / schoolDays) * 100) : 0;

  return { total, present, late, absent, halfDay, holiday, schoolDays, percentage };
}
