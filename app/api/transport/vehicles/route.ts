import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const v = await ((await getDb()) as any).vehicle.findMany({ orderBy: { vehicleNo: "asc" } });
  return NextResponse.json(v);
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.vehicleNo?.trim()) return NextResponse.json({ error: "Vehicle number required" }, { status: 422 });
    const v = await ((await getDb()) as any).vehicle.create({ data: { vehicleNo: body.vehicleNo.trim(), vehicleModel: body.vehicleModel || null, manufactureYear: body.manufactureYear || null, driverName: body.driverName || null, driverContact: body.driverContact || null, driverLicence: body.driverLicence || null } });
    return NextResponse.json(v, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Vehicle number already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
