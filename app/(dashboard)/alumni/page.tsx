import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { AlumniClient } from "./AlumniClient";

async function getData() {
  const [alumni, sessions, classes, students] = await Promise.all([
    (prisma as any).alumni.findMany({
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
    (prisma as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    (prisma as any).class.findMany({ orderBy: { name: "asc" } }),
    // Students eligible to be marked as alumni (not yet alumni)
    (prisma as any).student.findMany({
      where: { isAlumni: false, isActive: false }, // disabled students can be promoted to alumni
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
