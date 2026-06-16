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
    const r = await (sql as any).query(`SELECT * FROM "${schema}"."WebsiteHeroSlide" ORDER BY "order" ASC, "createdAt" ASC`);
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
    const countR = await (sql as any).query(`SELECT COUNT(*) AS cnt FROM "${schema}"."WebsiteHeroSlide"`);
    const order = parseInt((countR.rows ?? countR)[0]?.cnt ?? 0);
    const id = generateId();
    await (sql as any).query(
      `INSERT INTO "${schema}"."WebsiteHeroSlide" (id,title,subtitle,"imageUrl","ctaText","ctaLink","order","isActive","createdAt","updatedAt")
       VALUES($1,$2,$3,$4,$5,$6,$7,true,NOW(),NOW())`,
      [id, body.title, body.subtitle ?? null, body.imageUrl ?? null, body.ctaText ?? "Sign In to Portal", body.ctaLink ?? "/sign-in", order]
    );
    const r = await (sql as any).query(`SELECT * FROM "${schema}"."WebsiteHeroSlide" WHERE id=$1`, [id]);
    return NextResponse.json((r.rows ?? r)[0], { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const schema = await getSchema(req);
    const body = await req.json(); // expects { id, ...fields } or array of { id, order }
    const sql = neon(process.env.DATABASE_URL!);
    if (Array.isArray(body)) {
      // Reorder
      for (const { id, order } of body) {
        await (sql as any).query(`UPDATE "${schema}"."WebsiteHeroSlide" SET "order"=$1 WHERE id=$2`, [order, id]);
      }
    } else {
      await (sql as any).query(
        `UPDATE "${schema}"."WebsiteHeroSlide" SET title=$1,subtitle=$2,"imageUrl"=$3,"ctaText"=$4,"ctaLink"=$5,"isActive"=$6,"updatedAt"=NOW() WHERE id=$7`,
        [body.title, body.subtitle ?? null, body.imageUrl ?? null, body.ctaText ?? "Sign In to Portal", body.ctaLink ?? "/sign-in", body.isActive !== false, body.id]
      );
    }
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
    await (sql as any).query(`DELETE FROM "${schema}"."WebsiteHeroSlide" WHERE id=$1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
