import { prisma } from "@/lib/prisma";

export interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  presentToday: number;
  absentToday: number;
  totalFeeAssigned: number;
  totalFeeDeposits: number;
  upcomingExams: number;
  currentSession: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get the most recent active session
  const currentSession = await (prisma as any).academicSession.findFirst({
    where: { isActive: true },
    orderBy: { startDate: "desc" },
  });

  // AttendanceType IDs for P=Present, A=Absent
  const [presentType, absentType] = await Promise.all([
    (prisma as any).attendanceType.findUnique({ where: { keyValue: "P" } }),
    (prisma as any).attendanceType.findUnique({ where: { keyValue: "A" } }),
  ]);

  const [
    totalStudents,
    totalStaff,
    presentToday,
    absentToday,
    feeAssignedAgg,
    totalFeeDeposits,
    upcomingExams,
  ] = await Promise.all([
    (prisma as any).student.count({ where: { isActive: true } }),
    (prisma as any).staff.count({ where: { isActive: true } }),
    presentType
      ? (prisma as any).studentAttendance.count({
          where: { attendanceTypeId: presentType.id, attendanceDay: { date: today } },
        })
      : 0,
    absentType
      ? (prisma as any).studentAttendance.count({
          where: { attendanceTypeId: absentType.id, attendanceDay: { date: today } },
        })
      : 0,
    currentSession
      ? (prisma as any).studentFeesMaster.aggregate({
          where: { studentSession: { sessionId: currentSession.id }, isActive: true },
          _sum: { amount: true },
        })
      : { _sum: { amount: 0 } },
    currentSession
      ? (prisma as any).feeDeposit.count({
          where: { isActive: true, studentFeesMaster: { studentSession: { sessionId: currentSession.id } } },
        })
      : 0,
    (prisma as any).examSchedule.count({
      where: {
        dateOfExam: { gte: today },
        ...(currentSession ? { sessionId: currentSession.id } : {}),
      },
    }),
  ]);

  return {
    totalStudents,
    totalStaff,
    presentToday,
    absentToday,
    totalFeeAssigned: Number(feeAssignedAgg._sum?.amount ?? 0),
    totalFeeDeposits,
    upcomingExams,
    currentSession: currentSession?.session ?? "No active session",
  };
}
