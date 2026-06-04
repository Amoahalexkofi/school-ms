import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { FeeSetupClient } from "./FeeSetupClient";

export default async function FeeSetupPage() {
  const [categories, types, groups, sessions] = await Promise.all([
    (prisma as any).feeCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { feeTypes: true } } },
    }),
    (prisma as any).feeType.findMany({
      where: { isActive: true, isSystem: false },
      include: { feeCategory: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    (prisma as any).feeGroup.findMany({
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
    (prisma as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Fee Setup" />
      <FeeSetupClient categories={categories} types={types} groups={groups} sessions={sessions} />
    </div>
  );
}
