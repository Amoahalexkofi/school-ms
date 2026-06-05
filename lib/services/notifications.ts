import { getDb } from "@/lib/db";

export type NotificationType =
  | "FEE_DUE"
  | "RESULT_PUBLISHED"
  | "HOMEWORK_ASSIGNED"
  | "EXAM_SCHEDULED"
  | "ABSENCE_MARKED"
  | "GENERAL";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export async function createNotification(input: CreateNotificationInput) {
  if (!input.userId) throw new Error("userId is required");
  if (!input.title) throw new Error("title is required");

  const prisma = await getDb();
  return (prisma as any).notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      isRead: false,
    },
  });
}

export async function markAsRead(notificationId: string) {
  const prisma = await getDb();
  return (prisma as any).notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  const prisma = await getDb();
  return (prisma as any).notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  const prisma = await getDb();
  return (prisma as any).notification.count({
    where: { userId, isRead: false },
  });
}

export async function getUserNotifications(
  userId: string,
  { page = 1, pageSize = 20 }: PaginationOptions = {}
) {
  const prisma = await getDb();
  return (prisma as any).notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: pageSize,
    skip: (page - 1) * pageSize,
  });
}
