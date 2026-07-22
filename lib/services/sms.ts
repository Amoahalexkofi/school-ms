import { getDb } from "@/lib/db";
import { decryptSecrets } from "@/lib/secrets-crypto";

export interface SmsResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

// ── Africa's Talking ──────────────────────────────────────────────────────────

async function sendViaAfricasTalking(
  to: string | string[],
  message: string,
  config: { apiKey: string; username: string; senderId?: string }
): Promise<SmsResult> {
  const recipients = Array.isArray(to) ? to.join(",") : to;
  const body = new URLSearchParams({
    username: config.username,
    to: recipients,
    message,
    ...(config.senderId ? { from: config.senderId } : {}),
  });

  const res = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      apiKey: config.apiKey,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, provider: "africas_talking", error: data?.SMSMessageData?.Message ?? `HTTP ${res.status}` };
  }
  const firstRecipient = data?.SMSMessageData?.Recipients?.[0];
  if (!firstRecipient) {
    return { success: false, provider: "africas_talking", error: data?.SMSMessageData?.Message ?? "No recipient status returned" };
  }
  // Africa's Talking returns HTTP 200 even when a recipient is rejected
  // (bad number, insufficient balance, blacklist, etc.) — the per-recipient
  // status is the only real signal of whether the message actually sent.
  return {
    success: firstRecipient.status === "Success",
    provider: "africas_talking",
    messageId: firstRecipient.messageId,
    error: firstRecipient.status !== "Success" ? firstRecipient.status : undefined,
  };
}

// ── Twilio ────────────────────────────────────────────────────────────────────

async function sendViaTwilio(
  to: string | string[],
  message: string,
  config: { apiKey: string; password: string; senderId: string }
): Promise<SmsResult> {
  const accountSid = config.apiKey;
  const authToken = config.password;
  const recipients = Array.isArray(to) ? to : [to];

  try {
    const responses = await Promise.all(
      recipients.map((phone) =>
        fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ From: config.senderId, To: phone, Body: message }).toString(),
        })
      )
    );
    const failed = responses.find((r) => !r.ok);
    if (failed) {
      const data = await failed.json().catch(() => ({}));
      return { success: false, provider: "twilio", error: data?.message ?? `HTTP ${failed.status}` };
    }
    return { success: true, provider: "twilio" };
  } catch (err: any) {
    return { success: false, provider: "twilio", error: err.message };
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function sendSms(
  to: string | string[],
  message: string,
  dbClient?: any
): Promise<SmsResult> {
  const db = dbClient ?? (await getDb());
  const config = decryptSecrets(
    await (db as any).smsConfig.findFirst({ where: { isActive: true } }),
    ["apiKey", "password"]
  );

  if (!config) {
    return { success: false, provider: "none", error: "No active SMS gateway configured" };
  }

  // Normalise numbers — strip spaces, ensure + prefix for international
  const normalise = (n: string) => {
    const clean = n.replace(/\s+/g, "");
    return clean.startsWith("+") ? clean : `+${clean}`;
  };
  const numbers = (Array.isArray(to) ? to : [to]).map(normalise).filter(Boolean);
  if (!numbers.length) return { success: false, provider: config.provider, error: "No valid recipients" };

  switch (config.provider) {
    case "africas_talking":
      return sendViaAfricasTalking(numbers, message, {
        apiKey: config.apiKey,
        username: config.username || "sandbox",
        senderId: config.senderId,
      });
    case "twilio":
      return sendViaTwilio(numbers, message, {
        apiKey: config.apiKey,
        password: config.password,
        senderId: config.senderId,
      });
    default:
      return { success: false, provider: config.provider, error: `Provider "${config.provider}" not supported yet` };
  }
}

// ── Template helpers (mirrors Smart School Mailsmsconf) ───────────────────────

export function feeReceiptSms(params: {
  studentName: string;
  amount: string | number;
  currency: string;
  receiptNo: string;
  schoolName: string;
}): string {
  return `Dear ${params.studentName}, payment of ${params.currency}${params.amount} received. Receipt: ${params.receiptNo}. Thank you — ${params.schoolName}`;
}

export function attendanceSms(params: {
  studentName: string;
  status: string;
  date: string;
  schoolName: string;
}): string {
  return `Dear Parent, ${params.studentName} was marked ${params.status} on ${params.date}. — ${params.schoolName}`;
}

export function feeReminderSms(params: {
  studentName: string;
  dueAmount: string | number;
  currency: string;
  dueDate: string;
  schoolName: string;
}): string {
  return `Dear Parent, ${params.studentName} has an outstanding fee of ${params.currency}${params.dueAmount} due by ${params.dueDate}. Please settle promptly. — ${params.schoolName}`;
}
