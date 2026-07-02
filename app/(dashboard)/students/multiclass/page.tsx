import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { requireStaffPage } from "@/lib/auth/guards";
import { MulticlassClient } from "./MulticlassClient";

export default async function MulticlassPage() {
  await requireStaffPage("/students");
  const db = await getDb();

  const [classSections, activeSession] = await Promise.all([
    (db as any).classSection.findMany({
      include: { class: true, section: true },
      orderBy: { class: { name: "asc" } },
    }),
    (db as any).academicSession.findFirst({ where: { isActive: true } }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Multi-Class Students" />
      <MulticlassClient
        classSections={classSections}
        sessionName={activeSession?.session ?? null}
      />
    </div>
  );
}
