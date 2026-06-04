import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const groups = await (prisma as any).feeGroup.findMany({
    where: { isSystem: false },
    include: {
      sessionGroups: {
        include: {
          session: { select: { session: true } },
          _count: { select: { items: true, studentFeesMasters: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 422 });
    const group = await (prisma as any).feeGroup.create({ data: { name: name.trim(), description: description || null } });
    return NextResponse.json(group, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Group already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
