import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const routes = await ((await getDb()) as any).route.findMany({
    where: { isActive: true },
    include: { vehicle: { select: { vehicleNo: true, driverName: true } }, routePickupPoints: { include: { pickupPoint: true }, orderBy: { order: "asc" } }, _count: { select: { studentRoutes: true } } },
    orderBy: { title: "asc" },
  });
  return NextResponse.json(routes);
}
export async function POST(req: NextRequest) {
  try {
    const { title, vehicleId } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 422 });
    const r = await ((await getDb()) as any).route.create({ data: { title: title.trim(), vehicleId: vehicleId || null } });
    return NextResponse.json(r, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Route already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
