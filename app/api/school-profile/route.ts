import { NextRequest, NextResponse } from "next/server";
import { getSchoolProfile, upsertSchoolProfile } from "@/lib/services/school-profile";

export async function GET() {
  const profile = await getSchoolProfile();
  return NextResponse.json(profile ?? {});
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profile = await upsertSchoolProfile(body);
    return NextResponse.json(profile);
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
