import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { hostelId, roomNo, roomTypeId, capacity } = await req.json();
    if (!hostelId || !roomNo) return NextResponse.json({ error: "hostelId and roomNo required" }, { status: 422 });
    const r = await ((await getDb()) as any).hostelRoom.create({ data: { hostelId, roomNo, roomTypeId: roomTypeId || null, capacity: parseInt(capacity) || 1 } });
    return NextResponse.json(r, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Room number already exists in this hostel" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
