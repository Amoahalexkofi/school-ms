import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { IdCardSetupClient } from "./IdCardSetupClient";

export default async function IdCardSetupPage() {
  const db = await getDb();
  // IdCard mirrors Smart School: active flag is `status Int` (1 = active),
  // there is no isActive column — filtering on it crashes the page.
  const templates = await (db as any).idCard.findMany({
    where: { status: 1 },
    orderBy: { createdAt: "asc" },
  });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="ID Card Setup" />
      <IdCardSetupClient templates={templates} />
    </div>
  );
}
