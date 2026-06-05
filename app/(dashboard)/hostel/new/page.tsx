import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AddHostelForm } from "./AddHostelForm";

export default async function AddHostelPage() {
  const [roomTypes, hostels] = await Promise.all([
    ((await getDb()) as any).roomType.findMany({ orderBy: { name: "asc" } }),
    ((await getDb()) as any).hostel.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Hostel / Room" />
      <AddHostelForm roomTypes={roomTypes} hostels={hostels} />
    </div>
  );
}
