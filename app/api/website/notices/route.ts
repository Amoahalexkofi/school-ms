import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { generateId, ensureWebsiteTables } from "@/lib/website-utils";

async function getSchema(req: NextRequest) {
  return req.headers.get("x-tenant-schema") ?? process.env.DATABASE_SCHEMA ?? "public";
}

export async function GET(req: NextRequest) {
  try {
    const schema = await getSchema(req);
    const sql = neon(process.env.DATABASE_URL!);
    await ensureWebsiteTables(sql, schema);
    const r = await (sql as any).query(`SELECT * FROM "${schema}"."WebsiteNotice" ORDER BY "createdAt" DESC`);
    return NextResponse.json(r.rows ?? r);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const schema = await getSchema(req);
    const body = await req.json();
    const sql = neon(process.env.DATABASE_URL!);
    await ensureWebsiteTables(sql, schema);
    const id = generateId();
    await (sql as any).query(
      `INSERT INTO "${schema}"."WebsiteNotice" (id,title,body,type,"isActive","expiresAt","createdAt","updatedAt")
       VALUES($1,$2,$3,$4,true,$5,NOW(),NOW())`,
      [id, body.title, body.body ?? null, body.type ?? "info", body.expiresAt ?? null]
    );
    const r = await (sql as any).query(`SELECT * FROM "${schema}"."WebsiteNotice" WHERE id=$1`, [id]);
    return NextResponse.json((r.rows ?? r)[0], { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const schema = await getSchema(req);
    const body = await req.json();
    const sql = neon(process.env.DATABASE_URL!);
    await (sql as any).query(
      `UPDATE "${schema}"."WebsiteNotice" SET title=$1,body=$2,type=$3,"isActive"=$4,"expiresAt"=$5,"updatedAt"=NOW() WHERE id=$6`,
      [body.title, body.body ?? null, body.type ?? "info", body.isActive !== false, body.expiresAt ?? null, body.id]
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const schema = await getSchema(req);
    const { id } = await req.json();
    const sql = neon(process.env.DATABASE_URL!);
    await (sql as any).query(`DELETE FROM "${schema}"."WebsiteNotice" WHERE id=$1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
