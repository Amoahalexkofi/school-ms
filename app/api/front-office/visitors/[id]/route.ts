import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.outTime) body.outTime = new Date(body.outTime);
  return NextResponse.json(await ((await getDb()) as any).visitor.update({ where: { id }, data: body }));
}
