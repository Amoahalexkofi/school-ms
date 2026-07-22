import { NextRequest, NextResponse } from "next/server";
import { registry } from "@/lib/registry";
import { getDbForSchema } from "@/lib/db";
import { sendSms, feeReminderSms } from "@/lib/services/sms";
import { sendWhatsApp, whatsAppFeeReminder } from "@/lib/services/whatsapp";

export const maxDuration = 60;

// Fee reminder cron (mirrors Smart School Feereminder). For every active school,
// for each active FeeReminder (before/after N days), finds fees due on the target
// date with an outstanding balance and sends an SMS + WhatsApp reminder to the
// guardian. SMS/WhatsApp no-op gracefully if the school hasn't configured a
// provider. Secured by CRON_SECRET. Schedule daily in vercel.json.

function ymd(d: Date) { return d.toISOString().slice(0, 10); }

function sumPaid(deposits: any[]): number {
  let total = 0;
  for (const dep of deposits) {
    const detail = (dep.amountDetail ?? {}) as Record<string, any>;
    for (const e of Object.values(detail)) total += Number((e as any)?.amount ?? 0);
  }
  return total;
}

async function processSchema(schema: string): Promise<number> {
  const db = getDbForSchema(schema) as any;
  const reminders = await db.feeReminder.findMany({ where: { isActive: true } }).catch(() => []);
  if (!reminders.length) return 0;

  const profile = await db.schoolProfile.findFirst({ select: { name: true, currency: true } }).catch(() => null);
  const schoolName = profile?.name ?? "School";
  const currency = profile?.currency ?? "";

  const today = new Date();
  let sent = 0;

  for (const r of reminders) {
    const target = new Date(today);
    target.setUTCDate(target.getUTCDate() + (r.reminderType === "before" ? r.day : -r.day));
    const dayStart = new Date(`${ymd(target)}T00:00:00.000Z`);
    const dayEnd = new Date(`${ymd(target)}T23:59:59.999Z`);

    // Fee items due on the target date → their fee session groups
    const items = await db.feeGroupItem
      .findMany({ where: { dueDate: { gte: dayStart, lte: dayEnd } }, select: { feeSessionGroupId: true } })
      .catch(() => []);
    const groupIds = [...new Set(items.map((i: any) => i.feeSessionGroupId).filter(Boolean))];
    if (!groupIds.length) continue;

    const masters = await db.studentFeesMaster
      .findMany({
        where: { feeSessionGroupId: { in: groupIds }, isActive: true },
        include: {
          deposits: { select: { amountDetail: true } },
          studentSession: {
            select: {
              student: { select: { firstName: true, lastName: true, mobileNo: true, guardianPhone: true, fatherPhone: true } },
            },
          },
        },
      })
      .catch(() => []);

    for (const m of masters) {
      const balance = Number(m.amount ?? 0) - sumPaid(m.deposits ?? []);
      if (balance <= 0) continue;
      const student = m.studentSession?.student;
      if (!student) continue;
      const phones = [student.mobileNo, student.guardianPhone, student.fatherPhone].filter(Boolean) as string[];
      if (!phones.length) continue;

      const params = {
        studentName: `${student.firstName} ${student.lastName}`,
        dueAmount: balance.toFixed(2),
        currency,
        dueDate: ymd(target),
        schoolName,
      };
      const [smsResult, waResult] = await Promise.all([
        sendSms(phones, feeReminderSms(params), db).catch((err) => ({ success: false, provider: "sms", error: String(err) })),
        sendWhatsApp(phones, whatsAppFeeReminder(params), db).catch((err) => ({ success: false, provider: "whatsapp", error: String(err) })),
      ]);
      if (!smsResult.success) console.error("[fee-reminders]", schema, "SMS failed for", params.studentName, smsResult.error);
      if (!waResult.success) console.error("[fee-reminders]", schema, "WhatsApp failed for", params.studentName, waResult.error);
      if (smsResult.success || waResult.success) sent++;
    }
  }
  return sent;
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Every active school + the public demo schema
  const tenants = await registry.schoolTenant
    .findMany({ where: { status: { not: "suspended" } }, select: { schemaName: true } })
    .catch(() => []);
  const schemas = [...new Set(["public", ...tenants.map((t: any) => t.schemaName)])];

  const results: Record<string, number> = {};
  for (const schema of schemas) {
    try {
      results[schema] = await processSchema(schema);
    } catch {
      results[schema] = -1; // error marker; keep going
    }
  }

  const totalSent = Object.values(results).reduce((s, n) => s + (n > 0 ? n : 0), 0);
  return NextResponse.json({ ok: true, totalSent, results });
}
