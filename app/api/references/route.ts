import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return NextResponse.json(await (prisma as any).reference.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }));
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const r = await (prisma as any).reference.create({ data: body });
    return NextResponse.json(r, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Reference already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
