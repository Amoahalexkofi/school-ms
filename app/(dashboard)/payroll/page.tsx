import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { PayrollClient } from "./PayrollClient";

export default async function PayrollPage() {
  const departments = await ((await getDb()) as any).department.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Payroll" />
      <PayrollClient departments={departments} />
    </div>
  );
}
