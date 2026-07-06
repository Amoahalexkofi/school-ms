import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AuditLogClient } from "./AuditLogClient";

const LIMIT = 50;

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string; search?: string; entity?: string; action?: string;
    user?: string; from?: string; to?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1") || 1);
  const skip = (page - 1) * LIMIT;
  const search = sp.search?.trim() ?? "";

  const db = (await getDb()) as any;

  // Server-side filter — the log grows without bound, so this must never load
  // the whole table. Search covers action/entity/user/entityId.
  const where: any = {};
  if (sp.entity) where.entity = sp.entity;
  if (sp.action) where.action = { contains: sp.action, mode: "insensitive" };
  if (sp.user)   where.userEmail = sp.user;
  if (search) {
    where.OR = [
      { action:    { contains: search, mode: "insensitive" } },
      { entity:    { contains: search, mode: "insensitive" } },
      { userEmail: { contains: search, mode: "insensitive" } },
      { entityId:  { contains: search, mode: "insensitive" } },
    ];
  }
  if (sp.from || sp.to) {
    where.createdAt = {};
    if (sp.from) where.createdAt.gte = new Date(sp.from + "T00:00:00");
    if (sp.to)   where.createdAt.lte = new Date(sp.to + "T23:59:59.999");
  }

  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);

  const [logs, total, totalEvents, todayCount, entityGroups, actionGroups, userGroups] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: LIMIT }),
    db.auditLog.count({ where }),
    db.auditLog.count(),
    db.auditLog.count({ where: { createdAt: { gte: startOfToday } } }),
    // Distinct filter values (over the whole table, not just the page)
    db.auditLog.groupBy({ by: ["entity"], orderBy: { entity: "asc" } }),
    db.auditLog.groupBy({ by: ["action"], orderBy: { action: "asc" } }),
    db.auditLog.groupBy({ by: ["userEmail"] }),
  ]);

  const entities = entityGroups.map((g: any) => g.entity).filter(Boolean);
  const actions  = actionGroups.map((g: any) => g.action).filter(Boolean);
  const users    = userGroups.map((g: any) => g.userEmail).filter(Boolean).sort();

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Audit Log" />
      <AuditLogClient
        logs={logs}
        entities={entities}
        actions={actions}
        users={users}
        total={total}
        totalEvents={totalEvents}
        todayCount={todayCount}
        userCount={users.length}
        page={page}
        totalPages={Math.ceil(total / LIMIT)}
        limit={LIMIT}
        filters={{
          search, entity: sp.entity ?? "", action: sp.action ?? "",
          user: sp.user ?? "", from: sp.from ?? "", to: sp.to ?? "",
        }}
      />
    </div>
  );
}
