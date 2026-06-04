import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const types = await (prisma as any).feeType.findMany({
    where: { isActive: true },
    include: { feeCategory: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(types);
}

export async function POST(req: NextRequest) {
  try {
    const { name, code, feeCategoryId, description } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 422 });
    if (!code?.trim()) return NextResponse.json({ error: "Code is required" }, { status: 422 });
    const type = await (prisma as any).feeType.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        feeCategoryId: feeCategoryId || null,
        description: description || null,
      },
    });
    return NextResponse.json(type, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Code already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
