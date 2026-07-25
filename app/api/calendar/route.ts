import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listCalendarItems, createCalendarEvent } from "@/lib/services/calendar";

// GET /api/calendar?from=2026-07-01&to=2026-07-31
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const now = new Date();
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(now.getFullYear(), now.getMonth(), 1);
  const to   = searchParams.get("to")   ? new Date(searchParams.get("to")!)   : new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const result = await listCalendarItems({
    userId: session.user.id!,
    role: (session.user as any).role,
    from,
    to,
  });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const event = await createCalendarEvent({
      ...body,
      userId: session.user.id!,
      role: (session.user as any).role,
    });
    return NextResponse.json(event, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    if (err.code === "FORBIDDEN")  return NextResponse.json({ error: err.message }, { status: 403 });
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
