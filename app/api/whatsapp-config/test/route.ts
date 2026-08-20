import { NextRequest, NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/services/whatsapp";
import { auth } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isRateLimited(`whatsapp-test:${session.user.id}`, 5, 5 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many test messages — wait a few minutes and try again" }, { status: 429 });
  }

  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 422 });

  const result = await sendWhatsApp(phone, "✅ Test WhatsApp from Skula School Management System. Your WhatsApp gateway is configured correctly.");
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
