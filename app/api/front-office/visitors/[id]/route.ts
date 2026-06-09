import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ALLOWED = [
  "name","phone","email","purposeId","host","idProof","numVisitors",
  "note","meetingWith","source","date","image","outTime",
  "studentSessionId","staffId",
];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  for (const key of ALLOWED) {
    if (key in body) {
      if ((key === "date" || key === "outTime") && body[key]) data[key] = new Date(body[key]);
      else if (key === "numVisitors" && body[key] !== undefined) data[key] = parseInt(body[key]);
      else data[key] = body[key] ?? null;
    }
  }
  return NextResponse.json(await ((await getDb()) as any).visitor.update({ where: { id }, data }));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).visitor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
