import { NextRequest, NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/services/whatsapp";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 422 });

  const result = await sendWhatsApp(phone, "✅ Test WhatsApp from Skula School Management System. Your WhatsApp gateway is configured correctly.");
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
