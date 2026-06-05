import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const routes = await ((await getDb()) as any).route.findMany({
    where: { isActive: true },
    include: {
      vehicle: { select: { vehicleNo: true, vehicleModel: true, driverName: true } },
      routePickupPoints: {
        include: { pickupPoint: { select: { name: true } } },
        orderBy: { order: "asc" },
      },
      studentRoutes: {
        include: {
          student: {
            select: {
              id: true, firstName: true, lastName: true, admissionNo: true,
              sessions: {
                include: {
                  classSection: {
                    include: {
                      class: { select: { name: true } },
                      section: { select: { name: true } },
                    },
                  },
                },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
          pickupPoint: { select: { name: true } },
        },
      },
    },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(routes);
}
