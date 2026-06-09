import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const EVENT_ALLOWED = [
  "title","eventFor","sessionId","classId","section",
  "fromDate","toDate","note","photo","eventNotificationMessage","showOnWebsite","isActive",
];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: any = {};
    for (const key of EVENT_ALLOWED) {
      if (key in body) {
        if (["fromDate","toDate"].includes(key) && body[key]) data[key] = new Date(body[key]);
        else data[key] = body[key] ?? null;
      }
    }
    return NextResponse.json(await ((await getDb()) as any).alumniEvent.update({ where: { id }, data }));
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ((await getDb()) as any).alumniEvent.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
