import { NextResponse } from "next/server";
import { createStudent } from "@/lib/services/students";

const REQUIRED_FIELDS = ["firstName", "lastName", "email", "dateOfBirth", "gender", "sessionYear"] as const;

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  try {
    const student = await createStudent({
      firstName: body.firstName as string,
      lastName: body.lastName as string,
      email: body.email as string,
      dateOfBirth: new Date(body.dateOfBirth as string),
      gender: body.gender as string,
      sessionYear: Number(body.sessionYear),
    });

    return NextResponse.json(student, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";

    if (message === "email already registered") {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    if (
      message.includes("years old") ||
      message.includes("older than") ||
      message.includes("future")
    ) {
      return NextResponse.json({ error: message }, { status: 422 });
    }
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
