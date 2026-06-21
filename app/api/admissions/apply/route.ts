import { NextRequest, NextResponse } from "next/server";
import { submitApplication } from "@/lib/services/admissions";

// PUBLIC endpoint — unauthenticated prospective parents submit an admission
// application from /apply. Only POST is exposed here; listing/reviewing
// applications stays on the admin-gated /api/admissions route.
export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, dateOfBirth, gender, classAppliedFor, parentName, parentPhone, parentEmail, address, notes } = await req.json();
    const app = await submitApplication({
      firstName, lastName,
      dateOfBirth: new Date(dateOfBirth),
      gender, classAppliedFor, parentName, parentPhone,
      parentEmail: parentEmail || undefined,
      address:     address     || undefined,
      notes:       notes       || undefined,
    });
    return NextResponse.json({ ok: true, id: app.id }, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
