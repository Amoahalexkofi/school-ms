import { NextResponse } from "next/server";
import { addExamSchedule, getExamGroupWithSchedules } from "@/lib/services/exam-schedule";

type RouteContext = { params: Promise<{ id: string }> };

const REQUIRED = ["subjectId", "date", "startTime", "endTime", "maxMarks", "passingMarks"] as const;

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    const group = await getExamGroupWithSchedules(id);
    if (!group) return NextResponse.json({ error: "exam group not found" }, { status: 404 });
    return NextResponse.json(group, { status: 200 });
  } catch {
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
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
    const schedule = await addExamSchedule({
      examGroupId: id,
      subjectId: body.subjectId as string,
      date: new Date(body.date as string),
      startTime: new Date(body.startTime as string),
      endTime: new Date(body.endTime as string),
      maxMarks: Number(body.maxMarks),
      passingMarks: Number(body.passingMarks),
      room: body.room as string | undefined,
    });
    return NextResponse.json(schedule, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (message.includes("not found")) return NextResponse.json({ error: message }, { status: 404 });
    if (message.includes("published")) return NextResponse.json({ error: message }, { status: 409 });
    if (message.includes("exceed") || message.includes("after") || message.includes("greater")) {
      return NextResponse.json({ error: message }, { status: 422 });
    }
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
