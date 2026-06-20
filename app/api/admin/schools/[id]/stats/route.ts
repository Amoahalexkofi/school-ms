import { NextRequest, NextResponse } from "next/server";
import { registry } from "@/lib/registry";
import { Pool } from "pg";
import { requireNovalssAdmin } from "@/lib/auth/novalss";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireNovalssAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  try {
    const school = await (registry as any).schoolTenant.findUnique({ where: { id } });
    if (!school) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    const client = await pool.connect();

    try {
      const [students, staff, sessions, lastLogin] = await Promise.all([
        client.query(`SELECT COUNT(*) FROM "${school.schemaName}"."Student" WHERE "isActive" = true`),
        client.query(`SELECT COUNT(*) FROM "${school.schemaName}"."Staff" WHERE "isActive" = true`),
        client.query(`SELECT COUNT(*) FROM "${school.schemaName}"."AcademicSession"`),
        client.query(`SELECT MAX("updatedAt") as last FROM "${school.schemaName}"."User"`),
      ]);

      return NextResponse.json({
        students: parseInt(students.rows[0].count),
        staff: parseInt(staff.rows[0].count),
        sessions: parseInt(sessions.rows[0].count),
        lastActive: lastLogin.rows[0]?.last ?? null,
      });
    } finally {
      client.release();
      await pool.end();
    }
  } catch (e: any) {
    console.error("[stats]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
