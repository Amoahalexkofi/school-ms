import { NextRequest, NextResponse } from "next/server";
import { registry } from "@/lib/registry";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { requireNovalssAdmin } from "@/lib/auth/novalss";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireNovalssAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  try {
    const { newPassword } = await req.json();
    if (!newPassword || newPassword.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 422 });

    const school = await (registry as any).schoolTenant.findUnique({ where: { id } });
    if (!school) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const hash = await bcrypt.hash(newPassword, 12);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    const client = await pool.connect();

    try {
      await client.query(
        `UPDATE "${school.schemaName}"."User" SET password = $1, "updatedAt" = NOW() WHERE email = $2`,
        [hash, school.adminEmail]
      );
      return NextResponse.json({ ok: true });
    } finally {
      client.release();
      await pool.end();
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
