import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ALLOWED = ["vehicleNo","vehicleModel","manufactureYear","driverName","driverContact","driverLicence","isActive"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  for (const key of ALLOWED) {
    if (key in body) data[key] = body[key] ?? null;
  }
  const v = await ((await getDb()) as any).vehicle.update({ where: { id }, data });
  return NextResponse.json(v);
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).vehicle.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
