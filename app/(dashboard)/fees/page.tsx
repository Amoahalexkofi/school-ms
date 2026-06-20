import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { FeesHubClient } from "./FeesHubClient";

async function getStats() {
  const [totalStudents, totalMasters, deposits] = await Promise.all([
    ((await getDb()) as any).student.count({ where: { isActive: true } }),
    ((await getDb()) as any).studentFeesMaster.count({ where: { isActive: true } }),
    ((await getDb()) as any).feeDeposit.findMany({ where: { isActive: true }, select: { amountDetail: true } }),
  ]);

  let totalCollected = 0;
  for (const d of deposits) {
    const detail = d.amountDetail as Record<string, any>;
    totalCollected += Object.values(detail).reduce((s: number, v: any) => s + Number(v?.amount ?? 0), 0);
  }

  return { totalStudents, totalMasters, totalCollected };
}

export default async function FeesPage() {
  const data = await getStats();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Fees" />
      <FeesHubClient {...data} />
    </div>
  );
}
