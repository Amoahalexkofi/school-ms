import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await (prisma as any).alumniEvent.findMany({
    where: { isActive: true },
    include: {
      session: { select: { id: true, session: true } },
      class: { select: { id: true, name: true } },
    },
    orderBy: { fromDate: "desc" },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = await (prisma as any).alumniEvent.create({ data: body });
    return NextResponse.json(event, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
