import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { FeeSetupClient } from "./FeeSetupClient";

export default async function FeeSetupPage() {
  const [categories, types, groups, sessions, discounts] = await Promise.all([
    ((await getDb()) as any).feeCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { feeTypes: true } } },
    }),
    ((await getDb()) as any).feeType.findMany({
      where: { isActive: true, isSystem: false },
      include: { feeCategory: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    ((await getDb()) as any).feeGroup.findMany({
      where: { isSystem: false },
      include: {
        sessionGroups: {
          include: {
            session: { select: { session: true } },
            _count: { select: { items: true, studentFeesMasters: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    ((await getDb()) as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    ((await getDb()) as any).feeDiscount.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Fee Setup" />
      <FeeSetupClient categories={categories} types={types} groups={groups} sessions={sessions} discounts={discounts} />
    </div>
  );
}
