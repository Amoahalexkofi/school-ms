import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AddLeaveForm } from "./AddLeaveForm";

export default async function NewLeavePage() {
  const [leaveTypes, staff, students] = await Promise.all([
    ((await getDb()) as any).leaveType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ((await getDb()) as any).staff.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, employeeId: true },
      orderBy: { firstName: "asc" },
    }),
    ((await getDb()) as any).student.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, admissionNo: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Apply for Leave" />
      <AddLeaveForm leaveTypes={leaveTypes} staff={staff} students={students} />
    </div>
  );
}
