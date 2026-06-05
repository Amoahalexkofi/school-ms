import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { LeaveClient } from "./LeaveClient";

export default async function LeavePage() {
  const [leaveTypes, staffRequests, studentRequests, staff, students, leaveBalances] = await Promise.all([
    ((await getDb()) as any).leaveType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ((await getDb()) as any).staffLeaveRequest.findMany({
      include: { staff: { select: { firstName: true, lastName: true, employeeId: true } }, leaveType: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    ((await getDb()) as any).studentLeaveRequest.findMany({
      include: { student: { select: { firstName: true, lastName: true, admissionNo: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    ((await getDb()) as any).staff.findMany({ where: { isActive: true }, select: { id: true, firstName: true, lastName: true, employeeId: true }, orderBy: { firstName: "asc" } }),
    ((await getDb()) as any).student.findMany({ where: { isActive: true }, select: { id: true, firstName: true, lastName: true, admissionNo: true }, orderBy: { firstName: "asc" } }),
    ((await getDb()) as any).staffLeaveBalance.findMany({
      include: {
        staff:     { select: { id: true, firstName: true, lastName: true, employeeId: true } },
        leaveType: { select: { id: true, name: true } },
      },
      orderBy: [{ staff: { firstName: "asc" } }],
    }),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Leave Management" />
      <LeaveClient leaveTypes={leaveTypes} staffRequests={staffRequests} studentRequests={studentRequests} staff={staff} students={students} leaveBalances={leaveBalances} />
    </div>
  );
}
