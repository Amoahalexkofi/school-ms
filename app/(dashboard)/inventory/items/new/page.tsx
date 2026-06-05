import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AddItemForm } from "./AddItemForm";

export default async function AddItemPage() {
  const [categories, suppliers, stores] = await Promise.all([
    ((await getDb()) as any).itemCategory.findMany({ orderBy: { name: "asc" } }),
    ((await getDb()) as any).supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ((await getDb()) as any).store.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Inventory Item" />
      <AddItemForm categories={categories} suppliers={suppliers} stores={stores} />
    </div>
  );
}
