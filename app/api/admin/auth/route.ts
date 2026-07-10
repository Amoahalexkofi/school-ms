import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { registry } from "@/lib/registry";
import { NOVALSS_COOKIE } from "@/lib/auth/novalss";

// Platform-admin login. Three modes, all setting the same httpOnly admin
// cookie that requireNovalssAdmin verifies:
//   { email, password }              — normal sign-in (PlatformAdmin table)
//   { setup, key, email, password }  — first-run: bootstrap an account with the admin key
//   { key }                          — legacy key sign-in (recovery fallback)
// PlatformAdmin lives ONLY in the public schema → always use the registry client.

function keyMatches(provided: string): boolean {
  const expected = process.env.NOVALSS_ADMIN_KEY;
  if (!expected) return false; // fail closed — no insecure default
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sessionResponse(body: Record<string, unknown> = { ok: true }) {
  const res = NextResponse.json(body);
  res.cookies.set(NOVALSS_COOKIE, process.env.NOVALSS_ADMIN_KEY ?? "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
  return res;
}

// GET — does an admin account exist yet? (drives the first-run setup form)
export async function GET() {
  const count = await (registry as any).platformAdmin.count().catch(() => 0);
  return NextResponse.json({ needsSetup: count === 0 });
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, key, setup, name } = await req.json();

    // ── First-run setup: admin key proves ownership, creates the account ──
    if (setup) {
      if (!key || !keyMatches(key))
        return NextResponse.json({ error: "Invalid admin key" }, { status: 401 });
      if (!email?.trim() || !password || String(password).length < 8)
        return NextResponse.json({ error: "Email and a password of at least 8 characters are required" }, { status: 422 });
      const existing = await (registry as any).platformAdmin.count();
      if (existing > 0)
        return NextResponse.json({ error: "An admin account already exists — sign in with email and password" }, { status: 409 });
      await (registry as any).platformAdmin.create({
        data: {
          email: String(email).trim().toLowerCase(),
          name: name?.trim() || null,
          passwordHash: await bcrypt.hash(String(password), 12),
          lastLoginAt: new Date(),
        },
      });
      return sessionResponse({ ok: true, created: true });
    }

    // ── Email + password sign-in ──
    if (email) {
      const admin = await (registry as any).platformAdmin.findUnique({
        where: { email: String(email).trim().toLowerCase() },
      });
      const valid = admin && (await bcrypt.compare(String(password ?? ""), admin.passwordHash));
      if (!valid)
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      await (registry as any).platformAdmin
        .update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } })
        .catch(() => {});
      return sessionResponse();
    }

    // ── Legacy: raw admin key (recovery fallback) ──
    if (key) {
      if (!keyMatches(key))
        return NextResponse.json({ error: "Invalid key" }, { status: 401 });
      return sessionResponse();
    }

    return NextResponse.json({ error: "Provide email and password" }, { status: 422 });
  } catch (err) {
    console.error("[admin auth]", err);
    return NextResponse.json({ error: "Sign-in failed" }, { status: 500 });
  }
}
