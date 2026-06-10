import { getDb } from "@/lib/db";

export async function log(entry: {
  userId?: string;
  userEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const prisma = await getDb();
  return (prisma as any).auditLog.create({
    data: {
      userId:    entry.userId    || null,
      userEmail: entry.userEmail || null,
      action:    entry.action,
      entity:    entry.entity,
      entityId:  entry.entityId  || null,
      metadata:  entry.metadata  ?? null,
    },
  });
}

export async function getAuditLogs(filters?: { entity?: string; userId?: string; limit?: number }) {
  const prisma = await getDb();
  return (prisma as any).auditLog.findMany({
    where: {
      ...(filters?.entity ? { entity: filters.entity } : {}),
      ...(filters?.userId ? { userId: filters.userId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: filters?.limit ?? 100,
  });
}
