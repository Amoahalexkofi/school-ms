import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ALLOWED = ["holidayTypeId","sessionId","fromDate","toDate","description","frontSite","isActive"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: any = {};
    for (const key of ALLOWED) {
      if (key in body) {
        if (["fromDate","toDate"].includes(key) && body[key]) data[key] = new Date(body[key]);
        else data[key] = body[key] ?? null;
      }
    }
    const h = await ((await getDb()) as any).holiday.update({ where: { id }, data });
    return NextResponse.json(h);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ((await getDb()) as any).holiday.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
