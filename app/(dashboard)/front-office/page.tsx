import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { FrontOfficeClient } from "./FrontOfficeClient";

async function getData() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const [visitorsToday, allVisitors, complaints, enquiries] = await Promise.all([
    (prisma as any).visitor.count({ where: { inTime: { gte: today, lt: tomorrow } } }),
    (prisma as any).visitor.findMany({ orderBy: { inTime: "desc" }, take: 20 }),
    (prisma as any).complaint.findMany({ orderBy: { createdAt: "desc" } }),
    (prisma as any).enquiry.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  return { visitorsToday, allVisitors, complaints, enquiries };
}

export default async function FrontOfficePage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Front Office" />
      <FrontOfficeClient {...data} />
    </div>
  );
}
