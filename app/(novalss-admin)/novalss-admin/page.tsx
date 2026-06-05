export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { registry } from "@/lib/registry";
import { NovalssAdminClient } from "./NovalssAdminClient";

const ADMIN_KEY = process.env.NOVALSS_ADMIN_KEY ?? "change-me-in-production";

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

export default async function NovalssAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const cookieStore = await cookies();
  const params = await searchParams;

  // Check key from URL param (first-time access) or cookie (subsequent visits)
  const urlKey = params.key;
  const cookieKey = cookieStore.get("novalss_admin_key")?.value;

  if (urlKey !== ADMIN_KEY && cookieKey !== ADMIN_KEY) {
    redirect("/novalss-admin/login");
  }

  const { schools } = await getData();
  return <NovalssAdminClient schools={schools} />;
}
