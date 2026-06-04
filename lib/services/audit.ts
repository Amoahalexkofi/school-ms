import { prisma } from "@/lib/prisma";

export async function log(entry: {
  userId?: string;
  userEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  return (prisma as any).auditLog.create({ data: entry });
}

export async function getAuditLogs(filters?: { entity?: string; userId?: string; limit?: number }) {
  return (prisma as any).auditLog.findMany({
    where: {
      ...(filters?.entity ? { entity: filters.entity } : {}),
      ...(filters?.userId ? { userId: filters.userId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: filters?.limit ?? 100,
  });
}
