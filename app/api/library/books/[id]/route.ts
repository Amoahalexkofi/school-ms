import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ALLOWED = ["title","bookNo","isbn","subject","rackNo","publisher","author","quantity","available","perUnitCost","description","isActive"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  for (const key of ALLOWED) {
    if (key in body) {
      if (["quantity","available"].includes(key) && body[key] !== undefined) data[key] = body[key] ? parseInt(body[key]) : 0;
      else if (key === "perUnitCost" && body[key] !== undefined) data[key] = body[key] ? parseFloat(body[key]) : null;
      else data[key] = body[key] ?? null;
    }
  }
  return NextResponse.json(await ((await getDb()) as any).book.update({ where: { id }, data }));
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const active = await ((await getDb()) as any).bookIssue.count({ where: { bookId: id, status: "ISSUED" } });
  if (active > 0) return NextResponse.json({ error: "Book has active issues" }, { status: 409 });
  await ((await getDb()) as any).book.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
