import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";
import { Topbar } from "@/components/Topbar";
import { requireStaffPage } from "@/lib/auth/guards";
import { DisabledStudentsClient } from "./DisabledStudentsClient";

export default async function DisabledStudentsPage() {
  await requireStaffPage("/students");
  const db = await getDb();
  const branchId = await getActiveBranchId();

  const students = await (db as any).student.findMany({
    where: { isActive: false, ...(branchId ? { branchId } : {}) },
    include: {
      sessions: {
        include: { classSection: { include: { class: true, section: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { disabledAt: "desc" },
  });

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Disabled Students" />
      <DisabledStudentsClient students={students} />
    </div>
  );
}
