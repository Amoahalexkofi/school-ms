import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { HolidaysClient } from "./HolidaysClient";

async function getData() {
  const [holidays, holidayTypes, sessions] = await Promise.all([
    ((await getDb()) as any).holiday.findMany({
      where: { isActive: true },
      include: {
        holidayType: true,
        session: { select: { id: true, session: true } },
      },
      orderBy: { fromDate: "desc" },
    }),
    ((await getDb()) as any).holidayType.findMany({
      where: { isActive: true },
      include: { _count: { select: { holidays: true } } },
      orderBy: { name: "asc" },
    }),
    ((await getDb()) as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
  ]);
  return { holidays, holidayTypes, sessions };
}

export default async function HolidaysPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Holidays" />
      <HolidaysClient {...data} />
    </div>
  );
}
