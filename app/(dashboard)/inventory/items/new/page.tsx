import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { AddItemForm } from "./AddItemForm";

export default async function AddItemPage() {
  const [categories, suppliers, stores] = await Promise.all([
    (prisma as any).itemCategory.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    (prisma as any).store.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Inventory Item" />
      <AddItemForm categories={categories} suppliers={suppliers} stores={stores} />
    </div>
  );
}
