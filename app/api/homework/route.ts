import { NextResponse } from "next/server";
import { createHomework, listHomework } from "@/lib/services/homework";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get("sectionId");
  if (!sectionId) {
    return NextResponse.json({ error: "sectionId is required" }, { status: 400 });
  }
  const subjectId = searchParams.get("subjectId") ?? undefined;

  try {
    const homework = await listHomework({ sectionId, subjectId });
    return NextResponse.json(homework, { status: 200 });
  } catch {
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}

const REQUIRED = ["title", "subjectId", "sectionId", "assignedById", "dueDate"] as const;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  for (const field of REQUIRED) {
    if (!body[field]) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  try {
    const hw = await createHomework({
      title: body.title as string,
      description: body.description as string | undefined,
      subjectId: body.subjectId as string,
      sectionId: body.sectionId as string,
      assignedById: body.assignedById as string,
      dueDate: new Date(body.dueDate as string),
    });
    return NextResponse.json(hw, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (message.includes("past") || message.includes("required")) {
      return NextResponse.json({ error: message }, { status: 422 });
    }
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
