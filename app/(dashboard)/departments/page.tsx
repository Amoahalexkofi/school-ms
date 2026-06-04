import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { DepartmentsClient } from "./DepartmentsClient";

export default async function DepartmentsPage() {
  const departments = await (prisma as any).department.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { staff: true } } },
  });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Departments" />
      <DepartmentsClient departments={departments} />
    </div>
  );
}
