import { sendEmail } from "@/lib/email";
import { sendWhatsApp, sendWhatsAppTemplate } from "@/lib/services/whatsapp";

export interface Credential {
  label: string;        // "Student" | "Parent"
  name: string;
  username: string;
  email: string;
  tempPassword: string | null; // null = account already existed (no new password)
}

export interface NotifyInput {
  schoolName: string;
  loginUrl: string;     // e.g. https://<school>.getskula.com/sign-in
  parentEmail?: string | null;
  parentPhone?: string | null;
  parentExisting: boolean;
  credentials: Credential[]; // student (+ parent when newly created)
}

export interface NotifyResult {
  email: { ok: boolean; error?: string; skipped?: boolean };
  whatsapp: { ok: boolean; error?: string; skipped?: boolean; via?: "template" | "freeform" };
}

function credRowsHtml(creds: Credential[]) {
  return creds
    .map(
      (c) => `
      <div style="border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;margin:0 0 12px">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:.04em">${c.label} login</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:3px 0;color:#6b7280;width:130px">Name</td><td style="padding:3px 0;font-weight:600">${c.name}</td></tr>
          <tr><td style="padding:3px 0;color:#6b7280">Username / Email</td><td style="padding:3px 0;font-weight:600">${c.email || c.username}</td></tr>
          ${
            c.tempPassword
              ? `<tr><td style="padding:3px 0;color:#6b7280">Temp password</td><td style="padding:3px 0;font-weight:700;font-family:monospace">${c.tempPassword}</td></tr>`
              : `<tr><td style="padding:3px 0;color:#6b7280" colspan="2">Use your existing password.</td></tr>`
          }
        </table>
      </div>`
    )
    .join("");
}

function buildEmailHtml(input: NotifyInput) {
  return `
  <div style="font-family:sans-serif;max-width:540px;margin:0 auto;color:#111">
    <div style="background:#4f46e5;padding:24px 32px;border-radius:12px 12px 0 0">
      <h1 style="color:#fff;margin:0;font-size:20px">${input.schoolName}</h1>
      <p style="color:#c7d2fe;margin:4px 0 0;font-size:13px">Your portal login details</p>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
      <p style="margin:0 0 18px">Hello,</p>
      <p style="margin:0 0 18px">${
        input.parentExisting
          ? "Your child has been added to your existing parent account. Here are the login details:"
          : "Accounts have been created for you and your child. Here are the login details:"
      }</p>
      ${credRowsHtml(input.credentials)}
      <p style="margin:18px 0 22px">
        <a href="${input.loginUrl}" style="background:#4f46e5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
          Sign in
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px;margin:0">
        For your security, you'll be asked to set a new password the first time you sign in.
      </p>
    </div>
  </div>`;
}

function buildWhatsAppText(input: NotifyInput) {
  const blocks = input.credentials
    .map((c) => {
      const pw = c.tempPassword ? `\n🔑 Temp password: ${c.tempPassword}` : `\n🔑 Use your existing password.`;
      return `*${c.label}*\n👤 ${c.name}\n📧 ${c.email || c.username}${pw}`;
    })
    .join("\n\n");
  return `*${input.schoolName} — Portal Login*\n\n${
    input.parentExisting
      ? "Your child has been added to your parent account."
      : "Accounts have been created for you and your child."
  }\n\n${blocks}\n\n🔗 Sign in: ${input.loginUrl}\n\nYou'll be asked to set a new password on first login.`;
}

/**
 * Best-effort delivery of login credentials to a parent via email + WhatsApp.
 * Never throws; each channel reports its own outcome so the caller can show a
 * fallback (the passwords are also returned to the admin UI).
 */
export async function notifyParentCredentials(db: any, input: NotifyInput): Promise<NotifyResult> {
  const result: NotifyResult = {
    email: { ok: false, skipped: true },
    whatsapp: { ok: false, skipped: true },
  };

  if (input.parentEmail) {
    try {
      const r = await sendEmail(db, {
        to: input.parentEmail,
        subject: `${input.schoolName} — Your portal login details`,
        html: buildEmailHtml(input),
      });
      result.email = { ok: r.ok, error: r.error };
    } catch (e: any) {
      result.email = { ok: false, error: e.message };
    }
  }

  if (input.parentPhone) {
    try {
      // A cold, business-initiated WhatsApp requires a pre-approved template.
      // When one is configured we send a short branded heads-up (the actual
      // credentials go by email — a template body can't hold 4 login fields) and
      // point the parent to sign in. Without a configured template we fall back
      // to freeform text, which only delivers inside a 24h session / sandbox.
      const templateName = process.env.PARENT_WA_TEMPLATE_NAME;
      const r = templateName
        ? await sendWhatsAppTemplate(
            input.parentPhone,
            {
              name: templateName,
              language: process.env.PARENT_WA_TEMPLATE_LANG ?? "en_US",
              // {{1}} school name, {{2}} whether creds went to email
              bodyParams: [input.schoolName, input.parentEmail ? "your email" : "the school office"],
              buttonUrlParam: input.loginUrl,
            },
            db
          )
        : await sendWhatsApp(input.parentPhone, buildWhatsAppText(input), db);
      result.whatsapp = { ok: r.success, error: r.error, via: templateName ? "template" : "freeform" };
    } catch (e: any) {
      result.whatsapp = { ok: false, error: e.message };
    }
  }

  return result;
}
