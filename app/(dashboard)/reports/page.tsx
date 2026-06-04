import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { ReportsClient } from "./ReportsClient";

async function getData() {
  const [sessions, classes, sections, classSections, departments, examGroups] = await Promise.all([
    (prisma as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    (prisma as any).class.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).section.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).classSection.findMany({
      include: {
        class: { select: { name: true } },
        section: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    (prisma as any).department.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).examGroup.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
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
