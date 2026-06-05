import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { RolesClient } from "./RolesClient";

export default async function RolesPage() {
  const roles = await (prisma as any).appRole.findMany({
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
