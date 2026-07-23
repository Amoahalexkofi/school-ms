import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { FeeRemindersClient } from "./FeeRemindersClient";

export default async function FeeRemindersPage() {
  const reminders = await ((await getDb()) as any).feeReminder.findMany({
    orderBy: [{ reminderType: "asc" }, { day: "asc" }],
  });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Fee Reminders" />
      <FeeRemindersClient reminders={reminders} />
    </div>
  );
}
