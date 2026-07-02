import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";
import { Topbar } from "@/components/Topbar";
import { requireStaffPage } from "@/lib/auth/guards";
import { DisabledStudentsClient } from "./DisabledStudentsClient";

export default async function DisabledStudentsPage() {
  const role = await requireStaffPage("/students");
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

  const reasons = await (db as any).disableReason.findMany({ orderBy: { reason: "asc" } });

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Disabled Students" />
      <DisabledStudentsClient
        students={students}
        reasons={reasons}
        canManageReasons={role === "SUPER_ADMIN" || role === "ADMIN"}
      />
    </div>
  );
}
