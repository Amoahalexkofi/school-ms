import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { testEmail } = await req.json();
  if (!testEmail) return NextResponse.json({ error: "testEmail is required" }, { status: 400 });

  const db = await getDb();

  const schoolProfile = await (db as any).schoolProfile.findFirst();
  const schoolName    = schoolProfile?.name ?? "Skula";

  const result = await sendEmail(db, {
    to: testEmail,
    subject: `Test email from ${schoolName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#111">
        <div style="background:#4f46e5;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">${schoolName}</h1>
          <p style="color:#c7d2fe;margin:4px 0 0;font-size:13px">Email Configuration Test</p>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Your SMTP configuration is working correctly.</p>
          <p style="margin:0 0 16px">Emails will now be sent for:</p>
          <ul style="margin:0 0 20px;padding-left:20px;line-height:1.8;color:#374151">
            <li>Password reset requests</li>
            <li>Fee payment receipts</li>
            <li>Bulk messages to staff, students &amp; parents</li>
          </ul>
          <p style="color:#9ca3af;font-size:12px;margin:0">
            Sent from ${schoolName} · Skula School Management
          </p>
        </div>
      </div>
    `,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Send failed" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
