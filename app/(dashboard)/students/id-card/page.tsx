import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { IdCardSetupClient } from "./IdCardSetupClient";

export default async function IdCardSetupPage() {
  const db = await getDb();
  const templates = await (db as any).idCard.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="ID Card Setup" />
      <IdCardSetupClient templates={templates} />
    </div>
  );
}
