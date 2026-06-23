import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { requireStaffPage } from "@/lib/auth/guards";
import { GradingClient } from "./GradingClient";

export default async function GradingPage() {
  await requireStaffPage("/dashboard");
  const db = await getDb();

  const scale = await (db as any).gradingScale.findFirst({
    orderBy: { createdAt: "asc" },
    include: { ranges: { where: { isActive: true }, orderBy: { markFrom: "desc" } } },
  }).catch(() => null);

  const divisions = await (db as any).markDivision.findMany({
    where: { isActive: true },
    orderBy: { percentageFrom: "desc" },
  }).catch(() => []);

  const ranges = (scale?.ranges ?? []).map((r: any) => ({
    id: r.id, grade: r.grade, gradePoint: Number(r.gradePoint), markFrom: Number(r.markFrom), markTo: Number(r.markTo),
  }));
  const divs = divisions.map((d: any) => ({
    id: d.id, name: d.name, percentageFrom: Number(d.percentageFrom), percentageTo: Number(d.percentageTo),
  }));

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Grading & Divisions" />
      <GradingClient scaleName={scale?.name ?? "Default Grading"} ranges={ranges} divisions={divs} />
    </div>
  );
}
