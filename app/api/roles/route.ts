import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const roles = await (prisma as any).appRole.findMany({
    include: {
      _count: { select: { permissions: true, staffRoles: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(roles);
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 422 });
    const role = await (prisma as any).appRole.create({ data: { name: name.trim() } });
    return NextResponse.json(role, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Role already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
