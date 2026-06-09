import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const config = await ((await getDb()) as any).emailConfig.findFirst();
  return NextResponse.json(config ?? {});
}

export async function POST(req: NextRequest) {
  try {
    const { smtpHost, smtpPort, smtpUsername, smtpPassword, smtpSecure, fromEmail, fromName, isActive } = await req.json();
    const data: any = {};
    if (smtpHost     !== undefined) data.smtpHost     = smtpHost     || "";
    if (smtpPort     !== undefined) data.smtpPort     = parseInt(smtpPort) || 587;
    if (smtpUsername !== undefined) data.smtpUsername = smtpUsername || "";
    if (smtpPassword !== undefined) data.smtpPassword = smtpPassword || "";
    if (smtpSecure   !== undefined) data.smtpSecure   = smtpSecure   || "tls";
    if (fromEmail    !== undefined) data.fromEmail    = fromEmail    || "";
    if (fromName     !== undefined) data.fromName     = fromName     || "";
    if (isActive     !== undefined) data.isActive     = Boolean(isActive);
    const existing = await ((await getDb()) as any).emailConfig.findFirst();
    const config = existing
      ? await ((await getDb()) as any).emailConfig.update({ where: { id: existing.id }, data })
      : await ((await getDb()) as any).emailConfig.create({ data });
    return NextResponse.json(config);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save email config" }, { status: 500 });
  }
}
