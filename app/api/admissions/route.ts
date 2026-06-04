import { NextRequest, NextResponse } from "next/server";
import { submitApplication, listApplications, reviewApplication } from "@/lib/services/admissions";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") ?? undefined;
    const data = await listApplications(status);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const app = await submitApplication({
      ...body,
      dateOfBirth: new Date(body.dateOfBirth),
    });
    return NextResponse.json(app, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, reviewNote } = body;
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });
    const updated = await reviewApplication(id, status, reviewNote);
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.code === "NOT_FOUND") return NextResponse.json({ error: err.message }, { status: 404 });
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
