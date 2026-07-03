import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { filterToExamRoster } from "@/lib/services/exams";

// GET — students enrolled in this exam's classSection + existing marks
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: scheduleId } = await params;

  const schedule = await ((await getDb()) as any).examSchedule.findUnique({
    where: { id: scheduleId },
    include: { subject: true, classSection: { include: { class: true, section: true } } },
  });
  if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

  const [enrollments, existingMarks, gradingScales, components, componentMarks] = await Promise.all([
    ((await getDb()) as any).studentSession.findMany({
      where: { classSectionId: schedule.classSectionId, sessionId: schedule.sessionId, isActive: true },
      include: {
        student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true } },
      },
      orderBy: [{ rollNo: "asc" }, { student: { firstName: "asc" } }],
    }),
    ((await getDb()) as any).markEntry.findMany({
      where: { examScheduleId: scheduleId },
    }),
    ((await getDb()) as any).gradingScale.findFirst({
      orderBy: { createdAt: "asc" }, // canonical scale = first created (deterministic)
      include: { ranges: { where: { isActive: true }, orderBy: { markFrom: "desc" } } },
    }),
    // GES SBA components — non-empty switches marks entry to component mode
    ((await getDb()) as any).assessmentComponent
      .findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } })
      .catch(() => []),
    ((await getDb()) as any).componentMark
      .findMany({ where: { examScheduleId: scheduleId } })
      .catch(() => []),
  ]);

  const rosterEnrollments = await filterToExamRoster(
    (await getDb()) as any, schedule.examGroupId, schedule.classSectionId, enrollments
  );

  const marksMap: Record<string, any> = {};
  for (const m of existingMarks) marksMap[m.studentId] = m;

  // componentMarksMap[studentId][componentId] = marksObtained
  const componentMarksMap: Record<string, Record<string, string>> = {};
  for (const cm of componentMarks) {
    (componentMarksMap[cm.studentId] ??= {})[cm.componentId] =
      cm.marksObtained !== null ? String(Number(cm.marksObtained)) : "";
  }

  return NextResponse.json({
    schedule, enrollments: rosterEnrollments, marksMap, gradingScale: gradingScales,
    components, componentMarksMap,
  });
}

// POST — save/upsert mark entries
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: scheduleId } = await params;
  try {
    const { records } = await req.json();
    if (!Array.isArray(records)) return NextResponse.json({ error: "records required" }, { status: 422 });

    const db = await getDb();
    const schedule = await (db as any).examSchedule.findUnique({
      where: { id: scheduleId },
      select: { fullMarks: true, passingMarks: true, subjectId: true },
    });
    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    // Fetch grading scale for grade computation (canonical = first created)
    const gradingScale = await (db as any).gradingScale.findFirst({
      orderBy: { createdAt: "asc" },
      include: { ranges: { where: { isActive: true }, orderBy: { markFrom: "desc" } } },
    });

    function computeGrade(marks: number | null): string | null {
      if (marks === null || !gradingScale) return null;
      const pct = (marks / schedule.fullMarks) * 100;
      for (const r of gradingScale.ranges) {
        if (pct >= Number(r.markFrom) && pct <= Number(r.markTo)) return r.grade;
      }
      return null;
    }

    // Component (GES SBA) mode: each record may carry components: {componentId: "16", …}.
    // Scores are entered out of each component's weight; the total (their sum)
    // is written to MarkEntry.marksObtained so grading/rank/reports downstream
    // stay unchanged.
    const activeComponents = await (db as any).assessmentComponent
      .findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } })
      .catch(() => []);
    const componentMode = activeComponents.length > 0 && records.some((r: any) => r.components);

    if (componentMode) {
      const weightById = new Map<string, number>(
        activeComponents.map((c: any) => [c.id, Number(c.weight)])
      );
      for (const r of records) {
        const comps = r.components ?? {};
        for (const [componentId, raw] of Object.entries(comps)) {
          const weight = weightById.get(componentId);
          if (weight === undefined) continue; // unknown/inactive component
          const val = raw === "" || raw === null || r.attendance === "A" ? null : parseFloat(String(raw));
          if (val !== null && (isNaN(val) || val < 0 || val > weight)) {
            return NextResponse.json(
              { error: `Score ${val} exceeds the ${weight}-mark limit for a component` },
              { status: 422 }
            );
          }
          await (db as any).componentMark.upsert({
            where: {
              examScheduleId_studentId_componentId: {
                examScheduleId: scheduleId, studentId: r.studentId, componentId,
              },
            },
            create: { examScheduleId: scheduleId, studentId: r.studentId, componentId, marksObtained: val },
            update: { marksObtained: val },
          });
        }
        // Total = sum of entered components (partial entry allowed; empty = null)
        const vals = Object.entries(comps)
          .filter(([id]) => weightById.has(id))
          .map(([, v]) => (v === "" || v === null ? null : parseFloat(String(v))))
          .filter((v): v is number => v !== null && !isNaN(v));
        r.marksObtained = r.attendance === "A" || vals.length === 0 ? "" : String(vals.reduce((a, b) => a + b, 0));
      }
    }

    await Promise.all(
      records.map((r: any) => {
        const marks   = r.attendance === "A" ? null : (r.marksObtained !== "" ? parseFloat(r.marksObtained) : null);
        const isPassing = marks !== null && marks >= schedule.passingMarks;
        const grade   = computeGrade(marks);

        return (db as any).markEntry.upsert({
          where: { examScheduleId_studentId: { examScheduleId: scheduleId, studentId: r.studentId } },
          create: {
            examScheduleId: scheduleId,
            studentId:      r.studentId,
            subjectId:      schedule.subjectId,
            marksObtained:  marks,
            attendance:     r.attendance || "P",
            grade,
            isPassing,
            note: r.note || null,
          },
          update: {
            marksObtained: marks,
            attendance:    r.attendance || "P",
            grade,
            isPassing,
            note: r.note || null,
          },
        });
      })
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
