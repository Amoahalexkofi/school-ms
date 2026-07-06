import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// CSV export of all audit rows matching the current filters (not just the
// visible page). Same where-clause shape as the audit-log page. Capped so a
// runaway export can't stream the entire table.
const MAX = 10000;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const search = sp.get("search")?.trim() ?? "";

  const where: any = {};
  if (sp.get("entity")) where.entity = sp.get("entity");
  if (sp.get("action")) where.action = { contains: sp.get("action"), mode: "insensitive" };
  if (sp.get("user"))   where.userEmail = sp.get("user");
  if (search) {
    where.OR = [
      { action:    { contains: search, mode: "insensitive" } },
      { entity:    { contains: search, mode: "insensitive" } },
      { userEmail: { contains: search, mode: "insensitive" } },
      { entityId:  { contains: search, mode: "insensitive" } },
    ];
  }
  const from = sp.get("from"), to = sp.get("to");
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from + "T00:00:00");
    if (to)   where.createdAt.lte = new Date(to + "T23:59:59.999");
  }

  const db = (await getDb()) as any;
  const rows = await db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: MAX });

  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = ["Time", "User", "Action", "Entity", "EntityId", "Details"];
  const lines = [
    header.join(","),
    ...rows.map((r: any) => {
      let details = "";
      try { if (r.metadata) details = Object.entries(r.metadata).map(([k, v]) => `${k}=${v}`).join("; "); } catch {}
      return [
        new Date(r.createdAt).toISOString(),
        r.userEmail ?? r.userId ?? "System",
        r.action, r.entity, r.entityId ?? "", details,
      ].map(esc).join(",");
    }),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
