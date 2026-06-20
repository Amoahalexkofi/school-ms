import { NextRequest, NextResponse } from "next/server";
import { listBranches, createBranch } from "@/lib/services/branches";

export async function GET() {
  try {
    const branches = await listBranches();
    return NextResponse.json(branches);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to load branches" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const branch = await createBranch(body);
    return NextResponse.json(branch, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to create branch" }, { status: 422 });
  }
}
