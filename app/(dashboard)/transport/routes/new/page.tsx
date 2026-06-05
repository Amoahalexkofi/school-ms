import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { AddRouteForm } from "./AddRouteForm";

export default async function AddRoutePage() {
  const vehicles = await (prisma as any).vehicle.findMany({ orderBy: { vehicleNo: "asc" } });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Route" />
      <AddRouteForm vehicles={vehicles} />
    </div>
  );
}
