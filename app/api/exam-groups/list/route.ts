import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const groups = await (prisma as any).examGroup.findMany({
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
