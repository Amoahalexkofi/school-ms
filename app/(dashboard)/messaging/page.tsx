import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { MessagingClient } from "./MessagingClient";

async function getData() {
  const [logs, parentCount, staffCount, studentCount] = await Promise.all([
    (prisma as any).messageLog.findMany({ include: { sentBy: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    (prisma as any).user.count({ where: { role: "PARENT" } }),
    (prisma as any).staff.count(),
    (prisma as any).student.count(),
  ]);
  return { logs, parentCount, staffCount, studentCount };
}

export default async function MessagingPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Messaging" />
      <MessagingClient {...data} />
    </div>
  );
}
