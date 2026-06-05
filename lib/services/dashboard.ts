import { prisma } from "@/lib/prisma";

export interface DashboardStats {
  // Top row
  totalStudents: number;
  staffByRole: Record<string, number>;
  monthCollection: number;       // fee deposits created this month
  monthExpense: number;

  // Fees overview
  feesTotal: number;
  feesPaid: number;
  feesUnpaid: number;
  feesPartial: number;

  // Attendance today
  studentAttendance: { present: number; absent: number; late: number; holiday: number; halfDay: number; total: number };
  staffAttendance: { present: number; absent: number; total: number };

  // Book overview
  books: { total: number; issued: number; available: number; dueForReturn: number };

  // Enquiry overview
  enquiries: { total: number; active: number; won: number; lost: number };

  // Leave this month
  studentLeave: { total: number; approved: number };
  staffLeave: { total: number; approved: number };

  // Today's fee payments
  todayPayments: { studentName: string; amount: number; createdAt: string }[];

  currentSession: string;
  currentSessionId: string | null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const currentSession = await (prisma as any).academicSession.findFirst({
    where: { isActive: true },
    orderBy: { startDate: "desc" },
  });

  const [presentType, absentType, lateType, holidayType, halfDayType] = await Promise.all([
    (prisma as any).attendanceType.findUnique({ where: { keyValue: "P" } }),
    (prisma as any).attendanceType.findUnique({ where: { keyValue: "A" } }),
    (prisma as any).attendanceType.findUnique({ where: { keyValue: "L" } }),
    (prisma as any).attendanceType.findUnique({ where: { keyValue: "H" } }),
    (prisma as any).attendanceType.findUnique({ where: { keyValue: "F" } }),
  ]);

  // All attendance type IDs for present staff
  const staffPresType = await (prisma as any).staffAttendanceType.findFirst({ where: { keyValue: "P" } });
  const staffAbsType  = await (prisma as any).staffAttendanceType.findFirst({ where: { keyValue: "A" } });

  const sessionFilter = currentSession ? { sessionId: currentSession.id } : {};

  const [
    totalStudents,
    allStaff,
    // Fees
    allFeesMasters,
    depositsThisMonth,
    // Attendance
    studPresent, studAbsent, studLate, studHoliday, studHalf,
    staffPresent, staffAbsent, totalStaffCount,
    // Books
    totalBooks, issuedBooks, overdueBooks,
    // Enquiries
    enquiryTotal, enquiryActive, enquiryWon, enquiryLost,
    // Leave
    studentLeaveMth, studentLeaveApproved,
    staffLeaveMth, staffLeaveApproved,
    // Today's payments
    todayDeposits,
    // Expense
    expenseThisMonth,
  ] = await Promise.all([
    // Total students in current session
    currentSession
      ? (prisma as any).studentSession.count({ where: { sessionId: currentSession.id, isActive: true } })
      : (prisma as any).student.count({ where: { isActive: true } }),

    // Staff list for role breakdown
    (prisma as any).staff.findMany({ where: { isActive: true }, select: { user: { select: { role: true } } } }),

    // All fee masters this session (for paid/unpaid calc)
    currentSession
      ? (prisma as any).studentFeesMaster.findMany({
          where: { studentSession: { ...sessionFilter }, isActive: true },
          include: { deposits: { select: { id: true } } },
        })
      : [],

    // Fee deposits created this month
    (prisma as any).feeDeposit.count({
      where: { createdAt: { gte: monthStart, lte: monthEnd }, isActive: true },
    }),

    // Student attendance today
    presentType ? (prisma as any).studentAttendance.count({ where: { attendanceTypeId: presentType.id, attendanceDay: { date: today } } }) : 0,
    absentType  ? (prisma as any).studentAttendance.count({ where: { attendanceTypeId: absentType.id,  attendanceDay: { date: today } } }) : 0,
    lateType    ? (prisma as any).studentAttendance.count({ where: { attendanceTypeId: lateType.id,    attendanceDay: { date: today } } }) : 0,
    holidayType ? (prisma as any).studentAttendance.count({ where: { attendanceTypeId: holidayType.id, attendanceDay: { date: today } } }) : 0,
    halfDayType ? (prisma as any).studentAttendance.count({ where: { attendanceTypeId: halfDayType.id, attendanceDay: { date: today } } }) : 0,

    // Staff attendance today
    staffPresType ? (prisma as any).staffAttendance.count({ where: { staffAttendanceTypeId: staffPresType.id, date: today } }) : 0,
    staffAbsType  ? (prisma as any).staffAttendance.count({ where: { staffAttendanceTypeId: staffAbsType.id,  date: today } }) : 0,
    (prisma as any).staff.count({ where: { isActive: true } }),

    // Books
    (prisma as any).book.aggregate({ _sum: { qty: true } }),
    (prisma as any).bookIssue.count({ where: { returnDate: null, isActive: true } }),
    (prisma as any).bookIssue.count({ where: { returnDate: null, dueDate: { lt: today }, isActive: true } }),

    // Enquiries this month
    (prisma as any).enquiry.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }),
    (prisma as any).enquiry.count({ where: { createdAt: { gte: monthStart, lte: monthEnd }, followUpResult: "active" } }),
    (prisma as any).enquiry.count({ where: { createdAt: { gte: monthStart, lte: monthEnd }, followUpResult: "won" } }),
    (prisma as any).enquiry.count({ where: { createdAt: { gte: monthStart, lte: monthEnd }, followUpResult: "lost" } }),

    // Student leave this month
    (prisma as any).studentLeaveRequest.count({ where: { fromDate: { gte: monthStart }, toDate: { lte: monthEnd } } }),
    (prisma as any).studentLeaveRequest.count({ where: { fromDate: { gte: monthStart }, toDate: { lte: monthEnd }, status: "approved" } }),

    // Staff leave this month
    (prisma as any).leaveRequest.count({ where: { fromDate: { gte: monthStart }, toDate: { lte: monthEnd } } }),
    (prisma as any).leaveRequest.count({ where: { fromDate: { gte: monthStart }, toDate: { lte: monthEnd }, status: "approved" } }),

    // Today's fee deposits with student info
    (prisma as any).feeDeposit.findMany({
      where: { createdAt: { gte: today }, isActive: true },
      include: {
        studentFeesMaster: {
          include: { student: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    // Month expense
    (prisma as any).expense.aggregate({
      where: { date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }).catch(() => ({ _sum: { amount: 0 } })),
  ]);

  // Staff by role
  const staffByRole: Record<string, number> = {};
  for (const s of allStaff) {
    const r = s.user?.role ?? "UNKNOWN";
    staffByRole[r] = (staffByRole[r] ?? 0) + 1;
  }

  // Fee paid/unpaid/partial
  let feesPaid = 0, feesUnpaid = 0, feesPartial = 0;
  for (const fm of allFeesMasters) {
    const depositCount = fm.deposits?.length ?? 0;
    if (depositCount === 0) feesUnpaid++;
    else feesPartial++; // any deposit = partial (exact full-payment check needs JSON parsing)
  }
  // Count ones with deposits as paid if amount >= assigned (simplified)
  feesPaid = feesPartial; feesPartial = 0;

  const studTotal = studPresent + studAbsent + studLate + studHoliday + studHalf;

  return {
    totalStudents,
    staffByRole,
    monthCollection: depositsThisMonth,
    monthExpense: Number(expenseThisMonth._sum?.amount ?? 0),
    feesTotal: allFeesMasters.length,
    feesPaid,
    feesUnpaid,
    feesPartial,
    studentAttendance: { present: studPresent, absent: studAbsent, late: studLate, holiday: studHoliday, halfDay: studHalf, total: studTotal },
    staffAttendance: { present: staffPresent, absent: staffAbsent, total: totalStaffCount },
    books: {
      total: Number(totalBooks._sum?.qty ?? 0),
      issued: issuedBooks,
      available: Math.max(0, Number(totalBooks._sum?.qty ?? 0) - issuedBooks),
      dueForReturn: overdueBooks,
    },
    enquiries: { total: enquiryTotal, active: enquiryActive, won: enquiryWon, lost: enquiryLost },
    studentLeave: { total: studentLeaveMth, approved: studentLeaveApproved },
    staffLeave: { total: staffLeaveMth, approved: staffLeaveApproved },
    todayPayments: todayDeposits.map((d: any) => ({
      studentName: `${d.studentFeesMaster?.student?.firstName ?? ""} ${d.studentFeesMaster?.student?.lastName ?? ""}`.trim(),
      amount: 0,
      createdAt: d.createdAt,
    })),
    currentSession: currentSession?.session ?? "No active session",
    currentSessionId: currentSession?.id ?? null,
  };
}
