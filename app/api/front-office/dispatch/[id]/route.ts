import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ALLOWED = ["title", "refNo", "fromTo", "address", "note", "date", "attachment"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { title, refNo, fromTo, address, note, date, attachment } = await req.json();
    const data: any = {};
    if (title      !== undefined) data.title      = title?.trim()  || null;
    if (refNo      !== undefined) data.refNo      = refNo          || null;
    if (fromTo     !== undefined) data.fromTo     = fromTo         || null;
    if (address    !== undefined) data.address    = address        || null;
    if (note       !== undefined) data.note       = note           || null;
    if (attachment !== undefined) data.attachment = attachment     || null;
    if (date       !== undefined && date) data.date = new Date(date);
    const record = await ((await getDb()) as any).dispatch.update({ where: { id }, data });
    return NextResponse.json(record);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ((await getDb()) as any).dispatch.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
