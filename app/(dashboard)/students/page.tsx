import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";
import { Topbar } from "@/components/Topbar";
import { StudentsClient } from "./StudentsClient";

const LIMIT = 25;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; classId?: string; sectionId?: string }>;
}) {
  const { page: pageStr, search = "", classId = "", sectionId = "" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1") || 1);
  const skip = (page - 1) * LIMIT;

  const db = await getDb();
  const activeBranchId = await getActiveBranchId();

  const where: any = search
    ? {
        OR: [
          { firstName:   { contains: search, mode: "insensitive" } },
          { lastName:    { contains: search, mode: "insensitive" } },
          { admissionNo: { contains: search, mode: "insensitive" } },
          { mobileNo:    { contains: search, mode: "insensitive" } },
        ],
      }
    : {};
  // Smart School forces is_active='yes' on every list query; the
  // /students/disabled page is the inverse view.
  where.isActive = true;
  if (activeBranchId) where.branchId = activeBranchId;
  // Class / Section filter (mirrors Smart School class_search) — via the
  // student's current-session classSection.
  if (classId) {
    where.sessions = { some: { classSection: { classId, ...(sectionId ? { sectionId } : {}) } } };
  }

  const [students, total, sessions, classSections, schoolHouses] = await Promise.all([
    (db as any).student.findMany({
      where,
      include: {
        sessions: {
          include: {
            session: true,
            classSection: { include: { class: true, section: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        schoolHouse: true,
        branch: { select: { name: true } },
      },
      orderBy: { firstName: "asc" },
      skip,
      take: LIMIT,
    }),
    (db as any).student.count({ where }),
    (db as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    (db as any).classSection.findMany({
      include: { class: true, section: true },
      orderBy: { class: { name: "asc" } },
    }),
    (db as any).schoolHouse.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Students" />
      <StudentsClient
        students={students}
        sessions={sessions}
        classSections={classSections}
        schoolHouses={schoolHouses}
        total={total}
        page={page}
        totalPages={Math.ceil(total / LIMIT)}
        limit={LIMIT}
        initialSearch={search}
        initialClassId={classId}
        initialSectionId={sectionId}
      />
    </div>
  );
}
