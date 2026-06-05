import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { SchoolHousesClient } from "./SchoolHousesClient";

export default async function SchoolHousesPage() {
  const houses = await ((await getDb()) as any).schoolHouse.findMany({
    where: { isActive: true },
    include: { _count: { select: { students: true } } },
    orderBy: { name: "asc" },
  });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="School Houses" />
      <SchoolHousesClient houses={houses} />
    </div>
  );
}
