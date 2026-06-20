import { redirect } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { listBranches } from "@/lib/services/branches";
import { isAddonEnabled } from "@/lib/addons";
import { BranchesClient } from "./BranchesClient";

export default async function BranchesPage() {
  // Multi Branch is a paid add-on — block access unless released to this school.
  if (!(await isAddonEnabled("multi_branch"))) redirect("/dashboard");
  const branches = await listBranches().catch(() => []);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Branches" />
      <BranchesClient initialBranches={branches} />
    </div>
  );
}
