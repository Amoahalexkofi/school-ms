import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";

// Who can I start a chat with? Active staff (all roles) — deliberately NOT
// students/parents; school-internal chat is a staffroom, not a DM app.
export async function GET() {
  const session = await auth();
  const myId = (session?.user as any)?.id;
  if (!myId) return NextResponse.json([]);
  const db = await getDb();
  const staff = await (db as any).staff.findMany({
    where: { isActive: true, userId: { not: myId } },
    select: {
      firstName: true, lastName: true,
      user: { select: { id: true, role: true } },
    },
    orderBy: [{ firstName: "asc" }],
  });
  return NextResponse.json(
    staff
      .filter((s: any) => s.user?.id)
      .map((s: any) => ({
        userId: s.user.id,
        name: `${s.firstName} ${s.lastName}`.trim(),
        role: s.user.role,
      }))
  );
}
