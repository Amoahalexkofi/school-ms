import { NextResponse } from "next/server";
import { submitMarks, getStudentResults } from "@/lib/services/marks";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  for (const field of ["examScheduleId", "studentId", "theoryMarks"] as const) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  try {
    const entry = await submitMarks({
      examScheduleId: body.examScheduleId as string,
      studentId: body.studentId as string,
      theoryMarks: Number(body.theoryMarks),
      practicalMarks: body.practicalMarks != null ? Number(body.practicalMarks) : undefined,
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (message.includes("not found")) return NextResponse.json({ error: message }, { status: 404 });
    if (message.includes("exceed") || message.includes("negative")) return NextResponse.json({ error: message }, { status: 422 });
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const examGroupId = searchParams.get("examGroupId");

  if (!studentId || !examGroupId) {
    return NextResponse.json(
      { error: "studentId and examGroupId are required" },
      { status: 400 }
    );
  }

  try {
    const results = await getStudentResults(studentId, examGroupId);
    return NextResponse.json(results, { status: 200 });
  } catch {
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
