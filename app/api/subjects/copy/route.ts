import { NextRequest, NextResponse } from "next/server";
import { copySubjectsToClasses } from "@/lib/services/settings";

export async function POST(req: NextRequest) {
  try {
    const { sourceClassId, targetClassIds, subjectIds } = await req.json();
    const result = await copySubjectsToClasses({ sourceClassId, targetClassIds, subjectIds });
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to copy subjects" }, { status: 500 });
  }
}
