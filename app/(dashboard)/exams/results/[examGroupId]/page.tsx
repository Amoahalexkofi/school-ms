import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { ExamResultsClient } from "./ExamResultsClient";

export default async function ExamResultsPage({ params }: { params: Promise<{ examGroupId: string }> }) {
  const { examGroupId } = await params;

  const group = await (prisma as any).examGroup.findUnique({
    where: { id: examGroupId },
    select: { id: true, name: true, isPublished: true },
  });
  if (!group) notFound();

  const classSections = await (prisma as any).classSection.findMany({
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
