import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Notification_model — send_notification table
// Admin-broadcast notifications with role-based visibility

export async function GET() {
  const db = await getDb();
  const notifications = await (db as any).sendNotification.findMany({
    where: { isActive: true },
    include: { notificationRoles: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
  try {
    const {
      title, message, publishDate, date, attachment,
      visibleStudent, visibleStaff, visibleParent,
      createdById, roleIds,
    } = await req.json();

    if (!title?.trim() || !message?.trim())
      return NextResponse.json({ error: "title and message are required" }, { status: 422 });

    const db = await getDb();
    const notif = await (db as any).$transaction(async (tx: any) => {
      const n = await tx.sendNotification.create({
        data: {
          title:          title.trim(),
          message:        message.trim(),
          publishDate:    publishDate ? new Date(publishDate) : new Date(),
          date:           date        ? new Date(date)        : new Date(),
          attachment:     attachment  || null,
          visibleStudent: Boolean(visibleStudent),
          visibleStaff:   Boolean(visibleStaff),
          visibleParent:  Boolean(visibleParent),
          createdById:    createdById || null,
        },
      });

      if (Array.isArray(roleIds) && roleIds.length > 0) {
        await tx.notificationRole.createMany({
          data: roleIds.map((roleId: string) => ({
            sendNotificationId: n.id,
            roleId,
          })),
        });
      }

      return n;
    });
    return NextResponse.json(notif, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
