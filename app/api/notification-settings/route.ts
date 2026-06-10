import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const settings = await ((await getDb()) as any).notificationSetting.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // array of { type, label, emailEnabled, smsEnabled, pushEnabled }
    const results = [];
    for (const item of body) {
      const { type, label, emailEnabled, smsEnabled, pushEnabled } = item;
      const data = {
        type,
        label:        label        ?? undefined,
        emailEnabled: emailEnabled !== undefined ? Boolean(emailEnabled) : undefined,
        smsEnabled:   smsEnabled   !== undefined ? Boolean(smsEnabled)   : undefined,
        pushEnabled:  pushEnabled  !== undefined ? Boolean(pushEnabled)  : undefined,
      };
      const existing = await ((await getDb()) as any).notificationSetting.findUnique({ where: { type } });
      const r = existing
        ? await ((await getDb()) as any).notificationSetting.update({ where: { type }, data })
        : await ((await getDb()) as any).notificationSetting.create({ data });
      results.push(r);
    }
    return NextResponse.json(results);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
