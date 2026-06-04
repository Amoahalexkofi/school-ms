import { NextRequest, NextResponse } from "next/server";
import { markAttendance, getStudentAttendanceSummary } from "@/lib/services/attendance";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.classSectionId) return NextResponse.json({ error: "classSectionId is required" }, { status: 400 });
    if (!body.sessionId) return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    if (!body.date) return NextResponse.json({ error: "date is required" }, { status: 400 });
    if (!Array.isArray(body.records) || body.records.length === 0)
      return NextResponse.json({ error: "records must be a non-empty array" }, { status: 400 });

    await markAttendance({
      classSectionId: body.classSectionId,
      sessionId: body.sessionId,
      date: new Date(body.date),
      records: body.records,
    });
    return NextResponse.json({ message: "Attendance marked successfully" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (message.includes("future date") || message.includes("cannot be empty") || message.includes("required"))
      return NextResponse.json({ error: message }, { status: 422 });
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!studentId || !sessionId)
    return NextResponse.json({ error: "studentId and sessionId are required" }, { status: 400 });
  try {
    const summary = await getStudentAttendanceSummary(studentId, sessionId);
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
