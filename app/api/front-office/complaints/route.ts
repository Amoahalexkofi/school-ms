import { NextRequest, NextResponse } from "next/server";
import { createComplaint, listComplaints, updateComplaintStatus } from "@/lib/services/front-office";

export async function GET() {
  return NextResponse.json(await listComplaints());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === "updateStatus") {
      const updated = await updateComplaintStatus(body.id, body.status, body.resolution);
      return NextResponse.json(updated);
    }
    const complaint = await createComplaint(body);
    return NextResponse.json(complaint, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
