import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { ExamResultsClient } from "./ExamResultsClient";

export default async function ExamResultsPage({ params }: { params: Promise<{ examGroupId: string }> }) {
  const { examGroupId } = await params;

  const group = await ((await getDb()) as any).examGroup.findUnique({
    where: { id: examGroupId },
    select: { id: true, name: true, isPublished: true },
  });
  if (!group) notFound();

  const classSections = await ((await getDb()) as any).classSection.findMany({
    include: { class: true, section: true },
    orderBy: { class: { name: "asc" } },
  });

  return (
    <div className="flex flex-col flex-1">
      <Topbar title={`Results — ${group.name}`} />
      <ExamResultsClient group={group} classSections={classSections} />
    </div>
  );
}
