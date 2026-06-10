import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { FeeDiscountsClient } from "./FeeDiscountsClient";

export default async function FeeDiscountsPage() {
  const db = await getDb();
  const [sessions, classSections, discounts] = await Promise.all([
    (db as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    (db as any).classSection.findMany({
      include: { class: true, section: true },
      orderBy: { class: { name: "asc" } },
    }),
    (db as any).feeDiscount.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Fee Discounts" />
      <FeeDiscountsClient sessions={sessions} classSections={classSections} discounts={discounts} />
    </div>
  );
}
