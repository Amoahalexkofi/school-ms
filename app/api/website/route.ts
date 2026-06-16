import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { generateId, ensureWebsiteTables } from "@/lib/website-utils";

async function getSchema(req: NextRequest) {
  return req.headers.get("x-tenant-schema") ?? process.env.DATABASE_SCHEMA ?? "public";
}

// GET — fetch settings
export async function GET(req: NextRequest) {
  try {
    const schema = await getSchema(req);
    const sql = neon(process.env.DATABASE_URL!);
    await ensureWebsiteTables(sql, schema);
    const r = await (sql as any).query(`SELECT * FROM "${schema}"."WebsiteSettings" LIMIT 1`);
    const rows = r.rows ?? r;
    return NextResponse.json(rows[0] ?? { primaryColor: "#6366f1", showStats: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST — upsert settings
export async function POST(req: NextRequest) {
  try {
    const schema = await getSchema(req);
    const body = await req.json();
    const sql = neon(process.env.DATABASE_URL!);
    await ensureWebsiteTables(sql, schema);
    const existing = await (sql as any).query(`SELECT id FROM "${schema}"."WebsiteSettings" LIMIT 1`);
    const rows = existing.rows ?? existing;
    if (rows.length) {
      await (sql as any).query(
        `UPDATE "${schema}"."WebsiteSettings" SET "aboutTitle"=$1,"aboutText"=$2,"primaryColor"=$3,"showStats"=$4,"updatedAt"=NOW() WHERE id=$5`,
        [body.aboutTitle ?? null, body.aboutText ?? null, body.primaryColor ?? "#6366f1", body.showStats !== false, rows[0].id]
      );
    } else {
      await (sql as any).query(
        `INSERT INTO "${schema}"."WebsiteSettings" (id,"aboutTitle","aboutText","primaryColor","showStats","updatedAt") VALUES($1,$2,$3,$4,$5,NOW())`,
        [generateId(), body.aboutTitle ?? null, body.aboutText ?? null, body.primaryColor ?? "#6366f1", body.showStats !== false]
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
