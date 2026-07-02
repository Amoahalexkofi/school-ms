import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { MarkEntryClient } from "./MarkEntryClient";

export default async function MarkEntryPage({
  params,
}: {
  params: Promise<{ id: string; scheduleId: string }>;
}) {
  const { id: examGroupId, scheduleId } = await params;

  const schedule = await ((await getDb()) as any).examSchedule.findUnique({
    where: { id: scheduleId },
    include: {
      subject:      true,
      session:      { select: { session: true } },
      classSection: { include: { class: true, section: true } },
      examGroup:    { select: { name: true } },
    },
  });
  if (!schedule) notFound();

  const [enrollments, existingMarks, gradingScale, components, componentMarks] = await Promise.all([
    // A schedule may be unassigned (no class section) — don't pass null to
    // Prisma (it rejects null filters and crashes the page).
    schedule.classSectionId
      ? ((await getDb()) as any).studentSession.findMany({
          where: { classSectionId: schedule.classSectionId, sessionId: schedule.sessionId, isActive: true },
          include: {
            student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true } },
          },
          orderBy: [{ rollNo: "asc" }, { student: { firstName: "asc" } }],
        })
      : [],
    ((await getDb()) as any).markEntry.findMany({ where: { examScheduleId: scheduleId } }),
    ((await getDb()) as any).gradingScale.findFirst({
      orderBy: { createdAt: "asc" }, // canonical scale = first created (deterministic)
      include: { ranges: { where: { isActive: true }, orderBy: { markFrom: "desc" } } },
    }),
    // GES SBA components — non-empty switches the entry table to component mode
    ((await getDb()) as any).assessmentComponent
      .findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } })
      .catch(() => []),
    ((await getDb()) as any).componentMark
      .findMany({ where: { examScheduleId: scheduleId } })
      .catch(() => []),
  ]);

  const marksMap: Record<string, any> = {};
  for (const m of existingMarks) marksMap[m.studentId] = m;

  // componentMarksMap[studentId][componentId] = "16"
  const componentMarksMap: Record<string, Record<string, string>> = {};
  for (const cm of componentMarks) {
    (componentMarksMap[cm.studentId] ??= {})[cm.componentId] =
      cm.marksObtained !== null ? String(Number(cm.marksObtained)) : "";
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar title={`Mark Entry — ${schedule.subject.name}`} />
      <MarkEntryClient
        schedule={schedule}
        examGroupId={examGroupId}
        enrollments={enrollments}
        marksMap={marksMap}
        gradingScale={gradingScale}
        components={components.map((c: any) => ({
          id: c.id, name: c.name, weight: Number(c.weight), isExam: c.isExam,
        }))}
        componentMarksMap={componentMarksMap}
      />
    </div>
  );
}
