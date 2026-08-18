import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";

// Self-service profile info for the logged-in user (currently just the
// avatar image). Scoped to the session's own id — never accepts a userId
// from the client — so this can only ever change the caller's own record.
export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const db = (await getDb()) as any;
  const user = await db.user.findUnique({ where: { id: userId }, select: { username: true, email: true, image: true } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { image } = await req.json();
  const db = (await getDb()) as any;
  const user = await db.user.update({
    where: { id: userId },
    data: { image: image || null },
    select: { username: true, email: true, image: true },
  });
  return NextResponse.json(user);
}
