import { NextRequest, NextResponse } from "next/server";
import { BRANCH_COOKIE } from "@/lib/branch";

// Sets the admin's active branch (stored in a cookie). "all" clears the filter.
export async function POST(req: NextRequest) {
  try {
    const { branchId } = await req.json();
    const value = branchId && typeof branchId === "string" ? branchId : "all";
    const res = NextResponse.json({ ok: true, branchId: value });
    res.cookies.set(BRANCH_COOKIE, value, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to set branch" }, { status: 422 });
  }
}
