import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const pts = await (prisma as any).pickupPoint.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  return NextResponse.json(pts);
}
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 422 });
    const p = await (prisma as any).pickupPoint.create({ data: { name: name.trim() } });
    return NextResponse.json(p, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
