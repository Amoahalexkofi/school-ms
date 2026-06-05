import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const lowStock = req.nextUrl.searchParams.get("lowStock") === "true";
  const items = await ((await getDb()) as any).item.findMany({
    where: { isActive: true },
    include: { category: { select: { name: true } }, supplier: { select: { name: true } }, store: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
  const result = lowStock ? items.filter((i: any) => i.quantity <= i.lowStockAlert) : items;
  return NextResponse.json(result);
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 422 });
    const i = await ((await getDb()) as any).item.create({ data: { name: body.name.trim(), categoryId: body.categoryId || null, supplierId: body.supplierId || null, storeId: body.storeId || null, quantity: parseInt(body.quantity) || 0, lowStockAlert: parseInt(body.lowStockAlert) || 5, unit: body.unit || null } });
    return NextResponse.json(i, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
