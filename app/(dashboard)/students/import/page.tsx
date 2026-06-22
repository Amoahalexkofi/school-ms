import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { requireStaffPage } from "@/lib/auth/guards";
import { ImportStudentsClient } from "./ImportStudentsClient";

export default async function ImportStudentsPage() {
  await requireStaffPage("/students");
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
      <Topbar title="Import Students" />
      <ImportStudentsClient sessions={sessions} classSections={classSections} />
    </div>
  );
}
