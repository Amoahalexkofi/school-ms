import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { StaffPermissionsMatrix } from "./StaffPermissionsMatrix";

async function getData(staffId: string) {
  const db = (await getDb()) as any;
  const [staff, groups, link, namedRoles] = await Promise.all([
    db.staff.findUnique({
      where: { id: staffId },
      select: { id: true, firstName: true, lastName: true, user: { select: { role: true } } },
    }),
    db.permissionGroup.findMany({
      where: { isActive: true },
      include: { categories: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
    db.staffAppRole.findUnique({
      where: { staffId },
      include: { role: { include: { permissions: true } } },
    }),
    // Reusable named roles (Settings > Roles & Permissions) — offered here
    // as an optional starting point, e.g. "PA", so the admin doesn't have
    // to re-check every box by hand for a role type they already built.
    db.appRole.findMany({
      where: { isSystem: false, isActive: true },
      include: { permissions: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { staff, groups, existingPermissions: link?.role?.permissions ?? [], namedRoles };
}

export default async function StaffPermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { staff, groups, existingPermissions, namedRoles } = await getData(id);
  if (!staff) notFound();

  return (
    <div className="flex flex-col flex-1">
      <Topbar title={`Permissions — ${staff.firstName} ${staff.lastName}`} />
      <StaffPermissionsMatrix
        staffId={staff.id}
        staffName={`${staff.firstName} ${staff.lastName}`}
        baseRole={staff.user?.role ?? "TEACHER"}
        groups={groups}
        existingPermissions={existingPermissions}
        namedRoles={namedRoles}
      />
    </div>
  );
}
