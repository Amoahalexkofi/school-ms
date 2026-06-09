import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const holidayTypeId = searchParams.get("holidayTypeId");
  const where: any = { isActive: true };
  if (sessionId) where.sessionId = sessionId;
  if (holidayTypeId) where.holidayTypeId = holidayTypeId;
  const holidays = await ((await getDb()) as any).holiday.findMany({
    where,
    include: { holidayType: true, session: { select: { id: true, session: true } } },
    orderBy: { fromDate: "desc" },
  });
  return NextResponse.json(holidays);
}

export async function POST(req: NextRequest) {
  try {
    const { holidayTypeId, sessionId, fromDate, toDate, description, frontSite } = await req.json();
    if (!holidayTypeId || !fromDate || !toDate)
      return NextResponse.json({ error: "holidayTypeId, fromDate, toDate required" }, { status: 422 });

    const holiday = await ((await getDb()) as any).holiday.create({
      data: {
        holidayTypeId,
        sessionId:   sessionId   || null,
        fromDate:    new Date(fromDate),
        toDate:      new Date(toDate),
        description: description || null,
        frontSite:   frontSite   ?? false,
      },
    });
    return NextResponse.json(holiday, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create holiday" }, { status: 500 });
  }
}
