import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateCalendarEvent, deleteCalendarEvent } from "@/lib/services/calendar";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const event = await updateCalendarEvent(id, body, session.user.id!, (session.user as any).role);
    return NextResponse.json(event);
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    if (err.code === "FORBIDDEN")  return NextResponse.json({ error: err.message }, { status: 403 });
    if (err.code === "NOT_FOUND")  return NextResponse.json({ error: err.message }, { status: 404 });
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await deleteCalendarEvent(id, session.user.id!, (session.user as any).role);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === "FORBIDDEN")  return NextResponse.json({ error: err.message }, { status: 403 });
    if (err.code === "NOT_FOUND")  return NextResponse.json({ error: err.message }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
