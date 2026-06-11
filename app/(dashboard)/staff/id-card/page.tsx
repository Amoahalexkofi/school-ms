import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { StaffIdCardSetupClient } from "./StaffIdCardSetupClient";

export default async function StaffIdCardSetupPage() {
  const db = await getDb();
  const templates = await (db as any).staffIdCard.findMany({
    orderBy: { createdAt: "asc" },
  });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Staff ID Card Setup" />
      <StaffIdCardSetupClient templates={templates} />
    </div>
  );
}
