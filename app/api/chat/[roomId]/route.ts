import { NextRequest, NextResponse } from "next/server";
import { getRoomMessages, sendMessage, isParticipant, markRoomRead } from "@/lib/services/chat";
import { auth } from "@/lib/auth";

// A room is private to the people in it. Being signed in is not enough —
// without this check any authenticated user could read (or post into) any
// conversation just by knowing a room id.
async function guard(roomId: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!(await isParticipant(roomId, userId))) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  return { userId };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const { userId, error } = await guard(roomId);
  if (error) return error;

  const beforeParam = req.nextUrl.searchParams.get("before");
  const before = beforeParam ? new Date(beforeParam) : undefined;
  if (before && Number.isNaN(before.getTime())) {
    return NextResponse.json({ error: "Invalid 'before' timestamp" }, { status: 422 });
  }

  const page = await getRoomMessages(roomId, before);
  // Only opening the live tail counts as reading the room.
  if (!before) await markRoomRead(roomId, userId!).catch(() => null);
  return NextResponse.json(page);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const { userId, error } = await guard(roomId);
  if (error) return error;

  try {
    const { content } = await req.json();
    const message = await sendMessage(roomId, userId!, content);
    await markRoomRead(roomId, userId!).catch(() => null);
    return NextResponse.json(message, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    console.error("[chat/:roomId POST]", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
