import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { StaffSectionTabs } from "@/components/StaffSectionTabs";
import { DesignationsClient } from "./DesignationsClient";

export default async function DesignationsPage() {
  const designations = await ((await getDb()) as any).designation.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { staff: true } } },
  });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Designations" />
      <StaffSectionTabs />
      <DesignationsClient designations={designations} />
    </div>
  );
}
