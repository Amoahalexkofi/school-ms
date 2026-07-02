import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { TermReportClient } from "./TermReportClient";

// Terminal-report wrapper fields (attendance, conduct, remarks, promotion) for
// one exam group, entered per class. The values print on the GES report card.
export default async function TermReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: examGroupId } = await params;
  const db = (await getDb()) as any;

  const group = await db.examGroup.findUnique({
    where: { id: examGroupId },
    select: { id: true, name: true },
  });
  if (!group) notFound();

  // Class sections that have schedules in this exam group
  const schedules = await db.examSchedule.findMany({
    where: { examGroupId, isActive: true, classSectionId: { not: null } },
    select: {
      classSectionId: true,
      classSection: { include: { class: { select: { name: true } }, section: { select: { name: true } } } },
    },
  });
  const seen = new Set<string>();
  const classSections = schedules
    .filter((s: any) => s.classSectionId && !seen.has(s.classSectionId) && seen.add(s.classSectionId))
    .map((s: any) => ({
      id: s.classSectionId,
      label: `${s.classSection.class.name} – ${s.classSection.section.name}`,
    }));

  return (
    <div className="flex flex-col flex-1">
      <Topbar title={`Term Report Info — ${group.name}`} />
      <TermReportClient group={group} classSections={classSections} />
    </div>
  );
}
