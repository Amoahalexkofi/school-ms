import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { PermissionsMatrix } from "./PermissionsMatrix";
import { notFound } from "next/navigation";

async function getData(roleId: string) {
  const [role, groups] = await Promise.all([
    ((await getDb()) as any).appRole.findUnique({
      where: { id: roleId },
      include: {
        permissions: { select: { permCatId: true, canView: true, canAdd: true, canEdit: true, canDelete: true } },
      },
    }),
    ((await getDb()) as any).permissionGroup.findMany({
      where: { isActive: true },
      include: {
        categories: {
          where: {},
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);
  return { role, groups };
}

export default async function RolePermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { role, groups } = await getData(id);
  if (!role) notFound();

  return (
    <div className="flex flex-col flex-1">
      <Topbar title={`Permissions — ${role.name}`} />
      <PermissionsMatrix role={role} groups={groups} />
    </div>
  );
}
