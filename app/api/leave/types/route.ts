import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const types = await (prisma as any).leaveType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  return NextResponse.json(types);
}
export async function POST(req: NextRequest) {
  try {
    const { name, daysAllowed } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 422 });
    const t = await (prisma as any).leaveType.create({ data: { name: name.trim(), daysAllowed: parseInt(daysAllowed) || 0 } });
    return NextResponse.json(t, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
