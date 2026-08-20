import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { RolesClient } from "./RolesClient";

export default async function RolesPage() {
  const roles = await ((await getDb()) as any).appRole.findMany({
    // Exclude auto-generated per-staff roles (created by the direct
    // Permissions screen on a staff profile) — this list is for reusable,
    // admin-named roles only.
    where: { isHidden: false },
    include: {
      _count: { select: { permissions: true, staffRoles: true } },
    },
    orderBy: { name: "asc" },
  });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Roles & Permissions" />
      <RolesClient roles={roles} />
    </div>
  );
}
