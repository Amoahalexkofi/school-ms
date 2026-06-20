import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

export const NOVALSS_COOKIE = "novalss_admin_key";

/**
 * Platform-admin (Novalss) authorization. The admin authenticates with a single
 * key stored in the `novalss_admin_key` cookie. Fails CLOSED — if NOVALSS_ADMIN_KEY
 * is unset, no one is authorized (no insecure default). Constant-time compare.
 */
export function isNovalssAdmin(req: NextRequest): boolean {
  const expected = process.env.NOVALSS_ADMIN_KEY;
  if (!expected) return false; // fail closed
  const provided = req.cookies.get(NOVALSS_COOKIE)?.value;
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Returns a 401 response if the caller is not the Novalss admin, else null. */
export function requireNovalssAdmin(req: NextRequest): NextResponse | null {
  if (!isNovalssAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
