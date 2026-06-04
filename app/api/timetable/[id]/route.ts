import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    await (prisma as any).timetableSlot.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
