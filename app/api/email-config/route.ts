import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const config = await (prisma as any).emailConfig.findFirst();
  return NextResponse.json(config ?? {});
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const existing = await (prisma as any).emailConfig.findFirst();
    const config = existing
      ? await (prisma as any).emailConfig.update({ where: { id: existing.id }, data: body })
      : await (prisma as any).emailConfig.create({ data: body });
    return NextResponse.json(config);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save email config" }, { status: 500 });
  }
}
