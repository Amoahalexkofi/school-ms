import { getDb } from "@/lib/db";

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
