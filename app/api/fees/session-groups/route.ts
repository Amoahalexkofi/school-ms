import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { feeGroupId, sessionId } = await req.json();
    if (!feeGroupId || !sessionId) return NextResponse.json({ error: "feeGroupId and sessionId required" }, { status: 422 });
    const sg = await (prisma as any).feeSessionGroup.create({
      data: { feeGroupId, sessionId },
      include: { session: true, items: true },
    });
    return NextResponse.json(sg, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Already linked to this session" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
