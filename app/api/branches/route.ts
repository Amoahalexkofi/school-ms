import { NextRequest, NextResponse } from "next/server";
import { listBranches, createBranch } from "@/lib/services/branches";
import { isAddonEnabled } from "@/lib/addons";

export async function GET() {
  try {
    if (!(await isAddonEnabled("multi_branch"))) return NextResponse.json([]);
    const branches = await listBranches();
    return NextResponse.json(branches);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to load branches" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAddonEnabled("multi_branch"))) return NextResponse.json({ error: "Multi Branch is not enabled for this school" }, { status: 403 });
    const body = await req.json();
    const branch = await createBranch(body);
    return NextResponse.json(branch, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to create branch" }, { status: 422 });
  }
}
