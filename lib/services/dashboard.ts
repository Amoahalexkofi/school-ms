import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";

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
  todayPayments: { studentName: string; createdAt: string; amount: number }[];
  currentSession: string;
  currentSessionId: string | null;
  sparklines: { fees: number[]; expenses: number[] };
  lastMonthCollection: number;
  lastMonthExpense: number;
  attendanceTrend: { date: string; pct: number }[];
  outstandingByClass: { name: string; unpaid: number; total: number }[];
  monthlyCollections: { label: string; amount: number }[];
  classAverages: { name: string; avg: number }[];
  sessionProgress: { week: number; schoolDaysLeft: number } | null;
  unmarkedSections: string[];
  termCollection: { name: string; amount: number } | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safe(fn: () => Promise<any>, fallback: any): Promise<any> {
  try { return await fn(); } catch (e) { console.error("[dashboard]", e); return fallback; }
}

// FeeDeposit stores money in the amountDetail JSON ({ "1": { amount, ... } }),
// NOT a scalar `amount`. Sum it the same way the fee hub/reports do.
function sumDeposit(d: any): number {
  const detail = d?.amountDetail;
  if (!detail) return 0;
  const vals = Array.isArray(detail) ? detail : Object.values(detail);
  return vals.reduce((s: number, v: any) => s + Number(v?.amount ?? 0), 0);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const prisma = await getDb();

  // Multi Branch: scope branch-relevant stats to the active branch.
  const branchId  = await getActiveBranchId();
  const studWhere : any = branchId ? { student: { branchId } } : {};   // for studentAttendance / studentFeesMaster
  const staffWhere: any = branchId ? { branchId } : {};                // for staff
  const depWhere  : any = branchId ? { studentFeesMaster: { student: { branchId } } } : {}; // for feeDeposit

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  // Compare month-to-date against the SAME days of last month — a half-finished
  // month measured against a whole one reads as a crash that never happened.
  const daysInLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  const lastMonthEnd = new Date(
    now.getFullYear(), now.getMonth() - 1,
    Math.min(now.getDate(), daysInLastMonth), 23, 59, 59
  );

  const currentSession = await safe(() =>
    (prisma as any).academicSession.findFirst({
      orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
    }), null);

  const sid = currentSession?.id ?? null;

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
      ? (prisma as any).studentSession.count({ where: { sessionId: sid, isActive: true, ...studWhere } })
      : (prisma as any).student.count({ where: { isActive: true, ...(branchId ? { branchId } : {}) } }), 0),

    safe(() => (prisma as any).staff.findMany({
      where: { isActive: true, ...staffWhere }, select: { user: { select: { role: true } } },
    }), []),

    safe(() => sid
      ? (prisma as any).studentFeesMaster.findMany({
          where: { studentSession: { sessionId: sid }, isActive: true, ...studWhere },
          select: { deposits: { select: { id: true } } },
        })
      : [], []),

    safe(() => (prisma as any).feeDeposit.findMany({
      where: { createdAt: { gte: monthStart, lte: monthEnd }, isActive: true, ...depWhere },
      select: { amountDetail: true },
    }), []),

    safe(() => presentType
      ? (prisma as any).studentAttendance.count({ where: { attendanceTypeId: presentType.id, attendanceDay: { date: today }, ...studWhere } })
      : 0, 0),
    safe(() => absentType
      ? (prisma as any).studentAttendance.count({ where: { attendanceTypeId: absentType.id, attendanceDay: { date: today }, ...studWhere } })
      : 0, 0),
    safe(() => lateType
      ? (prisma as any).studentAttendance.count({ where: { attendanceTypeId: lateType.id, attendanceDay: { date: today }, ...studWhere } })
      : 0, 0),
    safe(() => halfDayType
      ? (prisma as any).studentAttendance.count({ where: { attendanceTypeId: halfDayType.id, attendanceDay: { date: today }, ...studWhere } })
      : 0, 0),

    safe(() => staffPresType
      ? (prisma as any).staffAttendance.count({ where: { staffAttendanceTypeId: staffPresType.id, date: today, ...staffWhere } })
      : 0, 0),
    safe(() => staffAbsType
      ? (prisma as any).staffAttendance.count({ where: { staffAttendanceTypeId: staffAbsType.id, date: today, ...staffWhere } })
      : 0, 0),
    safe(() => (prisma as any).staff.count({ where: { isActive: true, ...staffWhere } }), 0),

    safe(() => (prisma as any).book.aggregate({ _sum: { quantity: true } }), { _sum: { quantity: 0 } }),
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
      where: { createdAt: { gte: today }, isActive: true, ...depWhere },
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
  const monthCollection = depositsThisMonth.reduce((s: number, d: any) => s + sumDeposit(d), 0);
  const studTotal  = studPresent + studAbsent + studLate + studHalf;
  const totalBooks = Number(totalBooksAgg._sum?.quantity ?? 0);

  // ── 7-day sparklines ──────────────────────────────────────────────────────
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [weekFeeDeposits, weekExpenses] = await Promise.all([
    safe(() => (prisma as any).feeDeposit.findMany({
      where: { createdAt: { gte: sevenDaysAgo }, isActive: true, ...depWhere },
      select: { createdAt: true, amountDetail: true },
    }), []),
    safe(() => (prisma as any).transaction.findMany({
      where: { type: "EXPENSE", date: { gte: sevenDaysAgo } },
      select: { date: true, amount: true },
    }), []),
  ]);

  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const feesByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (6 - i));
    const k = dayKey(d);
    return weekFeeDeposits.filter((r: any) => dayKey(new Date(r.createdAt)) === k)
      .reduce((s: number, r: any) => s + sumDeposit(r), 0);
  });
  const expensesByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (6 - i));
    const k = dayKey(d);
    return weekExpenses.filter((r: any) => dayKey(new Date(r.date)) === k)
      .reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);
  });

  // ── Trend analytics: last month comparison, attendance trend, debt map ────
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 13);

  const [lastMonthDeposits, lastMonthExpenseAgg, recentAttendanceDays, unpaidMasters] = await Promise.all([
    safe(() => (prisma as any).feeDeposit.findMany({
      where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd }, isActive: true, ...depWhere },
      select: { amountDetail: true },
    }), []),
    safe(() => (prisma as any).transaction.aggregate({
      where: { type: "EXPENSE", date: { gte: lastMonthStart, lte: lastMonthEnd } },
      _sum: { amount: true },
    }), { _sum: { amount: 0 } }),
    safe(() => (prisma as any).attendanceDay.findMany({
      where: { date: { gte: fourteenDaysAgo, lte: today } },
      select: {
        date: true,
        studentAttendances: { select: { attendanceTypeId: true }, where: studWhere.student ? { student: studWhere.student } : {} },
      },
      orderBy: { date: "asc" },
    }), []),
    safe(() => sid
      ? (prisma as any).studentFeesMaster.findMany({
          where: { studentSession: { sessionId: sid }, isActive: true, ...studWhere },
          select: {
            deposits: { select: { id: true } },
            studentSession: { select: { classSection: { select: { class: { select: { name: true } } } } } },
          },
        })
      : [], []),
  ]);

  const lastMonthCollection = lastMonthDeposits.reduce((s: number, d: any) => s + sumDeposit(d), 0);

  // % present per marked school day (days without records are skipped)
  const trendByDate: Record<string, { present: number; total: number }> = {};
  for (const day of recentAttendanceDays) {
    const k = dayKey(new Date(day.date));
    const bucket = trendByDate[k] ?? (trendByDate[k] = { present: 0, total: 0 });
    for (const a of day.studentAttendances ?? []) {
      bucket.total += 1;
      if (presentType && a.attendanceTypeId === presentType.id) bucket.present += 1;
    }
  }
  const attendanceTrend = Object.entries(trendByDate)
    .filter(([, v]) => v.total > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-10)
    .map(([date, v]) => ({ date, pct: Math.round((v.present / v.total) * 100) }));

  // Where the unpaid invoices live, by class
  const byClass: Record<string, { unpaid: number; total: number }> = {};
  for (const fm of unpaidMasters) {
    const name = fm.studentSession?.classSection?.class?.name ?? "Unassigned";
    const bucket = byClass[name] ?? (byClass[name] = { unpaid: 0, total: 0 });
    bucket.total += 1;
    if (!fm.deposits?.length) bucket.unpaid += 1;
  }
  const outstandingByClass = Object.entries(byClass)
    .map(([name, v]) => ({ name, ...v }))
    .filter(c => c.unpaid > 0)
    .sort((a, b) => b.unpaid - a.unpaid)
    .slice(0, 5);

  // ── Chart data: 6-month collection trend + average score by class ─────────
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const [sixMonthDeposits, sessionMarks] = await Promise.all([
    safe(() => (prisma as any).feeDeposit.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, isActive: true, ...depWhere },
      select: { createdAt: true, amountDetail: true },
    }), []),
    safe(() => sid
      ? (prisma as any).markEntry.findMany({
          where: {
            marksObtained: { not: null },
            examSchedule: { sessionId: sid },
            ...(branchId ? { student: { branchId } } : {}),
          },
          select: {
            marksObtained: true,
            examSchedule: {
              select: {
                fullMarks: true,
                classSection: { select: { class: { select: { name: true } } } },
              },
            },
          },
        })
      : [], []),
  ]);

  const monthlyCollections = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const amount = sixMonthDeposits
      .filter((r: any) => { const t = new Date(r.createdAt); return t >= d && t < next; })
      .reduce((sum: number, r: any) => sum + sumDeposit(r), 0);
    return { label: d.toLocaleDateString("en-GB", { month: "short" }), amount };
  });

  const scoreByClass: Record<string, { sum: number; n: number }> = {};
  for (const m of sessionMarks) {
    const full = Number(m.examSchedule?.fullMarks ?? 0);
    if (full <= 0) continue;
    const name = m.examSchedule?.classSection?.class?.name ?? "Unassigned";
    const pct = (Number(m.marksObtained) / full) * 100;
    const bucket = scoreByClass[name] ?? (scoreByClass[name] = { sum: 0, n: 0 });
    bucket.sum += pct; bucket.n += 1;
  }
  const classAverages = Object.entries(scoreByClass)
    .map(([name, v]) => ({ name, avg: Math.round(v.sum / v.n) }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    .slice(0, 8);

  // ── Session progress: schools think in weeks and days-to-vacation ─────────
  let sessionProgress: { week: number; schoolDaysLeft: number } | null = null;
  if (currentSession?.startDate && currentSession?.endDate) {
    const start = new Date(currentSession.startDate);
    const end = new Date(currentSession.endDate);
    if (today >= start && today <= end) {
      const week = Math.max(1, Math.ceil(((today.getTime() - start.getTime()) / 86400000 + 1) / 7));
      let schoolDaysLeft = 0;
      for (let d = new Date(today); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0 && d.getDay() !== 6) schoolDaysLeft++;
      }
      sessionProgress = { week, schoolDaysLeft };
    }
  }

  // ── Collected this term (when the school has set terms) ───────────────────
  let termCollection: { name: string; amount: number } | null = null;
  const coveringTerm = sid ? await safe(async () => {
    const ts = await (prisma as any).term.findMany({ where: { sessionId: sid } });
    const mid = today.getTime();
    return ts.find((t: any) => mid >= new Date(t.startDate).getTime() && mid <= new Date(t.endDate).getTime())
      ?? ts.find((t: any) => t.isCurrent) ?? null;
  }, null) : null;
  if (coveringTerm) {
    const termDeposits = await safe(() => (prisma as any).feeDeposit.findMany({
      where: { createdAt: { gte: new Date(coveringTerm.startDate), lte: new Date(new Date(coveringTerm.endDate).setHours(23, 59, 59)) }, isActive: true, ...depWhere },
      select: { amountDetail: true },
    }), []);
    termCollection = {
      name: coveringTerm.name,
      amount: termDeposits.reduce((s2: number, d: any) => s2 + sumDeposit(d), 0),
    };
  }

  // ── Which class sections haven't marked attendance today (compliance) ─────
  const [allSections, markedToday] = await Promise.all([
    safe(() => (prisma as any).classSection.findMany({
      select: { id: true, class: { select: { name: true } }, section: { select: { name: true } } },
    }), []),
    safe(() => (prisma as any).attendanceDay.findMany({
      where: { date: today },
      select: { classSectionId: true },
    }), []),
  ]);
  const markedIds = new Set(markedToday.map((m: any) => m.classSectionId));
  const unmarkedSections = allSections
    .filter((cs: any) => !markedIds.has(cs.id))
    .map((cs: any) => `${cs.class?.name ?? "?"} ${cs.section?.name ?? ""}`.trim())
    .sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true }));

  return {
    totalStudents,
    staffByRole,
    monthCollection,
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
      amount: sumDeposit(d),
    })),
    currentSession: currentSession?.session ?? "No active session",
    currentSessionId: sid,
    sparklines: { fees: feesByDay, expenses: expensesByDay },
    lastMonthCollection,
    lastMonthExpense: Number(lastMonthExpenseAgg._sum?.amount ?? 0),
    attendanceTrend,
    outstandingByClass,
    monthlyCollections,
    classAverages,
    sessionProgress,
    unmarkedSections,
    termCollection,
  };
}
