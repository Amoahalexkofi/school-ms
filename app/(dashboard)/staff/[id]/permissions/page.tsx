import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { StaffPermissionsMatrix } from "./StaffPermissionsMatrix";

async function getData(staffId: string) {
  const db = (await getDb()) as any;
  const [staff, groups, link] = await Promise.all([
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
  ]);
  return { staff, groups, existingPermissions: link?.role?.permissions ?? [] };
}

export default async function StaffPermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { staff, groups, existingPermissions } = await getData(id);
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
      />
    </div>
  );
}
