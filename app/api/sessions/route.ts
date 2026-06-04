import { NextRequest, NextResponse } from "next/server";
import { createSession, listSessions, setActiveSession } from "@/lib/services/settings";

export async function GET() {
  return NextResponse.json(await listSessions());
}

export async function POST(req: NextRequest) {
  try {
    const { name, startDate, endDate, setActive } = await req.json();
    const session = await createSession({ name, startDate: new Date(startDate), endDate: new Date(endDate) });
    if (setActive) await setActiveSession(session.id);
    return NextResponse.json(session, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
