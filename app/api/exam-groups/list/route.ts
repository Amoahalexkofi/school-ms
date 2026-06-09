import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sessionId = searchParams.get("sessionId");

  const groups = await ((await getDb()) as any).examGroup.findMany({
    where: sessionId ? { sessionId } : {},
    include: {
      schedules: {
        include: {
          subject: { select: { name: true, code: true } },
        },
        orderBy: { date: "asc" },
      },
    },
    orderBy: { startDate: "asc" },
  });
  return NextResponse.json(groups);
}
