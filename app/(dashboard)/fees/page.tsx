import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { FeesHubClient } from "./FeesHubClient";

async function getStats() {
  const [totalStudents, totalMasters, deposits, students] = await Promise.all([
    ((await getDb()) as any).student.count({ where: { isActive: true } }),
    ((await getDb()) as any).studentFeesMaster.count({ where: { isActive: true } }),
    ((await getDb()) as any).feeDeposit.findMany({ where: { isActive: true }, select: { amountDetail: true } }),
    ((await getDb()) as any).student.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  let totalCollected = 0;
  for (const d of deposits) {
    const detail = d.amountDetail as Record<string, any>;
    totalCollected += Object.values(detail).reduce((s: number, v: any) => s + Number(v?.amount ?? 0), 0);
  }

  return { totalStudents, totalMasters, totalCollected, students };
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
