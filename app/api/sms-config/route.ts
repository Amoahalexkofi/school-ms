import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const configs = await (prisma as any).smsConfig.findMany({ orderBy: { provider: "asc" } });
  return NextResponse.json(configs);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const existing = await (prisma as any).smsConfig.findUnique({ where: { provider: body.provider } });
    const config = existing
      ? await (prisma as any).smsConfig.update({ where: { provider: body.provider }, data: body })
      : await (prisma as any).smsConfig.create({ data: body });
    return NextResponse.json(config);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
