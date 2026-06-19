import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { StaffClient } from "./StaffClient";

const LIMIT = 25;

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; departmentId?: string }>;
}) {
  const { page: pageStr, search = "", departmentId = "" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1") || 1);
  const skip = (page - 1) * LIMIT;

  const db = await getDb();

  const where: any = {};
  if (departmentId) where.departmentId = departmentId;
  if (search) {
    where.OR = [
      { firstName:  { contains: search, mode: "insensitive" } },
      { lastName:   { contains: search, mode: "insensitive" } },
      { employeeId: { contains: search, mode: "insensitive" } },
      { contactNo:  { contains: search, mode: "insensitive" } },
    ];
  }

  const [staff, total, departments, designations] = await Promise.all([
    (db as any).staff.findMany({
      where,
      include: {
        user:        { select: { email: true, role: true } },
        department:  { select: { name: true } },
        designation: { select: { name: true } },
      },
      orderBy: { firstName: "asc" },
      skip,
      take: LIMIT,
    }),
    (db as any).staff.count({ where }),
    (db as any).department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    (db as any).designation.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Staff" />
      <StaffClient
        staff={staff}
        departments={departments}
        designations={designations}
        total={total}
        page={page}
        totalPages={Math.ceil(total / LIMIT)}
        limit={LIMIT}
        initialSearch={search}
        initialDeptId={departmentId}
      />
    </div>
  );
}
