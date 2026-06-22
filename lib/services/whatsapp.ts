import { getDb } from "@/lib/db";

export interface WhatsAppResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

// ── Twilio WhatsApp ───────────────────────────────────────────────────────────
// Reuses Twilio REST API — just prefix numbers with "whatsapp:"
// Requires a WhatsApp-enabled Twilio number (Sandbox or approved business number)

async function sendViaTwilioWhatsApp(
  to: string | string[],
  message: string,
  config: { apiKey: string; password: string; senderId: string }
): Promise<WhatsAppResult> {
  const accountSid = config.apiKey;
  const authToken  = config.password;
  const from       = config.senderId.startsWith("whatsapp:") ? config.senderId : `whatsapp:${config.senderId}`;
  const recipients = (Array.isArray(to) ? to : [to]).map(n =>
    n.startsWith("whatsapp:") ? n : `whatsapp:${n}`
  );

  try {
    const responses = await Promise.all(
      recipients.map(phone =>
        fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ From: from, To: phone, Body: message }).toString(),
        })
      )
    );
    const failed = responses.find(r => !r.ok);
    if (failed) {
      const data = await failed.json().catch(() => ({}));
      return { success: false, provider: "twilio_whatsapp", error: data?.message ?? `HTTP ${failed.status}` };
    }
    return { success: true, provider: "twilio_whatsapp" };
  } catch (err: any) {
    return { success: false, provider: "twilio_whatsapp", error: err.message };
  }
}

// ── WATI (WhatsApp Team Inbox) ────────────────────────────────────────────────
// Most popular WhatsApp Business API SaaS for SMBs
// Docs: https://docs.wati.io/reference/send-template-message

async function sendViaWati(
  to: string | string[],
  message: string,
  config: { apiKey: string; endpoint: string }
): Promise<WhatsAppResult> {
  const base     = config.endpoint.replace(/\/$/, "");
  const recipients = (Array.isArray(to) ? to : [to]).map(n => n.replace(/\D/g, ""));

  try {
    const responses = await Promise.all(
      recipients.map(phone =>
        fetch(`${base}/api/v1/sendSessionMessage/${phone}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messageText: message }),
        })
      )
    );
    const failed = responses.find(r => !r.ok);
    if (failed) {
      const data = await failed.json().catch(() => ({}));
      return { success: false, provider: "wati", error: data?.message ?? `HTTP ${failed.status}` };
    }
    return { success: true, provider: "wati" };
  } catch (err: any) {
    return { success: false, provider: "wati", error: err.message };
  }
}

// ── Meta Cloud API ────────────────────────────────────────────────────────────
// Direct from Meta — free tier, requires Facebook Developer app + verified business

async function sendViaMetaCloudApi(
  to: string | string[],
  message: string,
  config: { apiKey: string; senderId: string }
): Promise<WhatsAppResult> {
  const phoneNumberId = config.senderId;
  const recipients    = (Array.isArray(to) ? to : [to]).map(n => n.replace(/\D/g, ""));

  try {
    const responses = await Promise.all(
      recipients.map(phone =>
        fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phone,
            type: "text",
            text: { body: message },
          }),
        })
      )
    );
    const failed = responses.find(r => !r.ok);
    if (failed) {
      const data = await failed.json().catch(() => ({}));
      return { success: false, provider: "meta", error: data?.error?.message ?? `HTTP ${failed.status}` };
    }
    return { success: true, provider: "meta" };
  } catch (err: any) {
    return { success: false, provider: "meta", error: err.message };
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function sendWhatsApp(
  to: string | string[],
  message: string,
  dbClient?: any
): Promise<WhatsAppResult> {
  const db     = dbClient ?? (await getDb());
  const config = await (db as any).whatsAppConfig.findFirst({ where: { isActive: true } });

  if (!config) return { success: false, provider: "none", error: "No active WhatsApp provider configured" };

  const normalise = (n: string) => {
    const clean = n.replace(/\s+/g, "");
    return clean.startsWith("+") ? clean : `+${clean}`;
  };
  const numbers = (Array.isArray(to) ? to : [to]).map(normalise).filter(Boolean);
  if (!numbers.length) return { success: false, provider: config.provider, error: "No valid recipients" };

  switch (config.provider) {
    case "twilio_whatsapp":
      return sendViaTwilioWhatsApp(numbers, message, {
        apiKey:   config.apiKey,
        password: config.password,
        senderId: config.senderId,
      });
    case "wati":
      return sendViaWati(numbers, message, {
        apiKey:   config.apiKey,
        endpoint: config.endpoint,
      });
    case "meta":
      return sendViaMetaCloudApi(numbers, message, {
        apiKey:   config.apiKey,
        senderId: config.senderId,
      });
    default:
      return { success: false, provider: config.provider, error: `Provider "${config.provider}" not supported` };
  }
}

// ── Message templates ─────────────────────────────────────────────────────────

export function whatsAppFeeReceipt(p: {
  studentName: string; amount: string | number; currency: string;
  receiptNo: string; schoolName: string; paymentMode?: string;
}): string {
  return `✅ *Fee Receipt — ${p.schoolName}*\n\nDear Parent,\n\nPayment of *${p.currency}${p.amount}* has been received for *${p.studentName}*.\n\n📄 Receipt No: ${p.receiptNo}\n💳 Mode: ${p.paymentMode ?? "Cash"}\n\nThank you!`;
}

export function whatsAppAttendanceAlert(p: {
  studentName: string; status: string; date: string; schoolName: string;
}): string {
  const emoji = p.status.toLowerCase() === "present" ? "✅" : "⚠️";
  return `${emoji} *Attendance Alert — ${p.schoolName}*\n\nDear Parent,\n\n*${p.studentName}* was marked *${p.status}* on ${p.date}.\n\nFor queries, contact the school office.`;
}

export function whatsAppExamResult(p: {
  studentName: string; examName: string; totalMarks: string | number;
  percentage: string | number; grade: string; schoolName: string;
}): string {
  return `🎓 *Exam Result — ${p.schoolName}*\n\nDear Parent,\n\nResults for *${p.studentName}*:\n\n📝 Exam: ${p.examName}\n📊 Marks: ${p.totalMarks}\n📈 Percentage: ${p.percentage}%\n🏅 Grade: ${p.grade}\n\nWell done!`;
}

export function whatsAppFeeReminder(p: {
  studentName: string; dueAmount: string | number; currency: string;
  dueDate: string; schoolName: string;
}): string {
  return `⏰ *Fee Reminder — ${p.schoolName}*\n\nDear Parent,\n\n*${p.studentName}* has an outstanding fee of *${p.currency}${p.dueAmount}* due by *${p.dueDate}*.\n\nPlease settle at your earliest convenience.\n\nThank you.`;
}
