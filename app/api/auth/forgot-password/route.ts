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

  // Build the reset link from a TRUSTED host only. The Host header is
  // attacker-controllable (reset-link poisoning), so validate it against our
  // allowed app domains and fall back to the primary domain otherwise.
  const appDomains = (process.env.NEXT_PUBLIC_APP_DOMAIN ?? "getskula.com")
    .split(",").map((d) => d.trim()).filter(Boolean);
  const rawHost = (req.headers.get("x-novalss-host") ?? req.headers.get("host") ?? "").split(":")[0];
  const hostOk = appDomains.some((d) => rawHost === d || rawHost.endsWith(`.${d}`));
  const host = hostOk && rawHost ? rawHost : appDomains[0];
  const protocol = host.includes("localhost") ? "http" : "https";
  const resetUrl = `${protocol}://${host}/reset-password/${token}`;

  await sendEmail(db, {
    to: user.email,
    subject: `Reset your password — ${schoolName}`,
    html: passwordResetEmail({ username: user.username, resetUrl, schoolName }),
  });

  // Never log the reset token (it grants account access).
  return NextResponse.json({ ok: true });
}
