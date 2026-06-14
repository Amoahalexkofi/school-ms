import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendEmail, passwordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const db = await getDb();
  const user = await (db as any).user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Always respond with success to avoid email enumeration
  if (!user || !user.isActive) {
    return NextResponse.json({ ok: true });
  }

  // Generate a secure 32-byte token, valid for 1 hour (Smart School pattern)
  const token  = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000);

  await (db as any).user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  const schoolProfile = await (db as any).schoolProfile.findFirst();
  const schoolName    = schoolProfile?.name ?? "Skula";

  const host     = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const resetUrl = `${protocol}://${host}/reset-password/${token}`;

  const result = await sendEmail(db, {
    to: user.email,
    subject: `Reset your password — ${schoolName}`,
    html: passwordResetEmail({ username: user.username, resetUrl, schoolName }),
  });

  if (!result.ok) {
    console.log(`[DEV] Password reset token for ${email}: ${token}`);
  }

  return NextResponse.json({ ok: true });
}
