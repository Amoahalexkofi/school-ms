import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { CustomFieldsClient } from "./CustomFieldsClient";

async function getData() {
  const fields = await ((await getDb()) as any).customField.findMany({
    where: { isActive: true },
    orderBy: [{ tableName: "asc" }, { order: "asc" }],
  });
  return { fields };
}

export default async function CustomFieldsPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Custom Fields" />
      <CustomFieldsClient {...data} />
    </div>
  );
}
