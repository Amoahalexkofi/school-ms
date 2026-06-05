import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AuditLogClient } from "./AuditLogClient";

async function getData() {
  const [logs, users] = await Promise.all([
    ((await getDb()) as any).auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    ((await getDb()) as any).user.findMany({
      select: { id: true, email: true },
      orderBy: { email: "asc" },
    }),
  ]);
  const entities = [...new Set(logs.map((l: any) => l.entity as string))].sort() as string[];
  const actions = [...new Set(logs.map((l: any) => l.action as string))].sort() as string[];
  return { logs, users, entities, actions };
}

export default async function AuditLogPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Audit Log" />
      <AuditLogClient {...data} />
    </div>
  );
}
