import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const groups = await (prisma as any).feeGroup.findMany({
    include: {
      session: true,
      items: { include: { feeType: true } },
      _count: { select: { invoices: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  try {
    const { name, sessionId } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 422 });
    if (!sessionId) return NextResponse.json({ error: "Session is required" }, { status: 422 });
    const group = await (prisma as any).feeGroup.create({
      data: { name: name.trim(), sessionId },
      include: { session: true, items: { include: { feeType: true } }, _count: { select: { invoices: true } } },
    });
    return NextResponse.json(group, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create fee group" }, { status: 500 });
  }
}
