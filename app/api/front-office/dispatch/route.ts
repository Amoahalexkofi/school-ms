import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Smart School: dispatch_receive table — type "dispatch" (outgoing) or "receive" (incoming)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type"); // "incoming" | "outgoing"
  const from = searchParams.get("from");
  const to   = searchParams.get("to");

  const where: any = {};
  if (type) where.type = type;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to)   where.date.lte = new Date(to);
  }

  const records = await ((await getDb()) as any).dispatch.findMany({
    where,
    orderBy: { date: "desc" },
  });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  try {
    const { type, title, refNo, fromTo, address, note, date, attachment } = await req.json();
    if (!type || !title?.trim() || !date) {
      return NextResponse.json({ error: "type, title, date are required" }, { status: 422 });
    }
    const record = await ((await getDb()) as any).dispatch.create({
      data: {
        type:       type,
        title:      title.trim(),
        refNo:      refNo      || null,
        fromTo:     fromTo     || null,
        address:    address    || null,
        note:       note       || null,
        date:       new Date(date),
        attachment: attachment || null,
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
