import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";
import { resolveBranchForCreate } from "@/lib/services/branches";

export async function GET(req: NextRequest) {
  const lowStock = req.nextUrl.searchParams.get("lowStock") === "true";
  const activeBranch = await getActiveBranchId();
  const items = await ((await getDb()) as any).item.findMany({
    where: { isActive: true, ...(activeBranch ? { branchId: activeBranch } : {}) },
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
    const branchId = await resolveBranchForCreate(await getActiveBranchId());
    const i = await ((await getDb()) as any).item.create({ data: { branchId, name: body.name.trim(), categoryId: body.categoryId || null, supplierId: body.supplierId || null, storeId: body.storeId || null, quantity: parseInt(body.quantity) || 0, lowStockAlert: parseInt(body.lowStockAlert) || 5, unit: body.unit || null } });
    return NextResponse.json(i, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
