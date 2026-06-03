import { prisma } from "@/lib/prisma";
import {
  getAttendanceSummary,
  type AttendanceRecord,
  type AttendanceStatusValue,
} from "@/lib/domain/attendance";

export interface AttendanceRecordInput {
  studentId: string;
  status: AttendanceStatusValue;
  note?: string;
}

export interface MarkAttendanceInput {
  sectionId: string;
  sessionId: string;
  date: Date;
  records: AttendanceRecordInput[];
}

export async function markAttendance(input: MarkAttendanceInput): Promise<void> {
  if (!input.sectionId) throw new Error("sectionId is required");
  if (input.records.length === 0)
    throw new Error("attendance records cannot be empty");

  const now = new Date();
  now.setHours(23, 59, 59, 999);
  if (input.date > now) {
    throw new Error("cannot mark attendance for a future date");
  }

  const attendanceDay = await prisma.attendanceDay.upsert({
    where: {
      date_sectionId: {
        date: input.date,
        sectionId: input.sectionId,
      },
    },
    create: {
      date: input.date,
      sectionId: input.sectionId,
      sessionId: input.sessionId,
    },
    update: {},
  });

  await Promise.all(
    input.records.map((record) =>
      prisma.studentAttendance.upsert({
        where: {
          attendanceDayId_studentId: {
            attendanceDayId: attendanceDay.id,
            studentId: record.studentId,
          },
        },
        create: {
          attendanceDayId: attendanceDay.id,
          studentId: record.studentId,
          status: record.status,
          note: record.note,
        },
        update: {
          status: record.status,
          note: record.note,
        },
      })
    )
  );
}

export async function getStudentAttendanceSummary(
  studentId: string,
  sessionId: string
) {
  const rows = await prisma.studentAttendance.findMany({
    where: {
      studentId,
      attendanceDay: { sessionId },
    },
    include: { attendanceDay: true },
  });

  const records: AttendanceRecord[] = rows.map((r) => ({
    date: r.attendanceDay.date,
    status: r.status as AttendanceStatusValue,
  }));

  return getAttendanceSummary(records);
}
