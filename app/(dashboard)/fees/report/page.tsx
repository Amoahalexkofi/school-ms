import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { FeeReportClient } from "./FeeReportClient";

export default async function FeeReportPage() {
  const [sessions, classSections, sessionGroups] = await Promise.all([
    (prisma as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    (prisma as any).classSection.findMany({
      include: { class: true, section: true },
      orderBy: { class: { name: "asc" } },
    }),
    (prisma as any).feeSessionGroup.findMany({
      include: { feeGroup: { select: { name: true } }, session: { select: { session: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Fee Reports" />
      <FeeReportClient sessions={sessions} classSections={classSections} sessionGroups={sessionGroups} />
    </div>
  );
}
