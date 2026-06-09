import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const events = await ((await getDb()) as any).alumniEvent.findMany({
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
    const {
      title, eventFor, sessionId, classId, section,
      fromDate, toDate, note, photo,
      eventNotificationMessage, showOnWebsite,
    } = await req.json();
    if (!title?.trim() || !fromDate || !toDate)
      return NextResponse.json({ error: "title, fromDate, toDate required" }, { status: 422 });

    const event = await ((await getDb()) as any).alumniEvent.create({
      data: {
        title:                    title.trim(),
        eventFor:                 eventFor || "all",
        sessionId:                sessionId || null,
        classId:                  classId   || null,
        section:                  section   || null,
        fromDate:                 new Date(fromDate),
        toDate:                   new Date(toDate),
        note:                     note      || null,
        photo:                    photo     || null,
        eventNotificationMessage: eventNotificationMessage || null,
        showOnWebsite:            showOnWebsite ?? false,
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
