import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { HomeworkClient } from "./HomeworkClient";

async function getData() {
  const [classes, staff, session] = await Promise.all([
    ((await getDb()) as any).class.findMany({
      orderBy: { name: "asc" },
      include: {
        classSections: {
          where: { isActive: true },
          include: { section: { select: { id: true, name: true } } },
        },
      },
    }),
    ((await getDb()) as any).staff.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
    ((await getDb()) as any).academicSession.findFirst({
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
