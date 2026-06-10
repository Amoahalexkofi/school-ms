import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const CARD_ALLOWED = ["heading", "title", "bgColor", "fontColor", "bodyColor", "schoolName", "leftLogo", "rightLogo", "fieldList", "status", "isActive"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { heading, title, bgColor, fontColor, bodyColor, schoolName, leftLogo, rightLogo, fieldList, status, isActive } = await req.json();
    const data: any = {};
    if (heading    !== undefined) data.heading    = heading?.trim() || null;
    if (title      !== undefined) data.title      = title      || null;
    if (bgColor    !== undefined) data.bgColor    = bgColor    || null;
    if (fontColor  !== undefined) data.fontColor  = fontColor  || null;
    if (bodyColor  !== undefined) data.bodyColor  = bodyColor  || null;
    if (schoolName !== undefined) data.schoolName = schoolName || null;
    if (leftLogo   !== undefined) data.leftLogo   = leftLogo   || null;
    if (rightLogo  !== undefined) data.rightLogo  = rightLogo  || null;
    if (fieldList  !== undefined) data.fieldList  = fieldList  ?? null;
    if (status     !== undefined) data.status     = parseInt(status);
    if (isActive   !== undefined) data.isActive   = Boolean(isActive);
    if (Object.keys(data).length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 422 });
    const db = await getDb();
    const card = await (db as any).idCard.update({ where: { id }, data });
    return NextResponse.json(card);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).idCard.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}

// GET single — mirrors Smart School's idcardbyid() / get()
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await ((await getDb()) as any).idCard.findUnique({ where: { id } });
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(card);
}
