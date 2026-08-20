import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { audit } from "@/lib/services/audit";
import { generateTempPassword } from "@/lib/auth/passwords";
import bcrypt from "bcryptjs";

// Admin-issued credential reset. Staff accounts created without a real
// email (fallback: empXXXX@school.local) have no working "Forgot password"
// path — that flow emails a reset link to an address that can never
// receive it. This is the recovery route for that case: generate a new
// temp password, force a change on next login, and hand it back once so
// the admin can relay it to the staff member directly.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: staffId } = await params;
  const db = (await getDb()) as any;

  const staff = await db.staff.findUnique({
    where: { id: staffId },
    select: { userId: true, firstName: true, lastName: true, user: { select: { email: true, username: true } } },
  });
  if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

  const tempPassword = generateTempPassword();
  const password = await bcrypt.hash(tempPassword, 12);

  await db.user.update({
    where: { id: staff.userId },
    data: { password, mustChangePassword: true, resetToken: null, resetTokenExpiry: null },
  });

  await audit("reset_password", "staff", staffId, {});

  return NextResponse.json({
    tempPassword,
    email: staff.user?.email,
    username: staff.user?.username,
  });
}
