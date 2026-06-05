export const dynamic = "force-dynamic";

import { registry } from "@/lib/registry";
import { NovalssAdminClient } from "./NovalssAdminClient";

async function getData() {
  const schools = await (registry as any).schoolTenant.findMany({
    orderBy: { createdAt: "desc" },
  });
  return { schools };
}

export default async function NovalssAdminPage() {
  const { schools } = await getData();
  return <NovalssAdminClient schools={schools} />;
}
