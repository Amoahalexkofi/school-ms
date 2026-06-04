import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { FeeSessionGroupClient } from "./FeeSessionGroupClient";

export default async function FeeSessionGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [sg, feeTypes] = await Promise.all([
    (prisma as any).feeSessionGroup.findUnique({
      where: { id },
      include: {
        feeGroup: true,
        session:  true,
        items: {
          include: { feeType: { select: { name: true, code: true } } },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { studentFeesMasters: true } },
      },
    }),
    (prisma as any).feeType.findMany({
      where: { isActive: true, isSystem: false },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!sg) notFound();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title={`${sg.feeGroup.name} — ${sg.session.session}`} />
      <FeeSessionGroupClient sg={sg} feeTypes={feeTypes} />
    </div>
  );
}
