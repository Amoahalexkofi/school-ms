import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const source   = searchParams.get("source");
  const status   = searchParams.get("status");
  const classId  = searchParams.get("classId");
  const from     = searchParams.get("from");
  const to       = searchParams.get("to");

  const where: any = {};
  if (source)  where.source  = source;
  if (status)  where.status  = status;
  if (classId) where.classId = classId;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to)   where.date.lte = new Date(to);
  }

  const enquiries = await ((await getDb()) as any).enquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(enquiries);
}

export async function POST(req: NextRequest) {
  try {
    const {
      name, phone, email, classId, note, description,
      source, assignedTo, noOfChild, date, reference, enquiryType, status,
    } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 422 });

    const e = await ((await getDb()) as any).enquiry.create({
      data: {
        name:            name.trim(),
        phone:           phone           || null,
        email:           email           || null,
        classId: classId || null,
        note:            note            || null,
        description:     description     || null,
        source:          source          || null,
        assignedTo:      assignedTo      || null,
        noOfChild:       noOfChild       ? parseInt(noOfChild) : null,
        date:            date ? new Date(date) : new Date(),
        reference:       reference       || null,
        enquiryType:     enquiryType     || null,
        status:          status          || "NEW",
      },
    });
    return NextResponse.json(e, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
