import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const types = await (prisma as any).feeType.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(types);
}

export async function POST(req: NextRequest) {
  try {
    const { name, category, amount } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 422 });
    if (!amount || Number(amount) <= 0) return NextResponse.json({ error: "Amount must be positive" }, { status: 422 });
    const type = await (prisma as any).feeType.create({
      data: { name: name.trim(), category, amount: Number(amount) },
    });
    return NextResponse.json(type, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create fee type" }, { status: 500 });
  }
}
