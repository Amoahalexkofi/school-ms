import { NextRequest, NextResponse } from "next/server";
import { sendBulkMessage, listMessageLogs } from "@/lib/services/messaging";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  return NextResponse.json(await listMessageLogs());
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const { subject, message, channel, recipientType } = await req.json();
    const staff = session?.user?.id
      ? await ((await getDb()) as any).staff.findUnique({ where: { userId: session.user.id } })
      : null;
    const log = await sendBulkMessage({ subject, message, channel, recipientType, sentById: staff?.id });
    return NextResponse.json(log, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
