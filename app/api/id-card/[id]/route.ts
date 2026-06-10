import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const CARD_FIELDS = [
  "title","schoolName","schoolAddress","background","logo","signImage",
  "enableVerticalCard","headerColor",
  "enableAdmissionNo","enableStudentName","enableClass",
  "enableFathersName","enableMothersName","enableAddress",
  "enablePhone","enableDob","enableBloodGroup",
  "enableStudentBarcode","enableStudentRollno","enableStudentHouseName",
  "status",
] as const;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await ((await getDb()) as any).idCard.findUnique({ where: { id } });
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(card);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: any = {};
    for (const f of CARD_FIELDS) {
      if (f in body) data[f] = body[f] ?? null;
    }
    if (data.title) data.title = data.title.trim();
    if (data.schoolName) data.schoolName = data.schoolName.trim();
    if (Object.keys(data).length === 0)
      return NextResponse.json({ error: "No fields to update" }, { status: 422 });
    const db = await getDb();
    const card = await (db as any).idCard.update({ where: { id }, data });
    return NextResponse.json(card);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).idCard.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
