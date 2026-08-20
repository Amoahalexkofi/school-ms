import { NextRequest, NextResponse } from "next/server";
import { sendSms } from "@/lib/services/sms";
import { auth } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (isRateLimited(`sms-test:${session.user.id}`, 5, 5 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many test messages — wait a few minutes and try again" }, { status: 429 });
    }

    const { phone } = await req.json();
    if (!phone?.trim()) return NextResponse.json({ error: "phone is required" }, { status: 422 });
    const result = await sendSms(phone.trim(), "Test SMS from Skula School Management System. Your SMS gateway is configured correctly.");
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 502 });
    return NextResponse.json({ ok: true, provider: result.provider, messageId: result.messageId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
