import { getDb } from "@/lib/db";
import { WhatsAppConfigClient } from "./WhatsAppConfigClient";

export default async function WhatsAppConfigPage() {
  const db = await getDb();
  const configs = db ? await (db as any).whatsAppConfig.findMany({ orderBy: { provider: "asc" } }) : [];
  return <WhatsAppConfigClient configs={configs} />;
}
