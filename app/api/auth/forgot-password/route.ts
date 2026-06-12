import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

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

  // Get school's SMTP config
  const emailConfig = await (db as any).emailConfig.findFirst();
  if (!emailConfig?.isActive || !emailConfig.smtpHost) {
    // No SMTP configured — log token for dev, return ok
    console.log(`[DEV] Password reset token for ${email}: ${token}`);
    return NextResponse.json({ ok: true });
  }

  const schoolProfile = await (db as any).schoolProfile.findFirst();
  const schoolName    = schoolProfile?.name ?? "Skula";

  // Determine reset URL — use x-forwarded-host (tenant subdomain) if available
  const host     = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const resetUrl = `${protocol}://${host}/reset-password/${token}`;

  const transport = nodemailer.createTransport({
    host: emailConfig.smtpHost,
    port: emailConfig.smtpPort ?? 587,
    secure: emailConfig.smtpSecure === "ssl",
    auth: { user: emailConfig.smtpUsername, pass: emailConfig.smtpPassword },
  });

  await transport.sendMail({
    from: `"${emailConfig.fromName || schoolName}" <${emailConfig.fromEmail || emailConfig.smtpUsername}>`,
    to: user.email,
    subject: `Reset your password — ${schoolName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#4f46e5">Password Reset</h2>
        <p>Hi ${user.username},</p>
        <p>We received a request to reset the password for your <strong>${schoolName}</strong> account.</p>
        <p style="margin:24px 0">
          <a href="${resetUrl}"
             style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Reset Password
          </a>
        </p>
        <p style="color:#6b7280;font-size:13px">
          This link expires in <strong>1 hour</strong>. If you did not request a reset, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">${schoolName}</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
