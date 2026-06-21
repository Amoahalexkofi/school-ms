import { NextRequest, NextResponse } from "next/server";
import { createSection } from "@/lib/services/settings";

export async function POST(req: NextRequest) {
  try {
    const { name, classId } = await req.json();
    const section = await createSection({ name, classId });
    return NextResponse.json(section, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    if (err.code === "P2002") return NextResponse.json({ error: "A section with this name already exists" }, { status: 422 });
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
