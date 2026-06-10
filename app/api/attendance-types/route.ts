import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Attendencetype_model: read-only list for dropdowns
export async function GET() {
  const types = await ((await getDb()) as any).attendanceType.findMany({
    where: { isActive: true },
    orderBy: { type: "asc" },
  });
  return NextResponse.json(types);
}
