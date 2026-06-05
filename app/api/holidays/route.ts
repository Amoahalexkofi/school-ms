import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const holidayTypeId = searchParams.get("holidayTypeId");
  const where: any = { isActive: true };
  if (sessionId) where.sessionId = sessionId;
  if (holidayTypeId) where.holidayTypeId = holidayTypeId;
  const holidays = await (prisma as any).holiday.findMany({
    where,
    include: { holidayType: true, session: { select: { id: true, session: true } } },
    orderBy: { fromDate: "desc" },
  });
  return NextResponse.json(holidays);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const holiday = await (prisma as any).holiday.create({ data: body });
    return NextResponse.json(holiday, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create holiday" }, { status: 500 });
  }
}
