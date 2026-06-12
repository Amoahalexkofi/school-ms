import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { LeaveClient } from "./LeaveClient";

export default async function LeavePage() {
  const session = await auth();
  if (!session) redirect("/sign-in");
  const user    = session.user as any;
  const role    = user.role ?? "ADMIN";
  const db      = await getDb();

  // For non-admin roles, find the linked Staff record
  let myStaff: any = null;
  if (role === "TEACHER" || role === "STAFF") {
    myStaff = await (db as any).staff.findFirst({ where: { userId: user.id } });
  }

  const leaveTypes = await (db as any).leaveType.findMany({
    where: { isActive: true }, orderBy: { name: "asc" },
  });

  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

  // Admin: fetch everything; teacher: fetch only their own data
  const [staffRequests, studentRequests, allStaff, students, leaveBalances] = await Promise.all([
    (db as any).staffLeaveRequest.findMany({
      where: isAdmin ? {} : { staffId: myStaff?.id ?? "__none__" },
      include: {
        staff:     { select: { firstName: true, lastName: true, employeeId: true, department: { select: { name: true } } } },
        leaveType: { select: { name: true, daysAllowed: true } },
      },
      orderBy: { createdAt: "desc" },
      take: isAdmin ? 200 : 50,
    }),
    isAdmin ? (db as any).studentLeaveRequest.findMany({
      include: { student: { select: { firstName: true, lastName: true, admissionNo: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }) : Promise.resolve([]),
    isAdmin ? (db as any).staff.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, employeeId: true },
      orderBy: { firstName: "asc" },
    }) : Promise.resolve([]),
    isAdmin ? (db as any).student.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, admissionNo: true },
      orderBy: { firstName: "asc" },
    }) : Promise.resolve([]),
    (db as any).staffLeaveBalance.findMany({
      where: isAdmin ? {} : { staffId: myStaff?.id ?? "__none__" },
      include: {
        staff:     { select: { id: true, firstName: true, lastName: true, employeeId: true } },
        leaveType: { select: { id: true, name: true, daysAllowed: true } },
      },
      orderBy: [{ staff: { firstName: "asc" } }],
    }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Leave Management" />
      <LeaveClient
        leaveTypes={leaveTypes}
        staffRequests={staffRequests}
        studentRequests={studentRequests}
        staff={allStaff}
        students={students}
        leaveBalances={leaveBalances}
        isAdmin={isAdmin}
        myStaffId={myStaff?.id ?? null}
      />
    </div>
  );
}
