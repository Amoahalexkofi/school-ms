import { NextRequest, NextResponse } from "next/server";
import { submitApplication } from "@/lib/services/admissions";
import { isRateLimited } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { sendEmail, escapeHtml } from "@/lib/email";

// PUBLIC endpoint — unauthenticated prospective parents submit an admission
// application from /apply. Only POST is exposed here; listing/reviewing
// applications stays on the admin-gated /api/admissions route.
export async function POST(req: NextRequest) {
  // No session to key on (this is the whole point of a public form) — fall
  // back to IP, scoped per-tenant so one school's spam can't rate-limit
  // another school sharing an IP behind the same proxy/NAT.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const schema = req.headers.get("x-tenant-schema") ?? "unknown";
  if (isRateLimited(`admissions-apply:${schema}:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many applications submitted — please try again later" }, { status: 429 });
  }

  try {
    const { firstName, lastName, dateOfBirth, gender, classAppliedFor, parentName, parentPhone, parentEmail, address, notes } = await req.json();
    const app = await submitApplication({
      firstName, lastName,
      dateOfBirth: new Date(dateOfBirth),
      gender, classAppliedFor, parentName, parentPhone,
      parentEmail: parentEmail || undefined,
      address:     address     || undefined,
      notes:       notes       || undefined,
    });

    notifySchool(app).catch((err) => console.error("[admissions/apply] notification failed:", err));

    return NextResponse.json({ ok: true, id: app.id }, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}

// Best-effort — a slow or failed notification email should never fail the
// applicant's submission (their application is already saved by this point).
async function notifySchool(app: { firstName: string; lastName: string; classAppliedFor: string; parentName: string; parentPhone: string; parentEmail: string | null }) {
  const db = await getDb();
  const profile = await (db as any).schoolProfile.findFirst();
  if (!profile?.email) return;

  await sendEmail(db, {
    to: profile.email,
    subject: `New admission application — ${app.firstName} ${app.lastName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#111">
        <div style="background:#4f46e5;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">New Admission Application</h1>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">A prospective family applied through your school's website:</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#6b7280">Student</td><td style="padding:6px 0;font-weight:600">${escapeHtml(app.firstName)} ${escapeHtml(app.lastName)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Class applied for</td><td style="padding:6px 0;font-weight:600">${escapeHtml(app.classAppliedFor)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Parent / Guardian</td><td style="padding:6px 0;font-weight:600">${escapeHtml(app.parentName)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="padding:6px 0;font-weight:600">${escapeHtml(app.parentPhone)}</td></tr>
            ${app.parentEmail ? `<tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0;font-weight:600">${escapeHtml(app.parentEmail)}</td></tr>` : ""}
          </table>
          <p style="margin:24px 0 0;color:#6b7280;font-size:12px">Review and respond from Admissions in your Skula dashboard.</p>
        </div>
      </div>
    `,
  });
}
