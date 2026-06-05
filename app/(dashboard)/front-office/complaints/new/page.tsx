import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AddComplaintForm } from "./AddComplaintForm";

export default async function NewComplaintPage() {
  const [complaintTypes, students, staff] = await Promise.all([
    ((await getDb()) as any).complaintType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ((await getDb()) as any).student.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, admissionNo: true },
      orderBy: { firstName: "asc" },
    }),
    ((await getDb()) as any).staff.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, employeeId: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Complaint" />
      <AddComplaintForm complaintTypes={complaintTypes} students={students} staff={staff} />
    </div>
  );
}
