import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { feeTypeId } = await req.json();
    if (!feeTypeId) return NextResponse.json({ error: "feeTypeId is required" }, { status: 422 });
    const item = await ((await getDb()) as any).feeGroupItem.create({
      data: { feeGroupId: id, feeTypeId },
      include: { feeType: true },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Fee type already in this group" }, { status: 409 });
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { feeTypeId } = await req.json();
    await ((await getDb()) as any).feeGroupItem.deleteMany({
      where: { feeGroupId: id, feeTypeId },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
