import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { ExamGroupDetailClient } from "./ExamGroupDetailClient";

export default async function ExamGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [group, sessions, classSections, subjects] = await Promise.all([
    (prisma as any).examGroup.findUnique({
      where: { id },
      include: {
        schedules: {
          include: {
            subject:      { select: { name: true, code: true } },
            session:      { select: { session: true } },
            classSection: { include: { class: true, section: true } },
            _count:       { select: { markEntries: true } },
          },
          orderBy: [{ classSectionId: "asc" }, { dateOfExam: "asc" }],
        },
      },
    }),
    (prisma as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    (prisma as any).classSection.findMany({
      include: { class: true, section: true },
      orderBy: { class: { name: "asc" } },
    }),
    (prisma as any).subject.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!group) notFound();

  return (
    <div className="flex flex-col flex-1">
      <Topbar title={group.name} />
      <ExamGroupDetailClient group={group} sessions={sessions} classSections={classSections} subjects={subjects} />
    </div>
  );
}
