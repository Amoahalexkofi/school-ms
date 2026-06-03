import { NextResponse } from "next/server";
import { publishExamGroup } from "@/lib/services/exam-schedule";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    const group = await publishExamGroup(id);
    return NextResponse.json(group, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (message.includes("not found")) return NextResponse.json({ error: message }, { status: 404 });
    if (message.includes("already published")) return NextResponse.json({ error: message }, { status: 409 });
    if (message.includes("no schedules")) return NextResponse.json({ error: message }, { status: 422 });
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
