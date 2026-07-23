import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { TransportClient } from "./TransportClient";

export default async function TransportPage() {
  const [vehicles, routes, pickupPoints, students] = await Promise.all([
    ((await getDb()) as any).vehicle.findMany({ where: { isActive: true }, orderBy: { vehicleNo: "asc" } }),
    ((await getDb()) as any).route.findMany({
      where: { isActive: true },
      include: {
        vehicle: { select: { vehicleNo: true } },
        routePickupPoints: { include: { pickupPoint: true }, orderBy: { order: "asc" } },
        _count: { select: { studentRoutes: true } },
      },
      orderBy: { title: "asc" },
    }),
    ((await getDb()) as any).pickupPoint.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ((await getDb()) as any).student.findMany({
      where: { isActive: true },
      select: {
        id: true, firstName: true, lastName: true, admissionNo: true,
        transportRoute: { include: { route: { select: { title: true } }, pickupPoint: { select: { name: true } } } },
      },
      orderBy: { firstName: "asc" },
    }),
  ]);
  const [sessions, feemasters] = await Promise.all([
    ((await getDb()) as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    ((await getDb()) as any).transportFeemaster.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }).catch(() => []),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Transport" />
      <TransportClient vehicles={vehicles} routes={routes} pickupPoints={pickupPoints} students={students} sessions={sessions} feemasters={feemasters} />
    </div>
  );
}
