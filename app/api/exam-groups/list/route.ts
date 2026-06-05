import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const groups = await ((await getDb()) as any).examGroup.findMany({
    where: { sessionId: "session-2026" },
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
