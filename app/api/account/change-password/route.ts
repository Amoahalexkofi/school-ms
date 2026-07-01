import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

// Self-service password change. Used both for the forced first-login flow
// (mustChangePassword) and voluntary changes. The user is already
// authenticated, so we don't require the current password.
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { newPassword, confirmPassword } = await req.json();
  if (!newPassword || String(newPassword).length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 422 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 422 });
  }

  const db = await getDb();
  const hash = await bcrypt.hash(String(newPassword), 12);
  await (db as any).user.update({
    where: { id: userId },
    data: { password: hash, mustChangePassword: false },
  });
  return NextResponse.json({ ok: true });
}
