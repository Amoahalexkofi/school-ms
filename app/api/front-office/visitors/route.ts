import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const date = searchParams.get("date");
  const where: any = {};
  if (date) {
    const d = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    where.date = { gte: d, lt: end };
  }
  const visitors = await ((await getDb()) as any).visitor.findMany({
    where,
    include: { purpose: { select: { name: true } } },
    orderBy: { date: "desc" },
    take: 200,
  });
  return NextResponse.json(visitors);
}

export async function POST(req: NextRequest) {
  try {
    const {
      name, phone, email, purposeId, host, idProof, numVisitors,
      note, meetingWith, source, date, image,
    } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Visitor name required" }, { status: 422 });

    const v = await ((await getDb()) as any).visitor.create({
      data: {
        name:             name.trim(),
        phone:            phone            || null,
        email:            email            || null,
        purposeId:        purposeId        || null,
        host:             host             || null,
        idProof:          idProof          || null,
        numVisitors:      parseInt(numVisitors) || 1,
        note:             note             || null,
        meetingWith:      meetingWith      || null,
        source:           source           || null,
        date:             date ? new Date(date) : new Date(),
        image:            image            || null,
      },
    });
    return NextResponse.json(v, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
