import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { AddStaffForm } from "./AddStaffForm";

export default async function NewStaffPage() {
  const [departments, designations] = await Promise.all([
    (prisma as any).department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    (prisma as any).designation.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Staff Member" />
      <AddStaffForm departments={departments} designations={designations} />
    </div>
  );
}
