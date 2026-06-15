import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const configs = await (db as any).whatsAppConfig.findMany({ orderBy: { provider: "asc" } });
  return NextResponse.json(configs);
}

export async function POST(req: NextRequest) {
  const db   = await getDb();
  const body = await req.json();
  const { provider, apiKey, password, senderId, endpoint, isActive } = body;

  if (!provider) return NextResponse.json({ error: "provider required" }, { status: 422 });

  // If activating this provider, deactivate all others first
  if (isActive) {
    await (db as any).whatsAppConfig.updateMany({ data: { isActive: false } });
  }

  const data = { apiKey: apiKey ?? "", password: password ?? "", senderId: senderId ?? "", endpoint: endpoint ?? "", isActive: Boolean(isActive) };

  const existing = await (db as any).whatsAppConfig.findUnique({ where: { provider } });
  const config = existing
    ? await (db as any).whatsAppConfig.update({ where: { provider }, data })
    : await (db as any).whatsAppConfig.create({ data: { provider, ...data } });

  return NextResponse.json(config);
}

export async function DELETE(req: NextRequest) {
  const db  = await getDb();
  const { provider } = await req.json();
  await (db as any).whatsAppConfig.delete({ where: { provider } });
  return NextResponse.json({ ok: true });
}
