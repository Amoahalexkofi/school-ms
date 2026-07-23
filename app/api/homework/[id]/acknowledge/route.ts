import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { acknowledgeHomework } from "@/lib/services/homework";

type RouteContext = { params: Promise<{ id: string }> };

// Student self-service: always resolves the student from the session, never
// from the request body — proxy.ts lets any STUDENT reach this one path, so
// trusting a client-supplied studentId would let a student submit as anyone.
export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;

  const session = await auth().catch(() => null);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = (await getDb()) as any;
  const student = await db.student.findFirst({ where: { userId }, select: { id: true } });
  if (!student) return NextResponse.json({ error: "No student profile" }, { status: 404 });

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // no body — plain "mark as done" with no attachment
  }

  try {
    const ack = await acknowledgeHomework(id, student.id, body.attachment as string | undefined);
    return NextResponse.json(ack, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (message.includes("not found")) return NextResponse.json({ error: message }, { status: 404 });
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
