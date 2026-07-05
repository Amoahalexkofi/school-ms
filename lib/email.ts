import nodemailer from "nodemailer";
import type { PrismaClient } from "@/app/generated/prisma/client";
import { decryptSecrets } from "@/lib/secrets-crypto";

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: string;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

function createTransporter(cfg: EmailConfig) {
  return nodemailer.createTransport({
    host: cfg.smtpHost,
    port: cfg.smtpPort || 587,
    secure: cfg.smtpSecure === "ssl",
    auth: { user: cfg.smtpUsername, pass: cfg.smtpPassword },
  });
}

export async function sendEmail(
  db: PrismaClient,
  payload: EmailPayload
): Promise<{ ok: boolean; error?: string }> {
  try {
    const cfg = decryptSecrets(await (db as any).emailConfig.findFirst(), ["smtpPassword"]);
    if (!cfg?.isActive || !cfg.smtpHost) {
      console.log("[email] SMTP not configured — skipping send to", payload.to);
      return { ok: false, error: "SMTP not configured" };
    }

    const transporter = createTransporter(cfg);
    const from = `"${cfg.fromName || "Skula"}" <${cfg.fromEmail || cfg.smtpUsername}>`;

    await transporter.sendMail({ from, ...payload });
    return { ok: true };
  } catch (err: any) {
    console.error("[email] Send failed:", err.message);
    return { ok: false, error: err.message };
  }
}

// ─── Template helpers ────────────────────────────────────────────────────────

export function feeReceiptEmail({
  studentName,
  amount,
  currency,
  receiptNo,
  schoolName,
  paymentMode,
  date,
}: {
  studentName: string;
  amount: string;
  currency: string;
  receiptNo: string;
  schoolName: string;
  paymentMode: string;
  date: string;
}): string {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111">
      <div style="background:#4f46e5;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">${schoolName}</h1>
        <p style="color:#c7d2fe;margin:4px 0 0;font-size:13px">Fee Payment Receipt</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
        <p style="margin:0 0 20px">Dear <strong>${studentName}</strong>,</p>
        <p style="margin:0 0 20px">We have received your payment. Here are the details:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="background:#f9fafb">
            <td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600">Receipt No.</td>
            <td style="padding:10px 12px;border:1px solid #e5e7eb">${receiptNo}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600">Amount Paid</td>
            <td style="padding:10px 12px;border:1px solid #e5e7eb;color:#16a34a;font-weight:700">${currency} ${amount}</td>
          </tr>
          <tr style="background:#f9fafb">
            <td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600">Payment Mode</td>
            <td style="padding:10px 12px;border:1px solid #e5e7eb">${paymentMode}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600">Date</td>
            <td style="padding:10px 12px;border:1px solid #e5e7eb">${date}</td>
          </tr>
        </table>
        <p style="margin:24px 0 0;color:#6b7280;font-size:12px">
          Please keep this receipt for your records. Contact the school office if you have any questions.
        </p>
      </div>
    </div>
  `;
}

export function bulkMessageEmail({
  recipientName,
  message,
  schoolName,
  subject,
}: {
  recipientName: string;
  message: string;
  schoolName: string;
  subject: string;
}): string {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111">
      <div style="background:#4f46e5;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">${schoolName}</h1>
        <p style="color:#c7d2fe;margin:4px 0 0;font-size:13px">${subject}</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
        <p style="margin:0 0 16px">Dear <strong>${recipientName}</strong>,</p>
        <div style="white-space:pre-wrap;line-height:1.6">${message}</div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px;margin:0">${schoolName}</p>
      </div>
    </div>
  `;
}

export function passwordResetEmail({
  username,
  resetUrl,
  schoolName,
}: {
  username: string;
  resetUrl: string;
  schoolName: string;
}): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#111">
      <div style="background:#4f46e5;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">${schoolName}</h1>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
        <h2 style="margin:0 0 16px;font-size:18px">Password Reset</h2>
        <p style="margin:0 0 16px">Hi <strong>${username}</strong>,</p>
        <p style="margin:0 0 24px">We received a request to reset your password. Click the button below to set a new one:</p>
        <p style="margin:0 0 24px">
          <a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
            Reset Password
          </a>
        </p>
        <p style="color:#6b7280;font-size:13px;margin:0">
          This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.
        </p>
      </div>
    </div>
  `;
}
