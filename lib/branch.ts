import { cookies } from "next/headers";
import { BRANCH_COOKIE } from "@/lib/branch-cookie";
import { isAddonEnabled } from "@/lib/addons";

export { BRANCH_COOKIE };

/**
 * The admin's currently-selected branch. Returns null when "All Branches"
 * is selected, nothing chosen yet, OR the Multi Branch add-on is not enabled
 * for this school — meaning no branch filter is applied (single-branch mode).
 */
export async function getActiveBranchId(): Promise<string | null> {
  if (!(await isAddonEnabled("multi_branch"))) return null;
  const c = await cookies();
  const v = c.get(BRANCH_COOKIE)?.value;
  if (!v || v === "all") return null;
  return v;
}
