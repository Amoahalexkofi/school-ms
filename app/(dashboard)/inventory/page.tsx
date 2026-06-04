import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { InventoryClient } from "./InventoryClient";

async function getData() {
  const [items, recentMovements] = await Promise.all([
    (prisma as any).item.findMany({ include: { category: true, supplier: true, store: true }, orderBy: { name: "asc" } }),
    (prisma as any).stockMovement.findMany({ include: { item: true }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);
  return { items, recentMovements };
}

export default async function InventoryPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Inventory" />
      <InventoryClient {...data} />
    </div>
  );
}
