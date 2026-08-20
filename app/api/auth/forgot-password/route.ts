import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendEmail, passwordResetEmail } from "@/lib/email";

const EXPIRY_MS   = 60 * 60 * 1000;  // token valid 1 hour
const COOLDOWN_MS = 5 * 60 * 1000;   // don't re-send within 5 minutes of the last request
// Every response path is padded to at least this long, so "nonexistent
// email" / "cooldown active" / "actually sent" can't be told apart by
// response time alone — the fast branches were a measurable side-channel
// that defeated the intentionally generic {ok:true} response below.
const MIN_RESPONSE_MS = 500;

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const respond = async (body: any) => {
    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_RESPONSE_MS) await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed));
    return NextResponse.json(body);
  };

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const db = await getDb();
  const user = await (db as any).user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Always respond with success to avoid email enumeration
  if (!user || !user.isActive) {
    return respond({ ok: true });
  }

  // Cooldown, keyed off the token's own expiry so no new column/rate-limit
  // infra is needed: if the stored expiry is still close to a full window
  // out, a token was issued very recently — skip sending another one. This
  // caps how often this endpoint can be used to spam a single inbox.
  const recentlyIssued = user.resetTokenExpiry &&
    new Date(user.resetTokenExpiry).getTime() > Date.now() + (EXPIRY_MS - COOLDOWN_MS);
  if (recentlyIssued) {
    return respond({ ok: true });
  }

  // Generate a secure 32-byte token, valid for 1 hour (Smart School pattern)
  const token  = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + EXPIRY_MS);

  await (db as any).user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  const schoolProfile = await (db as any).schoolProfile.findFirst();
  const schoolName    = schoolProfile?.name ?? "Skula";

  // Build the reset link from a TRUSTED host only. The Host header is
  // attacker-controllable (reset-link poisoning), so validate it against our
  // allowed app domains and fall back to the primary domain otherwise.
  const appDomains = (process.env.NEXT_PUBLIC_APP_DOMAIN ?? "getskula.com")
    .split(",").map((d) => d.trim()).filter(Boolean);
  const rawHost = (req.headers.get("x-novalss-host") ?? req.headers.get("host") ?? "").split(":")[0];
  const hostOk = appDomains.some((d) => rawHost === d || rawHost.endsWith(`.${d}`));
  const host = hostOk && rawHost ? rawHost : appDomains[0];
  const protocol = host.includes("localhost") ? "http" : "https";
  const resetUrl = `${protocol}://${host}/reset-password/${token}`;

  await sendEmail(db, {
    to: user.email,
    subject: `Reset your password — ${schoolName}`,
    html: passwordResetEmail({ username: user.username, resetUrl, schoolName }),
  });

  // Never log the reset token (it grants account access).
  return respond({ ok: true });
}
