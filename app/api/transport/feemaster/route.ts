import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's transport_feemaster table:
// monthly fee schedule entries for a session — one per month.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sessionId = searchParams.get("sessionId");
  const db = await getDb();
  const masters = await (db as any).transportFeemaster.findMany({
    where: { ...(sessionId ? { sessionId } : {}), isActive: true },
    orderBy: { month: "asc" },
  });
  return NextResponse.json(masters);
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, month, dueDate, fineAmount, fineType, finePercentage } = await req.json();
    if (!sessionId || !month) return NextResponse.json({ error: "sessionId and month required" }, { status: 422 });
    const db = await getDb();
    const m = await (db as any).transportFeemaster.create({
      data: {
        sessionId, month,
        dueDate:       dueDate       ? new Date(dueDate) : null,
        fineAmount:    fineAmount    ? parseFloat(fineAmount)    : 0,
        fineType:      fineType      ?? "none",
        finePercentage: finePercentage ? parseFloat(finePercentage) : 0,
      },
    });
    return NextResponse.json(m, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
