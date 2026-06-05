import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await (prisma as any).notificationSetting.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // array of { type, label, emailEnabled, smsEnabled, pushEnabled }
    const results = [];
    for (const item of body) {
      const existing = await (prisma as any).notificationSetting.findUnique({ where: { type: item.type } });
      const r = existing
        ? await (prisma as any).notificationSetting.update({ where: { type: item.type }, data: item })
        : await (prisma as any).notificationSetting.create({ data: item });
      results.push(r);
    }
    return NextResponse.json(results);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
