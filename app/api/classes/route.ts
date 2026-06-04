import { NextRequest, NextResponse } from "next/server";
import { createClass, listClasses } from "@/lib/services/settings";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId") ?? undefined;
  return NextResponse.json(await listClasses(sessionId));
}

export async function POST(req: NextRequest) {
  try {
    const { name, sessionId } = await req.json();
    const cls = await createClass({ name, sessionId });
    return NextResponse.json(cls, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
