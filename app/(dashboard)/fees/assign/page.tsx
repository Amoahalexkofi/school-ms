import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { FeeAssignClient } from "./FeeAssignClient";

export default async function FeeAssignPage() {
  const [sessions, classSections, sessionGroups] = await Promise.all([
    ((await getDb()) as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    ((await getDb()) as any).classSection.findMany({
      include: { class: true, section: true },
      orderBy: { class: { name: "asc" } },
    }),
    ((await getDb()) as any).feeSessionGroup.findMany({
      where: { isActive: true },
      include: {
        feeGroup: { select: { name: true } },
        session:  { select: { session: true } },
        items:    { select: { amount: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Assign Fees" />
      <FeeAssignClient sessions={sessions} classSections={classSections} sessionGroups={sessionGroups} />
    </div>
  );
}
