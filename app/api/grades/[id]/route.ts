import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ALLOWED = ["examType","gradeName","percentFrom","percentTo","gradePoint","description","isActive"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  for (const key of ALLOWED) {
    if (key in body) {
      if (["percentFrom","percentTo","gradePoint"].includes(key) && body[key] !== undefined)
        data[key] = body[key] ? parseFloat(body[key]) : null;
      else data[key] = body[key] ?? null;
    }
  }
  return NextResponse.json(await ((await getDb()) as any).grade.update({ where: { id }, data }));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).grade.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
