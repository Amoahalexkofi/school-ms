import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Phone call log (Smart School Generalcall) — incoming/outgoing call records.
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type"); // "incoming" | "outgoing"
  const where: any = {};
  if (type) where.callType = type;
  const calls = await ((await getDb()) as any).phoneCallLog.findMany({
    where,
    orderBy: { date: "desc" },
    take: 200,
  });
  return NextResponse.json(calls);
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, callType, date, description, callDuration, nextFollowUp, note } = await req.json();
    if (!name?.trim() || !date) return NextResponse.json({ error: "name and date are required" }, { status: 422 });
    const c = await ((await getDb()) as any).phoneCallLog.create({
      data: {
        name:         name.trim(),
        phone:        phone        || null,
        callType:     callType === "outgoing" ? "outgoing" : "incoming",
        date:         new Date(date),
        description:  description  || null,
        callDuration: callDuration || null,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
        note:         note         || null,
      },
    });
    return NextResponse.json(c, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
