import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { MarksheetClient } from "./MarksheetClient";

async function getData() {
  const [examGroups, classes, school] = await Promise.all([
    (prisma as any).examGroup.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: {
        schedules: {
          include: {
            subject: { select: { id: true, name: true, code: true } },
            session: { select: { id: true, session: true } },
            markEntries: {
              include: {
                student: {
                  select: {
                    id: true, firstName: true, lastName: true, admissionNo: true,
                    rollNo: true, dob: true, gender: true, image: true,
                    fatherName: true, motherName: true, currentAddress: true,
                  },
                },
              },
            },
          },
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

export default async function MarksheetPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Marksheets" />
      <MarksheetClient {...data} />
    </div>
  );
}
