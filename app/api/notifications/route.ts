import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/lib/services/notifications";

// Notifications are always scoped to the authenticated user — never trust a
// client-supplied userId (that was an IDOR: any user could read another's feed).
export async function GET(request: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");

  try {
    const [notifications, unreadCount] = await Promise.all([
      getUserNotifications(userId, { page, pageSize }),
      getUnreadCount(userId),
    ]);
    return NextResponse.json({ notifications, unreadCount }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (body.markAll) {
    try {
      const result = await markAllAsRead(userId);
      return NextResponse.json(result, { status: 200 });
    } catch {
      return NextResponse.json({ error: "internal server error" }, { status: 500 });
    }
  }

  if (body.id) {
    try {
      const result = await markAsRead(body.id as string);
      return NextResponse.json(result, { status: 200 });
    } catch {
      return NextResponse.json({ error: "internal server error" }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "provide id to mark one, or markAll to mark all" },
    { status: 400 }
  );
}
