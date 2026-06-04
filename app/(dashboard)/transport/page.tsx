import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { TransportClient } from "./TransportClient";

export default async function TransportPage() {
  const [vehicles, routes, pickupPoints, students] = await Promise.all([
    (prisma as any).vehicle.findMany({ orderBy: { vehicleNo: "asc" } }),
    (prisma as any).route.findMany({
      include: {
        vehicle: { select: { vehicleNo: true } },
        routePickupPoints: { include: { pickupPoint: true }, orderBy: { order: "asc" } },
        _count: { select: { studentRoutes: true } },
      },
      orderBy: { title: "asc" },
    }),
    (prisma as any).pickupPoint.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    (prisma as any).student.findMany({
      where: { isActive: true },
      select: {
        id: true, firstName: true, lastName: true, admissionNo: true,
        transportRoute: { include: { route: { select: { title: true } }, pickupPoint: { select: { name: true } } } },
      },
      orderBy: { firstName: "asc" },
    }),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Transport" />
      <TransportClient vehicles={vehicles} routes={routes} pickupPoints={pickupPoints} students={students} />
    </div>
  );
}
