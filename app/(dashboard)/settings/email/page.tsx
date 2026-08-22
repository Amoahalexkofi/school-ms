import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { redactSecrets } from "@/lib/config-secrets";
import { EmailConfigClient } from "./EmailConfigClient";

const SECRET_FIELDS = ["smtpPassword"];

export default async function EmailConfigPage() {
  const row = await ((await getDb()) as any).emailConfig.findFirst();
  // Raw row carries an encrypted smtpPassword straight from the DB — redact
  // before it reaches the client, same as the /api/email-config GET route does.
  const config = row ? redactSecrets(row, SECRET_FIELDS) : row;
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Email Configuration" />
      <EmailConfigClient config={config} />
    </div>
  );
}
