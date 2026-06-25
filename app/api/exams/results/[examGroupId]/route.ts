import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ examGroupId: string }> }) {
  const { examGroupId } = await params;
  const classSectionId = req.nextUrl.searchParams.get("classSectionId");

  const scheduleWhere: any = { examGroupId, isActive: true };
  if (classSectionId) scheduleWhere.classSectionId = classSectionId;

  const db = await getDb();
  const schedules = await (db as any).examSchedule.findMany({
    where: scheduleWhere,
    include: {
      subject: { select: { name: true, code: true } },
      markEntries: {
        include: {
          student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true } },
        },
      },
    },
    orderBy: { dateOfExam: "asc" },
  });

  // Division bands from the school's configured table (not hardcoded)
  const divisions = await (db as any).markDivision
    .findMany({ where: { isActive: true }, orderBy: { percentageFrom: "desc" } })
    .catch(() => []);
  const divisionFor = (pct: number): string => {
    for (const d of divisions) {
      if (pct >= Number(d.percentageFrom) && pct <= Number(d.percentageTo)) return d.name;
    }
    return divisions.length ? "—" : "";
  };

  // Pivot: studentId → { subjectId: markEntry }
  const studentMap: Record<string, any> = {};
  for (const sch of schedules) {
    for (const m of sch.markEntries) {
      if (!studentMap[m.studentId]) {
        studentMap[m.studentId] = { student: m.student, subjects: {} };
      }
      studentMap[m.studentId].subjects[sch.subject.code] = {
        marks:     Number(m.marksObtained ?? 0),
        fullMarks: sch.fullMarks,
        grade:     m.grade,
        isPassing: m.isPassing,
        absent:    m.attendance === "A",
      };
    }
  }

  // Compute totals and rank
  const rows = Object.values(studentMap).map((row: any) => {
    const subjects   = row.subjects;
    const totalObt   = Object.values(subjects).reduce((s: number, v: any) => s + (v.absent ? 0 : v.marks), 0);
    const totalFull  = Object.values(subjects).reduce((s: number, v: any) => s + v.fullMarks, 0);
    const pct        = totalFull > 0 ? Math.round((totalObt / totalFull) * 100) : 0;
    const allPassing = Object.values(subjects).every((v: any) => v.absent ? false : v.isPassing);
    const division   = allPassing ? divisionFor(pct) : (divisions.length ? "Fail" : "");
    return { ...row, totalObt, totalFull, pct, allPassing, division };
  });

  // Rank by percentage descending (computed default)
  rows.sort((a: any, b: any) => b.pct - a.pct);
  rows.forEach((r: any, i: number) => { r.rank = i + 1; });

  // Override with persisted/edited ranks where they exist (Smart School updaterank)
  const persisted = await (db as any).studentExamRank
    .findMany({ where: { examGroupId, ...(classSectionId ? { classSectionId } : {}) } })
    .catch(() => []);
  let ranksPersisted = false;
  if (persisted.length) {
    const map = new Map(persisted.map((p: any) => [p.studentId, p.rank]));
    for (const r of rows) {
      if (map.has(r.student.id)) { r.rank = map.get(r.student.id); ranksPersisted = true; }
    }
    rows.sort((a: any, b: any) => a.rank - b.rank);
  }

  return NextResponse.json({ ranksPersisted, schedules: schedules.map((s: any) => ({ id: s.id, subject: s.subject, fullMarks: s.fullMarks, passingMarks: s.passingMarks, dateOfExam: s.dateOfExam })), rows });
}
