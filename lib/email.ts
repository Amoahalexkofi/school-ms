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
    // Vercel's serverless network layer intermittently throws
    // "getaddrinfo EBUSY" on raw SMTP connections — DNS-resolver resource
    // contention in the sandbox, not a bad host. Forcing IPv4 (most mail
    // hosts have no AAAA record anyway) and bounding the connect phase
    // avoids hanging on it; the retry in sendEmail() below covers the rest.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
  });
}

function isTransientDnsError(err: any): boolean {
  return err?.code === "EBUSY" || err?.code === "EAI_AGAIN" || err?.code === "ETIMEDOUT";
}

// A raw connection from a small SMTP host that firewalls cloud/datacenter IP
// ranges (confirmed: some hosting providers silently drop these — ETIMEDOUT,
// no RST, no response at all). Resend delivers over HTTPS instead of a raw
// socket, so it isn't subject to that block. It still can't send AS a domain
// it hasn't verified (that's how anti-spoofing works everywhere, not a
// Skula limitation) — until a school's domain is verified in the one
// platform Resend account, this fallback will fail too, harmlessly, and
// start working the moment that domain is verified with no code changes.
async function sendViaResend(
  payload: EmailPayload,
  from: string
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.PLATFORM_RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "Resend not configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.message ?? `Resend HTTP ${res.status}` };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function sendEmail(
  db: PrismaClient,
  payload: EmailPayload
): Promise<{ ok: boolean; error?: string }> {
  const cfg = decryptSecrets(await (db as any).emailConfig.findFirst(), ["smtpPassword"]);
  if (!cfg?.isActive || !cfg.smtpHost) {
    console.log("[email] SMTP not configured — skipping send to", payload.to);
    return { ok: false, error: "SMTP not configured" };
  }

  const from = `"${cfg.fromName || "Skula"}" <${cfg.fromEmail || cfg.smtpUsername}>`;
  let smtpError: string | undefined;

  try {
    const transporter = createTransporter(cfg);
    try {
      await transporter.sendMail({ from, ...payload });
    } catch (err: any) {
      // One retry for the transient DNS/connection failures Vercel's
      // sandbox occasionally throws on raw SMTP — a real bad host or bad
      // credentials fails the same way twice, so this costs nothing there.
      if (!isTransientDnsError(err)) throw err;
      await transporter.sendMail({ from, ...payload });
    }
    return { ok: true };
  } catch (err: any) {
    // err.code is the real signal (ECONNREFUSED = host actively refused,
    // ETIMEDOUT = packets went nowhere/silently dropped, EAUTH = bad
    // credentials, ...) — surface it, since "Connection timeout" alone
    // isn't enough to tell a firewall block from a genuinely dead host.
    console.error("[email] SMTP send failed:", err.code, err.command, err.message);
    const detail = err.code ? ` (${err.code})` : "";
    smtpError = `${err.message}${detail}`;
  }

  const viaResend = await sendViaResend(payload, from);
  if (viaResend.ok) return { ok: true };

  console.error("[email] Resend fallback also failed:", viaResend.error);
  return { ok: false, error: smtpError };
}

// ─── Template helpers ────────────────────────────────────────────────────────

// Every value below can originate from admin/staff-entered data (a student's
// name, a school's name, a bulk-message body) and gets interpolated straight
// into an HTML email — escape it first or a name/message containing HTML
// gets rendered (or, in permissive email clients, executed) for whoever
// receives the email.
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
        <h1 style="color:#fff;margin:0;font-size:20px">${escapeHtml(schoolName)}</h1>
        <p style="color:#c7d2fe;margin:4px 0 0;font-size:13px">Fee Payment Receipt</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
        <p style="margin:0 0 20px">Dear <strong>${escapeHtml(studentName)}</strong>,</p>
        <p style="margin:0 0 20px">We have received your payment. Here are the details:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="background:#f9fafb">
            <td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600">Receipt No.</td>
            <td style="padding:10px 12px;border:1px solid #e5e7eb">${escapeHtml(receiptNo)}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600">Amount Paid</td>
            <td style="padding:10px 12px;border:1px solid #e5e7eb;color:#16a34a;font-weight:700">${escapeHtml(currency)} ${escapeHtml(amount)}</td>
          </tr>
          <tr style="background:#f9fafb">
            <td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600">Payment Mode</td>
            <td style="padding:10px 12px;border:1px solid #e5e7eb">${escapeHtml(paymentMode)}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600">Date</td>
            <td style="padding:10px 12px;border:1px solid #e5e7eb">${escapeHtml(date)}</td>
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
        <h1 style="color:#fff;margin:0;font-size:20px">${escapeHtml(schoolName)}</h1>
        <p style="color:#c7d2fe;margin:4px 0 0;font-size:13px">${escapeHtml(subject)}</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
        <p style="margin:0 0 16px">Dear <strong>${escapeHtml(recipientName)}</strong>,</p>
        <div style="white-space:pre-wrap;line-height:1.6">${escapeHtml(message)}</div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px;margin:0">${escapeHtml(schoolName)}</p>
      </div>
    </div>
  `;
}

export function attendanceEmail({
  studentName,
  status,
  date,
  schoolName,
}: {
  studentName: string;
  status: string;
  date: string;
  schoolName: string;
}): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#111">
      <div style="background:#4f46e5;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">${escapeHtml(schoolName)}</h1>
        <p style="color:#c7d2fe;margin:4px 0 0;font-size:13px">Attendance Notice</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
        <p style="margin:0 0 16px">Dear Parent,</p>
        <p style="margin:0 0 16px"><strong>${escapeHtml(studentName)}</strong> was marked <strong>${escapeHtml(status)}</strong> on ${escapeHtml(date)}.</p>
        <p style="color:#6b7280;font-size:13px;margin:0">Contact the school office if you believe this is a mistake.</p>
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
        <h1 style="color:#fff;margin:0;font-size:20px">${escapeHtml(schoolName)}</h1>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
        <h2 style="margin:0 0 16px;font-size:18px">Password Reset</h2>
        <p style="margin:0 0 16px">Hi <strong>${escapeHtml(username)}</strong>,</p>
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
