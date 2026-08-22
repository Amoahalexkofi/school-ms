import { getDb } from "@/lib/db";
import { redactList } from "@/lib/config-secrets";
import { WhatsAppConfigClient } from "./WhatsAppConfigClient";

const SECRET_FIELDS = ["apiKey", "password"];

export default async function WhatsAppConfigPage() {
  const db = await getDb();
  const rows = db ? await (db as any).whatsAppConfig.findMany({ orderBy: { provider: "asc" } }) : [];
  // Raw rows carry encrypted secrets straight from the DB — redact before
  // they ever reach the client, same as the /api/whatsapp-config GET route does.
  const configs = redactList(rows, SECRET_FIELDS);
  return <WhatsAppConfigClient configs={configs} />;
}
