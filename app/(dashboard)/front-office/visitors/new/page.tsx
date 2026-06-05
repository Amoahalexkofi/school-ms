import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AddVisitorForm } from "./AddVisitorForm";

export default async function NewVisitorPage() {
  const [purposes, staff] = await Promise.all([
    ((await getDb()) as any).visitorPurpose.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ((await getDb()) as any).staff.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, employeeId: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Log Visitor" />
      <AddVisitorForm purposes={purposes} staff={staff} />
    </div>
  );
}
