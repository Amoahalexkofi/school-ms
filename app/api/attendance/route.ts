import { NextResponse } from "next/server";
import { markAttendance, getStudentAttendanceSummary } from "@/lib/services/attendance";

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!body.sectionId) {
    return NextResponse.json({ error: "sectionId is required" }, { status: 400 });
  }
  if (!body.sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }
  if (!body.date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }
  if (!Array.isArray(body.records) || body.records.length === 0) {
    return NextResponse.json({ error: "records must be a non-empty array" }, { status: 400 });
  }

  try {
    await markAttendance({
      sectionId: body.sectionId as string,
      sessionId: body.sessionId as string,
      date: new Date(body.date as string),
      records: body.records as Array<{ studentId: string; status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "HOLIDAY" }>,
    });

    return NextResponse.json({ message: "Attendance marked successfully" }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (message.includes("future date") || message.includes("cannot be empty") || message.includes("is required")) {
      return NextResponse.json({ error: message }, { status: 422 });
    }
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const sessionId = searchParams.get("sessionId");

  if (!studentId || !sessionId) {
    return NextResponse.json(
      { error: "studentId and sessionId are required" },
      { status: 400 }
    );
  }

  try {
    const summary = await getStudentAttendanceSummary(studentId, sessionId);
    return NextResponse.json(summary, { status: 200 });
  } catch {
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
