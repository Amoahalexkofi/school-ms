import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";
import { Topbar } from "@/components/Topbar";
import { HostelClient } from "./HostelClient";

export default async function HostelPage() {
  const branchId = await getActiveBranchId();
  const bScope = branchId ? { branchId } : {}; // active-branch filter (Multi Branch)
  const [roomTypes, hostels, students] = await Promise.all([
    ((await getDb()) as any).roomType.findMany({ orderBy: { name: "asc" } }),
    ((await getDb()) as any).hostel.findMany({
      where: { ...bScope },
      include: {
        rooms: {
          include: { roomType: { select: { name: true } }, _count: { select: { allocations: true } } },
          orderBy: { roomNo: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    ((await getDb()) as any).student.findMany({
      where: { isActive: true, ...bScope },
      select: { id: true, firstName: true, lastName: true, admissionNo: true, hostelAllocation: { include: { room: { include: { hostel: { select: { name: true } } } } } } },
      orderBy: { firstName: "asc" },
    }),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Hostel" />
      <HostelClient roomTypes={roomTypes} hostels={hostels} students={students} />
    </div>
  );
}
