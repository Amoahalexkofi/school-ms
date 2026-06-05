import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await ((await getDb()) as any).hostel.findMany({
    include: { rooms: { include: { roomType: true, _count: { select: { allocations: true } } } } },
    orderBy: { name: "asc" },
  }));
}
export async function POST(req: NextRequest) {
  try {
    const { name, type } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 422 });
    return NextResponse.json(await ((await getDb()) as any).hostel.create({ data: { name: name.trim(), type: type || null } }), { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
