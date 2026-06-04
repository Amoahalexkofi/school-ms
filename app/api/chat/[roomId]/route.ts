import { NextRequest, NextResponse } from "next/server";
import { getRoomMessages, sendMessage } from "@/lib/services/chat";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { roomId } = await params;
  const messages = await getRoomMessages(roomId);
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { roomId } = await params;
  try {
    const { content } = await req.json();
    const message = await sendMessage(roomId, session.user.id, content);
    return NextResponse.json(message, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
