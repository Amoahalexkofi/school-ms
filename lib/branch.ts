import { cookies } from "next/headers";
import { BRANCH_COOKIE } from "@/lib/branch-cookie";

export { BRANCH_COOKIE };

/**
 * The admin's currently-selected branch. Returns null when "All Branches"
 * is selected (or nothing chosen yet) — meaning no branch filter is applied.
 */
export async function getActiveBranchId(): Promise<string | null> {
  const c = await cookies();
  const v = c.get(BRANCH_COOKIE)?.value;
  if (!v || v === "all") return null;
  return v;
}
