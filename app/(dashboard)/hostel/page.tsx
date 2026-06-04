import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { HostelClient } from "./HostelClient";

export default async function HostelPage() {
  const [roomTypes, hostels, students] = await Promise.all([
    (prisma as any).roomType.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).hostel.findMany({
      include: {
        rooms: {
          include: { roomType: { select: { name: true } }, _count: { select: { allocations: true } } },
          orderBy: { roomNo: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    (prisma as any).student.findMany({
      where: { isActive: true },
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
