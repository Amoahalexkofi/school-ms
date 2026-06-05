import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const houses = await ((await getDb()) as any).schoolHouse.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  return NextResponse.json(houses);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const h = await ((await getDb()) as any).schoolHouse.create({ data: body });
    return NextResponse.json(h, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "House already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
