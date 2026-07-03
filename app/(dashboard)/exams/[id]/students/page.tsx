import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { requireStaffPage } from "@/lib/auth/guards";
import { AssignStudentsClient } from "./AssignStudentsClient";

export default async function AssignExamStudentsPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ classSectionId?: string }>;
}) {
  await requireStaffPage("/exams");
  const { id } = await params;
  const { classSectionId = "" } = await searchParams;

  const db = (await getDb()) as any;
  const group = await db.examGroup.findUnique({
    where: { id },
    include: {
      schedules: {
        select: { classSectionId: true, classSection: { include: { class: true, section: true } } },
        where: { classSectionId: { not: null } },
      },
    },
  });
  if (!group) notFound();

  // Distinct class-sections this exam group has schedules for
  const seen = new Set<string>();
  const classSections = group.schedules
    .filter((s: any) => s.classSectionId && !seen.has(s.classSectionId) && seen.add(s.classSectionId))
    .map((s: any) => ({
      id: s.classSectionId,
      label: `${s.classSection.class.name} – ${s.classSection.section.name}`,
    }));

  return (
    <div className="flex flex-col flex-1">
      <Topbar title={`Assign Students — ${group.name}`} />
      <AssignStudentsClient
        examGroupId={id}
        groupName={group.name}
        classSections={classSections}
        initialClassSectionId={classSectionId}
      />
    </div>
  );
}
