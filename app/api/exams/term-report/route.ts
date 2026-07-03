import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { filterToExamRoster } from "@/lib/services/exams";

// GES terminal-report wrapper fields (attendance, conduct, remarks, promotion).
// One row per student per exam group (term).

// GET ?examGroupId=&classSectionId= — students + saved wrapper rows + attendance auto-counts
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const examGroupId = sp.get("examGroupId");
  const classSectionId = sp.get("classSectionId");
  if (!examGroupId || !classSectionId) {
    return NextResponse.json({ error: "examGroupId and classSectionId required" }, { status: 422 });
  }

  const db = (await getDb()) as any;

  // Session comes from the exam group's schedules for this class
  const schedule = await db.examSchedule.findFirst({
    where: { examGroupId, classSectionId, isActive: true },
    select: { sessionId: true },
  });
  if (!schedule) return NextResponse.json({ error: "No schedules for this exam group / class" }, { status: 404 });

  const [allEnrollments, saved] = await Promise.all([
    db.studentSession.findMany({
      where: { classSectionId, sessionId: schedule.sessionId, isActive: true },
      include: {
        student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true } },
      },
      orderBy: [{ rollNo: "asc" }, { student: { firstName: "asc" } }],
    }),
    db.termReport.findMany({ where: { examGroupId } }),
  ]);
  const enrollments = await filterToExamRoster(db, examGroupId, classSectionId, allEnrollments);

  // Auto attendance counts for the session (teacher can override before saving).
  // Present = P (Present), L (Late), F (Half Day); H (Holiday) is excluded from
  // the total; A (Absent) counts toward total only.
  const studentIds = enrollments.map((e: any) => e.student.id);
  const attendanceRows = studentIds.length
    ? await db.studentAttendance
        .findMany({
          where: {
            studentId: { in: studentIds },
            attendanceDay: { sessionId: schedule.sessionId, classSectionId },
          },
          select: { studentId: true, attendanceType: { select: { keyValue: true } } },
        })
        .catch(() => [])
    : [];
  const attendance: Record<string, { present: number; total: number }> = {};
  for (const row of attendanceRows) {
    const key = row.attendanceType?.keyValue;
    if (key === "H") continue; // holidays don't count as school days
    const a = (attendance[row.studentId] ??= { present: 0, total: 0 });
    a.total += 1;
    if (key === "P" || key === "L" || key === "F") a.present += 1;
  }

  const savedMap: Record<string, any> = {};
  for (const r of saved) savedMap[r.studentId] = r;

  return NextResponse.json({ enrollments, savedMap, attendance });
}

// POST — upsert wrapper rows. Body: { examGroupId, records: [{studentId, ...fields}] }
export async function POST(req: NextRequest) {
  try {
    const { examGroupId, records } = await req.json();
    if (!examGroupId || !Array.isArray(records)) {
      return NextResponse.json({ error: "examGroupId and records required" }, { status: 422 });
    }
    const db = (await getDb()) as any;

    const toInt = (v: any) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) ? n : null;
    };
    const toStr = (v: any) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);
    const toDate = (v: any) => {
      if (!v) return null;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };

    await Promise.all(
      records.map((r: any) => {
        const data = {
          attendancePresent:  toInt(r.attendancePresent),
          attendanceTotal:    toInt(r.attendanceTotal),
          conduct:            toStr(r.conduct),
          attitude:           toStr(r.attitude),
          interest:           toStr(r.interest),
          classTeacherRemark: toStr(r.classTeacherRemark),
          headTeacherRemark:  toStr(r.headTeacherRemark),
          promotedTo:         toStr(r.promotedTo),
          nextTermBegins:     toDate(r.nextTermBegins),
        };
        return db.termReport.upsert({
          where: { examGroupId_studentId: { examGroupId, studentId: r.studentId } },
          create: { examGroupId, studentId: r.studentId, ...data },
          update: data,
        });
      })
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
