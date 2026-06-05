import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AddStaffForm } from "./AddStaffForm";

export default async function NewStaffPage() {
  const [departments, designations] = await Promise.all([
    ((await getDb()) as any).department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ((await getDb()) as any).designation.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Staff Member" />
      <AddStaffForm departments={departments} designations={designations} />
    </div>
  );
}
