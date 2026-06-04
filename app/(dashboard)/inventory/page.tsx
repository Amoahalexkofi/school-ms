import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { InventoryClient } from "./InventoryClient";

export default async function InventoryPage() {
  const [categories, suppliers, stores, items] = await Promise.all([
    (prisma as any).itemCategory.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { items: true } } } }),
    (prisma as any).supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    (prisma as any).store.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    (prisma as any).item.findMany({
      where: { isActive: true },
      include: { category: { select: { name: true } }, supplier: { select: { name: true } }, store: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Inventory" />
      <InventoryClient categories={categories} suppliers={suppliers} stores={stores} items={items} />
    </div>
  );
}
