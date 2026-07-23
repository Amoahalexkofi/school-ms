import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";

// GET /api/homework/[id]/evaluation
// Roster for the homework's class-section + this session, with any existing
// per-student evaluation merged in. Smart School: Homework::evaluation().
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const db = await getDb();
    const hw = await (db as any).homework.findUnique({
      where: { id },
      select: {
        id: true, title: true, marks: true, classSectionId: true, sessionId: true,
        evaluationDate: true, evaluatedBy: true,
        subject: { select: { name: true } },
        evaluations: { select: { studentId: true, marks: true, note: true, status: true } },
        acknowledgements: { select: { studentId: true, attachment: true, submittedAt: true } },
      },
    });
    if (!hw) return NextResponse.json({ error: "Homework not found" }, { status: 404 });

    const branchId = await getActiveBranchId();
    const enrollments = await (db as any).studentSession.findMany({
      where: { classSectionId: hw.classSectionId, sessionId: hw.sessionId, isActive: true, ...(branchId ? { student: { branchId } } : {}) },
      include: { student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true, rollNo: true } } },
      orderBy: [{ rollNo: "asc" }, { student: { firstName: "asc" } }],
    });

    const evalByStudent: Record<string, any> = {};
    for (const e of hw.evaluations) evalByStudent[e.studentId] = e;
    const ackByStudent: Record<string, any> = {};
    for (const a of hw.acknowledgements) ackByStudent[a.studentId] = a;

    const students = enrollments.map((en: any) => {
      const s = en.student;
      const ev = evalByStudent[s.id];
      const ack = ackByStudent[s.id];
      return {
        studentId: s.id,
        name: [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" "),
        admissionNo: s.admissionNo,
        rollNo: en.rollNo ?? s.rollNo ?? null,
        marks: ev?.marks ?? null,
        note: ev?.note ?? "",
        evaluated: !!ev,
        submission: ack?.attachment ?? null,
        submittedAt: ack?.submittedAt ?? null,
      };
    });

    return NextResponse.json({
      homework: { id: hw.id, title: hw.title, maxMarks: hw.marks, subject: hw.subject?.name ?? null, evaluationDate: hw.evaluationDate },
      students,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/homework/[id]/evaluation
// { evaluationDate, evaluatedBy?, entries: [{ studentId, marks, note }] }
// Upserts a row per submitted student, sets homework.evaluationDate/evaluatedBy.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { evaluationDate, evaluatedBy, entries } = await req.json();
    if (!evaluationDate) return NextResponse.json({ error: "evaluationDate is required" }, { status: 422 });
    if (!Array.isArray(entries) || !entries.length) return NextResponse.json({ error: "No students to evaluate" }, { status: 422 });

    const db = await getDb();
    const hw = await (db as any).homework.findUnique({ where: { id }, select: { marks: true } });
    if (!hw) return NextResponse.json({ error: "Homework not found" }, { status: 404 });

    const date = new Date(evaluationDate);
    let saved = 0;
    for (const e of entries) {
      if (!e.studentId) continue;
      const marks = e.marks === "" || e.marks === null || e.marks === undefined ? null : parseFloat(e.marks);
      if (marks !== null && hw.marks != null && marks > hw.marks) {
        return NextResponse.json({ error: `Marks cannot exceed the homework total (${hw.marks})` }, { status: 422 });
      }
      await (db as any).homeworkEvaluation.upsert({
        where: { homeworkId_studentId: { homeworkId: id, studentId: e.studentId } },
        update: { marks, note: e.note?.trim() || null, status: "completed", date },
        create: { homeworkId: id, studentId: e.studentId, marks, note: e.note?.trim() || null, status: "completed", date },
      });
      saved++;
    }

    await (db as any).homework.update({
      where: { id },
      data: { evaluationDate: date, evaluatedBy: evaluatedBy || null },
    });

    return NextResponse.json({ status: "success", saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
