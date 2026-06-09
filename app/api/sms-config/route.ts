import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const configs = await ((await getDb()) as any).smsConfig.findMany({ orderBy: { provider: "asc" } });
  return NextResponse.json(configs);
}

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, senderId, username, password, isActive } = await req.json();
    const data: any = {};
    if (provider !== undefined) data.provider = provider || null;
    if (apiKey   !== undefined) data.apiKey   = apiKey   || "";
    if (senderId !== undefined) data.senderId = senderId || "";
    if (username !== undefined) data.username = username || "";
    if (password !== undefined) data.password = password || "";
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    const existing = await ((await getDb()) as any).smsConfig.findUnique({ where: { provider } });
    const config = existing
      ? await ((await getDb()) as any).smsConfig.update({ where: { provider }, data })
      : await ((await getDb()) as any).smsConfig.create({ data });
    return NextResponse.json(config);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
