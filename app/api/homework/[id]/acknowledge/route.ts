import { NextResponse } from "next/server";
import { acknowledgeHomework } from "@/lib/services/homework";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!body.studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  try {
    const ack = await acknowledgeHomework(id, body.studentId as string);
    return NextResponse.json(ack, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (message.includes("not found")) return NextResponse.json({ error: message }, { status: 404 });
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
