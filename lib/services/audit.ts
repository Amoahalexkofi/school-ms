import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";

// One-line audit trail for sensitive mutations. Resolves the actor from the
// session itself and NEVER throws — an audit failure must not break the
// operation being audited. Call after the mutation succeeds:
//   await audit("collect", "fee-payment", deposit.id, { amount });
export async function audit(
  action: string,
  entity: string,
  entityId?: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; email?: string } | undefined;
    const prisma = await getDb();
    await (prisma as any).auditLog.create({
      data: {
        userId:    user?.id    || null,
        userEmail: user?.email || null,
        action,
        entity,
        entityId:  entityId || null,
        metadata:  metadata ?? null,
      },
    });
  } catch (err) {
    console.warn("[audit] failed to record", action, entity, err instanceof Error ? err.message : err);
  }
}

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
