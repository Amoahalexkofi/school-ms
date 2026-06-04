import { NextRequest, NextResponse } from "next/server";
import { createEnquiry, listEnquiries, updateEnquiryStatus } from "@/lib/services/front-office";

export async function GET() {
  return NextResponse.json(await listEnquiries());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === "updateStatus") {
      const updated = await updateEnquiryStatus(body.id, body.status, body.followUpNote);
      return NextResponse.json(updated);
    }
    const enquiry = await createEnquiry(body);
    return NextResponse.json(enquiry, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
