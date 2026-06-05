import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { StaffClient } from "./StaffClient";

async function getData() {
  const [staff, departments, designations] = await Promise.all([
    ((await getDb()) as any).staff.findMany({
      include: {
        user:        { select: { email: true, role: true } },
        department:  { select: { name: true } },
        designation: { select: { name: true } },
      },
      orderBy: { firstName: "asc" },
    }),
    ((await getDb()) as any).department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ((await getDb()) as any).designation.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  return { staff, departments, designations };
}

export default async function StaffPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Staff" />
      <StaffClient {...data} />
    </div>
  );
}
