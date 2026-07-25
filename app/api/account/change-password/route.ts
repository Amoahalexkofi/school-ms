import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

// Self-service password change. The forced first-login flow
// (mustChangePassword) skips current-password verification — the user just
// received that temp password through a separate channel and the whole
// point is a low-friction forced change. A voluntary change (account
// already set up) requires it: without this, anyone who rides an active
// session for a moment (shared device, XSS, a phone left unlocked) could
// silently take over the account by setting a new password with no
// knowledge of the old one, locking the real owner out permanently.
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { currentPassword, newPassword, confirmPassword } = await req.json();
  if (!newPassword || String(newPassword).length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 422 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 422 });
  }

  const db = await getDb();
  const user = await (db as any).user.findUnique({ where: { id: userId }, select: { password: true, mustChangePassword: true } });
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!user.mustChangePassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 422 });
    }
    const matches = await bcrypt.compare(String(currentPassword), user.password);
    if (!matches) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }
  }

  const hash = await bcrypt.hash(String(newPassword), 12);
  await (db as any).user.update({
    where: { id: userId },
    data: { password: hash, mustChangePassword: false },
  });
  return NextResponse.json({ ok: true });
}
