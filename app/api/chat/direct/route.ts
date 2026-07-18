import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrCreateDirectRoom } from "@/lib/services/chat";

// Start (or resume) a one-to-one conversation.
export async function POST(req: NextRequest) {
  const session = await auth();
  const myId = (session?.user as any)?.id;
  if (!myId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { userId } = await req.json();
    if (!userId || userId === myId) return NextResponse.json({ error: "userId required" }, { status: 422 });
    const room = await getOrCreateDirectRoom(myId, userId);
    return NextResponse.json(room, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to start chat" }, { status: 500 });
  }
}
