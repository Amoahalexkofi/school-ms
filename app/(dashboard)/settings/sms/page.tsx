import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { SmsConfigClient } from "./SmsConfigClient";

export default async function SmsConfigPage() {
  const configs = await ((await getDb()) as any).smsConfig.findMany({ orderBy: { provider: "asc" } });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="SMS Configuration" />
      <SmsConfigClient configs={configs} />
    </div>
  );
}
