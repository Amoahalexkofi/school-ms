import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    await ((await getDb()) as any).timetableSlot.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
