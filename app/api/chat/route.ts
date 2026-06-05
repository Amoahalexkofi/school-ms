import { NextRequest, NextResponse } from "next/server";
import { getUserRooms, createGroupRoom } from "@/lib/services/chat";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json([]);
    const rooms = await getUserRooms(session.user.id);
    return NextResponse.json(Array.isArray(rooms) ? rooms : []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { name, userIds } = await req.json();
    const room = await createGroupRoom(name, [session.user.id, ...userIds]);
    return NextResponse.json(room, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
