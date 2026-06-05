import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const houses = await (prisma as any).schoolHouse.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  return NextResponse.json(houses);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const h = await (prisma as any).schoolHouse.create({ data: body });
    return NextResponse.json(h, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "House already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
