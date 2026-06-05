import { prisma } from "@/lib/prisma";

export interface DashboardStats {
  totalStudents: number;
  staffByRole: Record<string, number>;
  monthCollection: number;
  monthExpense: number;
  feesTotal: number;
  feesPaid: number;
  feesUnpaid: number;
  studentAttendance: { present: number; absent: number; late: number; halfDay: number; total: number };
  staffAttendance: { present: number; absent: number; total: number };
  books: { total: number; issued: number; available: number; dueForReturn: number };
  enquiries: { total: number; contacted: number; converted: number };
  studentLeave: { total: number; approved: number };
  staffLeave: { total: number; approved: number };
  todayPayments: { studentName: string; createdAt: string }[];
  currentSession: string;
  currentSessionId: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safe(fn: () => Promise<any>, fallback: any): Promise<any> {
  try { return await fn(); } catch (e) { console.error("[dashboard]", e); return fallback; }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // midnight local
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Active session — most recently started active session, fallback to any most recent
  const currentSession = await safe(() =>
    (prisma as any).academicSession.findFirst({
      orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
    }), null);

  const sid = currentSession?.id ?? null;

  // Attendance type IDs
  const [presentType, absentType, lateType, halfDayType] = await Promise.all([
    safe(() => (prisma as any).attendanceType.findUnique({ where: { keyValue: "P" } }), null),
    safe(() => (prisma as any).attendanceType.findUnique({ where: { keyValue: "A" } }), null),
    safe(() => (prisma as any).attendanceType.findUnique({ where: { keyValue: "L" } }), null),
    safe(() => (prisma as any).attendanceType.findUnique({ where: { keyValue: "F" } }), null),
  ]);
  const [staffPresType, staffAbsType] = await Promise.all([
    safe(() => (prisma as any).staffAttendanceType.findFirst({ where: { keyValue: "P" } }), null),
    safe(() => (prisma as any).staffAttendanceType.findFirst({ where: { keyValue: "A" } }), null),
  ]);

  const [
    totalStudents, allStaff,
    allFeesMasters, depositsThisMonth,
    studPresent, studAbsent, studLate, studHalf,
    staffPresent, staffAbsent, totalStaffCount,
    totalBooksAgg, issuedBooks, overdueBooks,
    enquiryTotal, enquiryContacted, enquiryConverted,
    studentLeaveMth, studentLeaveApproved,
    staffLeaveMth, staffLeaveApproved,
    todayDeposits, expenseThisMonth,
  ] = await Promise.all([
    safe(() => sid
      ? (prisma as any).studentSession.count({ where: { sessionId: sid, isActive: true } })
      : (prisma as any).student.count({ where: { isActive: true } }), 0),

    safe(() => (prisma as any).staff.findMany({
      where: { isActive: true }, select: { user: { select: { role: true } } },
    }), []),

    safe(() => sid
      ? (prisma as any).studentFeesMaster.findMany({
          where: { studentSession: { sessionId: sid }, isActive: true },
          select: { deposits: { select: { id: true } } },
        })
      : [], []),

    safe(() => (prisma as any).feeDeposit.count({
      where: { createdAt: { gte: monthStart, lte: monthEnd }, isActive: true },
    }), 0),

    safe(() => presentType
      ? (prisma as any).studentAttendance.count({ where: { attendanceTypeId: presentType.id, attendanceDay: { date: today } } })
      : 0, 0),
    safe(() => absentType
      ? (prisma as any).studentAttendance.count({ where: { attendanceTypeId: absentType.id, attendanceDay: { date: today } } })
      : 0, 0),
    safe(() => lateType
      ? (prisma as any).studentAttendance.count({ where: { attendanceTypeId: lateType.id, attendanceDay: { date: today } } })
      : 0, 0),
    safe(() => halfDayType
      ? (prisma as any).studentAttendance.count({ where: { attendanceTypeId: halfDayType.id, attendanceDay: { date: today } } })
      : 0, 0),

    safe(() => staffPresType
      ? (prisma as any).staffAttendance.count({ where: { staffAttendanceTypeId: staffPresType.id, date: today } })
      : 0, 0),
    safe(() => staffAbsType
      ? (prisma as any).staffAttendance.count({ where: { staffAttendanceTypeId: staffAbsType.id, date: today } })
      : 0, 0),
    safe(() => (prisma as any).staff.count({ where: { isActive: true } }), 0),

    safe(() => (prisma as any).book.aggregate({ _sum: { qty: true } }), { _sum: { qty: 0 } }),
    safe(() => (prisma as any).bookIssue.count({ where: { returnedAt: null } }), 0),
    safe(() => (prisma as any).bookIssue.count({ where: { returnedAt: null, dueDate: { lt: today } } }), 0),

    safe(() => (prisma as any).enquiry.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }), 0),
    safe(() => (prisma as any).enquiry.count({ where: { createdAt: { gte: monthStart, lte: monthEnd }, status: "CONTACTED" } }), 0),
    safe(() => (prisma as any).enquiry.count({ where: { createdAt: { gte: monthStart, lte: monthEnd }, status: "CONVERTED" } }), 0),

    safe(() => (prisma as any).studentLeaveRequest.count({ where: { fromDate: { gte: monthStart }, toDate: { lte: monthEnd } } }), 0),
    safe(() => (prisma as any).studentLeaveRequest.count({ where: { fromDate: { gte: monthStart }, toDate: { lte: monthEnd }, status: "APPROVED" } }), 0),

    safe(() => (prisma as any).staffLeaveRequest.count({ where: { fromDate: { gte: monthStart }, toDate: { lte: monthEnd } } }), 0),
    safe(() => (prisma as any).staffLeaveRequest.count({ where: { fromDate: { gte: monthStart }, toDate: { lte: monthEnd }, status: "APPROVED" } }), 0),

    safe(() => (prisma as any).feeDeposit.findMany({
      where: { createdAt: { gte: today }, isActive: true },
      include: { studentFeesMaster: { include: { student: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }), []),

    safe(() => (prisma as any).transaction.aggregate({
      where: { type: "EXPENSE", date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }), { _sum: { amount: 0 } }),
  ]);

  const staffByRole: Record<string, number> = {};
  for (const s of allStaff) {
    const r = s.user?.role ?? "UNKNOWN";
    staffByRole[r] = (staffByRole[r] ?? 0) + 1;
  }

  const feesPaid   = allFeesMasters.filter((fm: any) => fm.deposits?.length > 0).length;
  const feesUnpaid = allFeesMasters.length - feesPaid;
  const studTotal  = studPresent + studAbsent + studLate + studHalf;
  const totalBooks = Number(totalBooksAgg._sum?.qty ?? 0);

  return {
    totalStudents,
    staffByRole,
    monthCollection: depositsThisMonth,
    monthExpense: Number(expenseThisMonth._sum?.amount ?? 0),
    feesTotal: allFeesMasters.length,
    feesPaid,
    feesUnpaid,
    studentAttendance: { present: studPresent, absent: studAbsent, late: studLate, halfDay: studHalf, total: studTotal },
    staffAttendance: { present: staffPresent, absent: staffAbsent, total: totalStaffCount },
    books: { total: totalBooks, issued: issuedBooks, available: Math.max(0, totalBooks - issuedBooks), dueForReturn: overdueBooks },
    enquiries: { total: enquiryTotal, contacted: enquiryContacted, converted: enquiryConverted },
    studentLeave: { total: studentLeaveMth, approved: studentLeaveApproved },
    staffLeave: { total: staffLeaveMth, approved: staffLeaveApproved },
    todayPayments: todayDeposits.map((d: any) => ({
      studentName: `${d.studentFeesMaster?.student?.firstName ?? ""} ${d.studentFeesMaster?.student?.lastName ?? ""}`.trim(),
      createdAt: d.createdAt,
    })),
    currentSession: currentSession?.session ?? "No active session",
    currentSessionId: sid,
  };
}
