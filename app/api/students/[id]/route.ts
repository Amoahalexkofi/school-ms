import { NextResponse } from "next/server";
import {
  getStudentById,
  updateStudent,
  deleteStudent,
} from "@/lib/services/students";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    const student = await getStudentById(id);
    if (!student) return NextResponse.json({ error: "student not found" }, { status: 404 });
    return NextResponse.json(student, { status: 200 });
  } catch {
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  try {
    const student = await updateStudent(id, {
      firstName: body.firstName as string | undefined,
      lastName: body.lastName as string | undefined,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth as string) : undefined,
      gender: body.gender as string | undefined,
    });
    return NextResponse.json(student, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (message.includes("not found")) return NextResponse.json({ error: message }, { status: 404 });
    if (message.includes("years old") || message.includes("older than") || message.includes("future")) {
      return NextResponse.json({ error: message }, { status: 422 });
    }
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    await deleteStudent(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (message.includes("not found")) return NextResponse.json({ error: message }, { status: 404 });
    if (message.includes("active enrollments")) return NextResponse.json({ error: message }, { status: 409 });
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
