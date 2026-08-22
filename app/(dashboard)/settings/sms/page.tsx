import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { redactList } from "@/lib/config-secrets";
import { SmsConfigClient } from "./SmsConfigClient";

const SECRET_FIELDS = ["apiKey", "password"];

export default async function SmsConfigPage() {
  const rows = await ((await getDb()) as any).smsConfig.findMany({ orderBy: { provider: "asc" } });
  // Raw rows carry encrypted secrets straight from the DB — redact before
  // they ever reach the client, same as the /api/sms-config GET route does.
  const configs = redactList(rows, SECRET_FIELDS);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="SMS Configuration" />
      <SmsConfigClient configs={configs} />
    </div>
  );
}
