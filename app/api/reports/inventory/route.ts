import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";

// Inventory stock report (Smart School Report::inventory/inventorystock).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lowStockOnly = searchParams.get("lowStockOnly") === "true";

  const branchId = await getActiveBranchId();
  const items = await ((await getDb()) as any).item.findMany({
    where: { isActive: true, ...(branchId ? { branchId } : {}) },
    include: { category: { select: { name: true } }, supplier: { select: { name: true } }, store: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  const rows = items
    .map((i: any) => ({
      name: i.name,
      category: i.category?.name ?? "",
      supplier: i.supplier?.name ?? "",
      store: i.store?.name ?? "",
      quantity: i.quantity,
      unit: i.unit ?? "",
      lowStockAlert: i.lowStockAlert,
      status: i.quantity <= i.lowStockAlert ? "Low Stock" : "OK",
    }))
    .filter((r: any) => !lowStockOnly || r.status === "Low Stock");

  return NextResponse.json(rows);
}
