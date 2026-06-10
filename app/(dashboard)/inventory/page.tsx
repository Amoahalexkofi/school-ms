import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { InventoryClient } from "./InventoryClient";

export default async function InventoryPage() {
  const db = await getDb();
  const [categories, suppliers, stores, items, issues, staff] = await Promise.all([
    (db as any).itemCategory.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { items: true } } } }),
    (db as any).supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    (db as any).store.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    (db as any).item.findMany({
      where: { isActive: true },
      include: { category: { select: { name: true } }, supplier: { select: { name: true } }, store: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    (db as any).itemIssue.findMany({
      include: { item: { select: { name: true } } },
      orderBy: { issuedAt: "desc" },
      take: 100,
    }),
    (db as any).staff.findMany({ where: { isActive: true }, select: { id: true, firstName: true, lastName: true, employeeId: true }, orderBy: { firstName: "asc" } }),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Inventory" />
      <InventoryClient categories={categories} suppliers={suppliers} stores={stores} items={items} issues={issues} staff={staff} />
    </div>
  );
}
