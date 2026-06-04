import { prisma } from "@/lib/prisma";

export async function listItems() {
  return (prisma as any).item.findMany({
    include: { category: true, supplier: true, store: true },
    orderBy: { name: "asc" },
  });
}

export async function addItem(input: {
  name: string;
  categoryId?: string;
  supplierId?: string;
  storeId?: string;
  quantity?: number;
  lowStockAlert?: number;
  unit?: string;
}) {
  if (!input.name.trim()) throw Object.assign(new Error("Item name is required"), { code: "VALIDATION" });
  return (prisma as any).item.create({
    data: {
      name: input.name.trim(),
      categoryId: input.categoryId,
      supplierId: input.supplierId,
      storeId: input.storeId,
      quantity: input.quantity ?? 0,
      lowStockAlert: input.lowStockAlert ?? 5,
      unit: input.unit,
    },
  });
}

export async function stockIn(itemId: string, quantity: number, note?: string) {
  if (quantity <= 0) throw Object.assign(new Error("Quantity must be positive"), { code: "VALIDATION" });
  return (prisma as any).$transaction([
    (prisma as any).stockMovement.create({ data: { itemId, type: "IN", quantity, note } }),
    (prisma as any).item.update({ where: { id: itemId }, data: { quantity: { increment: quantity } } }),
  ]);
}

export async function stockOut(itemId: string, quantity: number, note?: string) {
  if (quantity <= 0) throw Object.assign(new Error("Quantity must be positive"), { code: "VALIDATION" });
  const item = await (prisma as any).item.findUnique({ where: { id: itemId } });
  if (!item) throw Object.assign(new Error("Item not found"), { code: "NOT_FOUND" });
  if (item.quantity < quantity) throw Object.assign(new Error("Insufficient stock"), { code: "CONFLICT" });
  return (prisma as any).$transaction([
    (prisma as any).stockMovement.create({ data: { itemId, type: "OUT", quantity, note } }),
    (prisma as any).item.update({ where: { id: itemId }, data: { quantity: { decrement: quantity } } }),
  ]);
}

export async function issueItem(input: { itemId: string; issuedTo: string; quantity: number; note?: string }) {
  return stockOut(input.itemId, input.quantity, input.note ?? `Issued to ${input.issuedTo}`).then(async () => {
    return (prisma as any).itemIssue.create({
      data: { itemId: input.itemId, issuedTo: input.issuedTo, quantity: input.quantity, note: input.note },
    });
  });
}

export async function getLowStockItems() {
  const items = await (prisma as any).item.findMany({ include: { category: true } });
  return items.filter((i: any) => i.quantity <= i.lowStockAlert);
}

export async function listCategories() {
  return (prisma as any).itemCategory.findMany({ orderBy: { name: "asc" } });
}

export async function listSuppliers() {
  return (prisma as any).supplier.findMany({ orderBy: { name: "asc" } });
}

export async function listStores() {
  return (prisma as any).store.findMany({ orderBy: { name: "asc" } });
}
