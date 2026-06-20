import { Topbar } from "@/components/Topbar";
import { listBranches } from "@/lib/services/branches";
import { BranchesClient } from "./BranchesClient";

export default async function BranchesPage() {
  const branches = await listBranches().catch(() => []);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Branches" />
      <BranchesClient initialBranches={branches} />
    </div>
  );
}
