import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AlumniClient } from "./AlumniClient";

async function getData() {
  const [alumni, sessions, classes, students] = await Promise.all([
    ((await getDb()) as any).alumni.findMany({
      include: {
        student: {
          select: {
            id: true, firstName: true, lastName: true, admissionNo: true,
            gender: true, image: true,
            sessions: {
              include: {
                session: { select: { id: true, session: true } },
                classSection: {
                  include: {
                    class: { select: { name: true } },
                    section: { select: { name: true } },
                  },
                },
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    ((await getDb()) as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    ((await getDb()) as any).class.findMany({ orderBy: { name: "asc" } }),
    // Students eligible to be marked as alumni (inactive + no Alumni record yet)
    ((await getDb()) as any).student.findMany({
      where: { isActive: false, alumni: { is: null } },
      select: {
        id: true, firstName: true, lastName: true, admissionNo: true,
        sessions: {
          include: {
            session: { select: { session: true } },
            classSection: { include: { class: { select: { name: true } } } },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ firstName: "asc" }],
      take: 200,
    }),
  ]);
  return { alumni, sessions, classes, students };
}

export default async function AlumniPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Alumni" />
      <AlumniClient {...data} />
    </div>
  );
}
