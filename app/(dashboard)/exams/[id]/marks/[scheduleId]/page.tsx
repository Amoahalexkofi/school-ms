import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { MarkEntryClient } from "./MarkEntryClient";

export default async function MarkEntryPage({
  params,
}: {
  params: Promise<{ id: string; scheduleId: string }>;
}) {
  const { id: examGroupId, scheduleId } = await params;

  const schedule = await (prisma as any).examSchedule.findUnique({
    where: { id: scheduleId },
    include: {
      subject:      true,
      session:      { select: { session: true } },
      classSection: { include: { class: true, section: true } },
      examGroup:    { select: { name: true } },
    },
  });
  if (!schedule) notFound();

  const [enrollments, existingMarks, gradingScale] = await Promise.all([
    (prisma as any).studentSession.findMany({
      where: { classSectionId: schedule.classSectionId, sessionId: schedule.sessionId, isActive: true },
      include: {
        student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true } },
      },
      orderBy: [{ rollNo: "asc" }, { student: { firstName: "asc" } }],
    }),
    (prisma as any).markEntry.findMany({ where: { examScheduleId: scheduleId } }),
    (prisma as any).gradingScale.findFirst({
      include: { ranges: { where: { isActive: true }, orderBy: { markFrom: "desc" } } },
    }),
  ]);

  const marksMap: Record<string, any> = {};
  for (const m of existingMarks) marksMap[m.studentId] = m;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title={`Mark Entry — ${schedule.subject.name}`} />
      <MarkEntryClient
        schedule={schedule}
        examGroupId={examGroupId}
        enrollments={enrollments}
        marksMap={marksMap}
        gradingScale={gradingScale}
      />
    </div>
  );
}
