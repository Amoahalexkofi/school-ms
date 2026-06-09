import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ALLOWED = ["name","categoryId","supplierId","storeId","description","unit","quantity","lowStockAlert","isActive"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  for (const key of ALLOWED) {
    if (key in body) {
      if (["quantity","lowStockAlert"].includes(key) && body[key] !== undefined) data[key] = body[key] ? parseInt(body[key]) : null;
      else data[key] = body[key] ?? null;
    }
  }
  return NextResponse.json(await ((await getDb()) as any).item.update({ where: { id }, data }));
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).item.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
