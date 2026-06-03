import { NextResponse } from "next/server";
import { createExamGroup } from "@/lib/services/exam-schedule";

const REQUIRED = ["name", "sessionId", "startDate", "endDate"] as const;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  for (const field of REQUIRED) {
    if (!body[field]) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  try {
    const group = await createExamGroup({
      name: body.name as string,
      sessionId: body.sessionId as string,
      startDate: new Date(body.startDate as string),
      endDate: new Date(body.endDate as string),
    });
    return NextResponse.json(group, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (message.includes("after") || message.includes("required")) {
      return NextResponse.json({ error: message }, { status: 422 });
    }
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
