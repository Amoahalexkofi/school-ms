import { NextRequest, NextResponse } from "next/server";
import { createSubject, listSubjects } from "@/lib/services/settings";

export async function GET(req: NextRequest) {
  const classId   = req.nextUrl.searchParams.get("classId")   ?? undefined;
  const sessionId = req.nextUrl.searchParams.get("sessionId") ?? undefined;
  return NextResponse.json(await listSubjects(classId, sessionId));
}

export async function POST(req: NextRequest) {
  try {
    const { name, code, classId } = await req.json();
    const subject = await createSubject({ name, code, classId });
    return NextResponse.json(subject, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}
