import { prisma } from "@/lib/prisma";

export interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  presentToday: number;
  absentToday: number;
  collectedFees: number;
  pendingFees: number;
  upcomingExams: number;
}

export async function getDashboardStats(sessionId: string): Promise<DashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    totalStaff,
    presentToday,
    absentToday,
    collectedAgg,
    totalInvoicedAgg,
    upcomingExams,
  ] = await Promise.all([
    (prisma as any).student.count(),
    (prisma as any).staff.count(),
    (prisma as any).studentAttendance.count({
      where: { status: "PRESENT", attendanceDay: { date: today, sessionId } },
    }),
    (prisma as any).studentAttendance.count({
      where: { status: "ABSENT", attendanceDay: { date: today, sessionId } },
    }),
    (prisma as any).feeInvoice.aggregate({
      where: { feeGroup: { sessionId } },
      _sum: { paidAmount: true },
    }),
    (prisma as any).feeInvoice.aggregate({
      where: { feeGroup: { sessionId } },
      _sum: { totalAmount: true },
    }),
    (prisma as any).examGroup.count({
      where: { sessionId, startDate: { gte: today } },
    }),
  ]);

  const collectedFees = Number(collectedAgg._sum.paidAmount ?? 0);
  const totalInvoiced = Number(totalInvoicedAgg._sum.totalAmount ?? 0);

  return {
    totalStudents,
    totalStaff,
    presentToday,
    absentToday,
    collectedFees,
    pendingFees: Math.max(0, totalInvoiced - collectedFees),
    upcomingExams,
  };
}
