import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";

// Who can I start a chat with? Active staff of every role, plus admin
// accounts that have no staff row (the head/proprietor login) — messaging
// leadership is the point. Deliberately NOT students/parents; school-internal
// chat is a staffroom, not a DM app.
export async function GET() {
  const session = await auth();
  const myId = (session?.user as any)?.id;
  if (!myId) return NextResponse.json([]);
  const db = await getDb();

  const [staff, adminUsers] = await Promise.all([
    (db as any).staff.findMany({
      where: { isActive: true, userId: { not: myId } },
      select: { firstName: true, lastName: true, user: { select: { id: true, role: true } } },
      orderBy: [{ firstName: "asc" }],
    }),
    (db as any).user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, id: { not: myId }, isActive: true },
      select: { id: true, email: true, name: true, role: true },
    }).catch(() =>
      (db as any).user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, id: { not: myId } },
        select: { id: true, email: true, name: true, role: true },
      })
    ),
  ]);

  const out: { userId: string; name: string; role: string }[] = [];
  const seen = new Set<string>();
  for (const s of staff) {
    if (!s.user?.id || seen.has(s.user.id)) continue;
    seen.add(s.user.id);
    out.push({ userId: s.user.id, name: `${s.firstName} ${s.lastName}`.trim(), role: s.user.role });
  }
  for (const u of adminUsers) {
    if (seen.has(u.id)) continue;
    seen.add(u.id);
    out.push({ userId: u.id, name: u.name || u.email.split("@")[0], role: u.role });
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return NextResponse.json(out);
}
