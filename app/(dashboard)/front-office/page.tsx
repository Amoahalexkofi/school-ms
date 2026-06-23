import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { FrontOfficeClient } from "./FrontOfficeClient";

export default async function FrontOfficePage() {
  const [purposes, visitors, complaintTypes, complaints, enquiries, dispatches] = await Promise.all([
    ((await getDb()) as any).visitorPurpose.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ((await getDb()) as any).visitor.findMany({
      include: { purpose: { select: { name: true } } },
      orderBy: { inTime: "desc" },
      take: 100,
    }),
    ((await getDb()) as any).complaintType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ((await getDb()) as any).complaint.findMany({
      include: { complaintType: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    ((await getDb()) as any).enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    ((await getDb()) as any).dispatch.findMany({ orderBy: { date: "desc" }, take: 200 }),
  ]);
  const calls = await ((await getDb()) as any).phoneCallLog.findMany({ orderBy: { date: "desc" }, take: 200 }).catch(() => []);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Front Office" />
      <FrontOfficeClient
        purposes={purposes} visitors={visitors}
        complaintTypes={complaintTypes} complaints={complaints}
        enquiries={enquiries} dispatches={dispatches} calls={calls}
      />
    </div>
  );
}
