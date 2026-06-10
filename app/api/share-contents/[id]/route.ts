import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const content = await (db as any).shareContent.findUnique({ where: { id } });
  if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(content);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { sendTo, title, shareDate, validUpto, description } = await req.json();
    const data: any = {};
    if (sendTo      !== undefined) data.sendTo      = sendTo      || null;
    if (title       !== undefined) data.title       = title       || null;
    if (shareDate   !== undefined) data.shareDate   = shareDate   ? new Date(shareDate)  : null;
    if (validUpto   !== undefined) data.validUpto   = validUpto   ? new Date(validUpto)  : null;
    if (description !== undefined) data.description = description || null;
    const db = await getDb();
    const content = await (db as any).shareContent.update({ where: { id }, data });
    return NextResponse.json(content);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  await (db as any).shareContent.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
