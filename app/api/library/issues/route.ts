import { NextRequest, NextResponse } from "next/server";
import { issueBook, listIssues } from "@/lib/services/library";

export async function GET() {
  return NextResponse.json(await listIssues());
}

export async function POST(req: NextRequest) {
  try {
    const { bookId, dueDate, studentId, staffId } = await req.json();
    const result = await issueBook({ bookId, dueDate: new Date(dueDate), studentId, staffId });
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    if (err.code === "NOT_FOUND") return NextResponse.json({ error: err.message }, { status: 404 });
    if (err.code === "CONFLICT") return NextResponse.json({ error: err.message }, { status: 409 });
    return NextResponse.json({ error: "Failed to issue book" }, { status: 500 });
  }
}
