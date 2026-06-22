import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { MarksheetClient } from "./MarksheetClient";

async function getData() {
  const [examGroups, classes, school, divisions] = await Promise.all([
    ((await getDb()) as any).examGroup.findMany({
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
                    rollNo: true, dateOfBirth: true, gender: true, image: true,
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
    ((await getDb()) as any).class.findMany({
      orderBy: { name: "asc" },
      include: {
        classSections: {
          where: { isActive: true },
          include: { section: { select: { id: true, name: true } } },
        },
      },
    }),
    ((await getDb()) as any).schoolProfile.findFirst(),
    ((await getDb()) as any).markDivision.findMany({
      where: { isActive: true },
      orderBy: { percentageFrom: "desc" },
    }).catch(() => []),
  ]);
  // Plain objects (Decimal → number) for the client
  const divs = (divisions ?? []).map((d: any) => ({
    name: d.name, from: Number(d.percentageFrom), to: Number(d.percentageTo),
  }));
  return { examGroups, classes, school, divisions: divs };
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
