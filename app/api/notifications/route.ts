import { NextResponse } from "next/server";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/lib/services/notifications";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

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
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (body.markAll) {
    if (!body.userId) {
      return NextResponse.json({ error: "userId is required when markAll is true" }, { status: 400 });
    }
    try {
      const result = await markAllAsRead(body.userId as string);
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
    { error: "provide id to mark one, or markAll + userId to mark all" },
    { status: 400 }
  );
}
