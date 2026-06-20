import { headers } from "next/headers";

// Add-on catalog. Add new purchasable add-ons here as they are built.
export const ADDONS = {
  multi_branch: {
    key: "multi_branch",
    label: "Multi Branch",
    description: "Manage multiple campuses/branches under one school account.",
  },
} as const;

export type AddonKey = keyof typeof ADDONS;
export const ADDON_KEYS = Object.keys(ADDONS) as AddonKey[];

/**
 * Enabled add-ons for the current tenant, from the `x-tenant-addons` header set
 * by the proxy. "*" (apex/demo) means all add-ons are available.
 */
export async function getEnabledAddons(): Promise<AddonKey[]> {
  const h = await headers();
  const raw = h.get("x-tenant-addons");
  if (raw === null || raw === "*") return [...ADDON_KEYS]; // apex/demo or dev → all
  const enabled = raw.split(",").map(s => s.trim()).filter(Boolean);
  return ADDON_KEYS.filter(k => enabled.includes(k));
}

export async function isAddonEnabled(key: AddonKey): Promise<boolean> {
  const enabled = await getEnabledAddons();
  return enabled.includes(key);
}
