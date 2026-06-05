import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AddRouteForm } from "./AddRouteForm";

export default async function AddRoutePage() {
  const vehicles = await ((await getDb()) as any).vehicle.findMany({ orderBy: { vehicleNo: "asc" } });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Route" />
      <AddRouteForm vehicles={vehicles} />
    </div>
  );
}
