import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { ExamsListClient } from "./ExamsListClient";

export default async function ExamsPage() {
  const groups = await ((await getDb()) as any).examGroup.findMany({
    include: { _count: { select: { schedules: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Examinations" />
      <ExamsListClient groups={groups} />
    </div>
  );
}
