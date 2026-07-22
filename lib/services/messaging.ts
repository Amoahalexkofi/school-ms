import { getDb } from "@/lib/db";
import { sendSms } from "@/lib/services/sms";

export async function listMessageLogs() {
  const prisma = await getDb();
  return (prisma as any).messageLog.findMany({
    include: { sentBy: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function sendBulkMessage(input: {
  subject: string;
  message: string;
  channel: "SMS" | "EMAIL" | "IN_APP";
  recipientType: "ALL_PARENTS" | "ALL_STAFF" | "ALL_STUDENTS" | "ALL";
  sentById?: string;
}) {
  if (!input.subject.trim()) throw Object.assign(new Error("Subject is required"), { code: "VALIDATION" });
  if (!input.message.trim()) throw Object.assign(new Error("Message is required"), { code: "VALIDATION" });

  const prisma = await getDb();

  let recipientCount = 0;
  if (input.recipientType === "ALL_PARENTS") {
    recipientCount = await (prisma as any).user.count({ where: { role: "PARENT" } });
  } else if (input.recipientType === "ALL_STAFF") {
    recipientCount = await (prisma as any).staff.count();
  } else if (input.recipientType === "ALL_STUDENTS") {
    recipientCount = await (prisma as any).student.count();
  } else {
    recipientCount = await (prisma as any).user.count();
  }

  if (input.channel === "IN_APP") {
    const users = await (prisma as any).user.findMany({ select: { id: true } });
    await (prisma as any).notification.createMany({
      data: users.map((u: any) => ({
        userId: u.id,
        type: "GENERAL",
        title: input.subject,
        message: input.message,
      })),
    });
  }

  if (input.channel === "SMS") {
    // Gather phone numbers for the target group
    let phones: string[] = [];
    if (input.recipientType === "ALL_STUDENTS" || input.recipientType === "ALL") {
      const students = await (prisma as any).student.findMany({ select: { phone: true } });
      phones.push(...students.map((s: any) => s.phone).filter(Boolean));
    }
    if (input.recipientType === "ALL_PARENTS" || input.recipientType === "ALL") {
      const parents = await (prisma as any).user.findMany({
        where: { role: "PARENT" },
        select: { phone: true },
      });
      phones.push(...parents.map((p: any) => p.phone).filter(Boolean));
    }
    if (input.recipientType === "ALL_STAFF" || input.recipientType === "ALL") {
      const staff = await (prisma as any).staff.findMany({ select: { phone: true } });
      phones.push(...staff.map((s: any) => s.phone).filter(Boolean));
    }
    // Dedupe and send in batches of 100 (Africa's Talking limit)
    const unique = [...new Set(phones)];
    for (let i = 0; i < unique.length; i += 100) {
      const batch = unique.slice(i, i + 100);
      await sendSms(batch, input.message)
        .then((r) => { if (!r.success) console.error("[messaging] bulk SMS batch failed", i, "-", i + batch.length, r.error); })
        .catch((err) => console.error("[messaging] bulk SMS batch threw", i, "-", i + batch.length, err));
    }
  }

  return (prisma as any).messageLog.create({
    data: {
      subject: input.subject.trim(),
      message: input.message.trim(),
      channel: input.channel,
      recipientType: input.recipientType,
      recipientCount,
      sentById: input.sentById,
    },
  });
}
