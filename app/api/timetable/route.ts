import { NextResponse } from "next/server";
import { getSectionTimetable, addTimetableSlot } from "@/lib/services/timetable";
import type { DayOfWeek } from "@/lib/domain/timetable";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get("sectionId");
  if (!sectionId) {
    return NextResponse.json({ error: "sectionId is required" }, { status: 400 });
  }
  try {
    const slots = await getSectionTimetable(sectionId);
    return NextResponse.json(slots, { status: 200 });
  } catch {
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}

const REQUIRED = ["sectionId", "day", "period", "startTime", "endTime"] as const;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  for (const field of REQUIRED) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  try {
    const slot = await addTimetableSlot({
      sectionId: body.sectionId as string,
      day: body.day as DayOfWeek,
      period: Number(body.period),
      startTime: body.startTime as string,
      endTime: body.endTime as string,
      staffId: body.staffId as string | undefined,
      subjectId: body.subjectId as string | undefined,
    });
    return NextResponse.json(slot, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (message.includes("double-booked") || message.includes("duplicate")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    if (message.includes("period must") || message.includes("cannot exceed") || message.includes("required")) {
      return NextResponse.json({ error: message }, { status: 422 });
    }
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
