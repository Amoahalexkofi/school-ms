import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { HomeworkClient } from "./HomeworkClient";

async function getData() {
  const [classes, staff, session] = await Promise.all([
    (prisma as any).class.findMany({
      orderBy: { name: "asc" },
      include: {
        classSections: {
          where: { isActive: true },
          include: { section: { select: { id: true, name: true } } },
        },
      },
    }),
    (prisma as any).staff.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
    (prisma as any).academicSession.findFirst({
      orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
    }),
  ]);
  return { classes, staff, session };
}

export default async function HomeworkPage() {
  const { classes, staff, session } = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Homework" />
      <HomeworkClient classes={classes} staff={staff} session={session} />
    </div>
  );
}
