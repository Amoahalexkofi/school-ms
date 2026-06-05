import { NextRequest, NextResponse } from "next/server";

const ADMIN_KEY = process.env.NOVALSS_ADMIN_KEY ?? "change-me-in-production";

export async function POST(req: NextRequest) {
  const { key } = await req.json();

  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  // Set a secure, httpOnly cookie valid for 8 hours
  res.cookies.set("novalss_admin_key", ADMIN_KEY, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  return res;
}
