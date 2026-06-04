import { NextRequest, NextResponse } from "next/server";
import { logVisitor, listVisitors } from "@/lib/services/front-office";

export async function GET() {
  return NextResponse.json(await listVisitors());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const visitor = await logVisitor(body);
    return NextResponse.json(visitor, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to log visitor" }, { status: 500 });
  }
}
