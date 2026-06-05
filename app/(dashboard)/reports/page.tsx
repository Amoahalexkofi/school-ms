import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { ReportsClient } from "./ReportsClient";

async function getData() {
  const [sessions, classes, sections, classSections, departments, examGroups] = await Promise.all([
    ((await getDb()) as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    ((await getDb()) as any).class.findMany({ orderBy: { name: "asc" } }),
    ((await getDb()) as any).section.findMany({ orderBy: { name: "asc" } }),
    ((await getDb()) as any).classSection.findMany({
      include: {
        class: { select: { name: true } },
        section: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    ((await getDb()) as any).department.findMany({ orderBy: { name: "asc" } }),
    ((await getDb()) as any).examGroup.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return { sessions, classes, sections, classSections, departments, examGroups };
}

export default async function ReportsPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Reports" />
      <ReportsClient {...data} />
    </div>
  );
}
