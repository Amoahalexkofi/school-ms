import { NextRequest, NextResponse } from "next/server";
import { sendSms } from "@/lib/services/sms";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone?.trim()) return NextResponse.json({ error: "phone is required" }, { status: 422 });
    const result = await sendSms(phone.trim(), "Test SMS from Skula School Management System. Your SMS gateway is configured correctly.");
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 502 });
    return NextResponse.json({ ok: true, provider: result.provider, messageId: result.messageId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
