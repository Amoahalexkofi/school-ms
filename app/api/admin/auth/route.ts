import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { NOVALSS_COOKIE } from "@/lib/auth/novalss";

// Platform-admin login: single admin key (NOVALSS_ADMIN_KEY). Fails closed —
// no key configured means no one gets in. Constant-time compare.
export async function POST(req: NextRequest) {
  const { key } = await req.json();

  const expected = process.env.NOVALSS_ADMIN_KEY;
  if (!expected || typeof key !== "string") {
    return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  }
  const a = Buffer.from(key);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(NOVALSS_COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
  return res;
}
