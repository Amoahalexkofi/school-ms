import { getDb } from "@/lib/db";

export type NotificationChannel = "email" | "sms" | "push";

const FIELD: Record<NotificationChannel, "emailEnabled" | "smsEnabled" | "pushEnabled"> = {
  email: "emailEnabled",
  sms: "smsEnabled",
  push: "pushEnabled",
};

/**
 * Whether a given event type is allowed to send on a channel, per
 * Settings → Notification Settings. No saved row yet defaults to enabled —
 * every one of these sends unconditionally already, and the settings page
 * itself only ever gets a row once an admin visits and saves, so "missing
 * row" must mean "unconfigured, keep working" rather than "off". WhatsApp
 * sends piggyback on the "sms" toggle — there's no separate WhatsApp column
 * in the schema, and it's the closest conceptual match (text to a phone).
 */
export async function isChannelEnabled(
  db: any,
  type: string,
  channel: NotificationChannel
): Promise<boolean> {
  const setting = await db.notificationSetting.findUnique({ where: { type } }).catch(() => null);
  if (!setting) return true;
  return setting[FIELD[channel]] === true;
}
