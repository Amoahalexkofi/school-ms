import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { studentId, roomId } = await req.json();
    if (!studentId || !roomId) return NextResponse.json({ error: "studentId and roomId required" }, { status: 422 });
    const room = await ((await getDb()) as any).hostelRoom.findUnique({ where: { id: roomId }, include: { _count: { select: { allocations: true } } } });
    if (room && room._count.allocations >= room.capacity)
      return NextResponse.json({ error: "Room is at full capacity" }, { status: 409 });
    const a = await ((await getDb()) as any).hostelAllocation.upsert({
      where: { studentId },
      create: { studentId, roomId },
      update: { roomId },
    });
    return NextResponse.json(a, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
