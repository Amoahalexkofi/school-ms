import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const pts = await ((await getDb()) as any).pickupPoint.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  return NextResponse.json(pts);
}
export async function POST(req: NextRequest) {
  try {
    const { name, latitude, longitude } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 422 });
    const p = await ((await getDb()) as any).pickupPoint.create({
      data: {
        name: name.trim(),
        latitude:  latitude  ? parseFloat(latitude)  : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });
    return NextResponse.json(p, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
