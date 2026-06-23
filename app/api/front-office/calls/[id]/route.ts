import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: any = {};
    for (const k of ["name", "phone", "callType", "description", "callDuration", "note"]) {
      if (body[k] !== undefined) data[k] = body[k] || null;
    }
    if (body.date !== undefined) data.date = new Date(body.date);
    if (body.nextFollowUp !== undefined) data.nextFollowUp = body.nextFollowUp ? new Date(body.nextFollowUp) : null;
    const c = await ((await getDb()) as any).phoneCallLog.update({ where: { id }, data });
    return NextResponse.json(c);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ((await getDb()) as any).phoneCallLog.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
