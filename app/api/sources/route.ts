import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return NextResponse.json(await (prisma as any).source.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }));
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const s = await (prisma as any).source.create({ data: body });
    return NextResponse.json(s, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Source already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
