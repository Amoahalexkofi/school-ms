import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { CarryForwardClient } from "./CarryForwardClient";

export default async function CarryForwardPage() {
  const db = await getDb();
  const [sessions, classSections] = await Promise.all([
    (db as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    (db as any).classSection.findMany({
      include: { class: true, section: true },
      orderBy: { class: { name: "asc" } },
    }),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Fee Carry Forward" />
      <CarryForwardClient sessions={sessions} classSections={classSections} />
    </div>
  );
}
