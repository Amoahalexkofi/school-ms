import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Disable_reason_model: lookup table for disable reasons

export async function GET() {
  const db = await getDb();
  const reasons = await (db as any).disableReason.findMany({
    where: { isActive: true },
    orderBy: { reason: "asc" },
  });
  return NextResponse.json(reasons);
}

export async function POST(req: NextRequest) {
  try {
    const { reason } = await req.json();
    if (!reason?.trim()) return NextResponse.json({ error: "Reason is required" }, { status: 422 });
    const db = await getDb();
    const r = await (db as any).disableReason.create({ data: { reason: reason.trim() } });
    return NextResponse.json(r, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Reason already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
