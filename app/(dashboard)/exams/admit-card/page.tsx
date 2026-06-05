import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { AdmitCardClient } from "./AdmitCardClient";

async function getData() {
  const [examGroups, classes, school] = await Promise.all([
    (prisma as any).examGroup.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        schedules: {
          include: { subject: { select: { name: true } }, session: { select: { id: true, session: true } } },
          orderBy: { dateOfExam: "asc" },
        },
      },
    }),
    (prisma as any).class.findMany({
      orderBy: { name: "asc" },
      include: {
        classSections: {
          where: { isActive: true },
          include: { section: { select: { id: true, name: true } } },
        },
      },
    }),
    (prisma as any).schoolProfile.findFirst(),
  ]);
  return { examGroups, classes, school };
}

export default async function AdmitCardPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Admit Cards" />
      <AdmitCardClient {...data} />
    </div>
  );
}
