import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { AddHostelForm } from "./AddHostelForm";

export default async function AddHostelPage() {
  const [roomTypes, hostels] = await Promise.all([
    (prisma as any).roomType.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).hostel.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Hostel / Room" />
      <AddHostelForm roomTypes={roomTypes} hostels={hostels} />
    </div>
  );
}
