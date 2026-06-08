import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { PromoteClient } from "./PromoteClient";

export default async function PromotePage() {
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
      <Topbar title="Promote Students" />
      <PromoteClient sessions={sessions} classSections={classSections} />
    </div>
  );
}
