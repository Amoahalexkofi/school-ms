export const dynamic = "force-dynamic";

import { registry } from "@/lib/registry";
import { NovalssAdminClient } from "./NovalssAdminClient";

async function getData() {
  try {
    const schools = await (registry as any).schoolTenant.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { schools };
  } catch (e) {
    console.error("[novalss-admin] registry query failed:", e);
    return { schools: [] };
  }
}

export default async function NovalssAdminPage() {
  const { schools } = await getData();
  return <NovalssAdminClient schools={schools} />;
}
