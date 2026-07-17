import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { audit } from "@/lib/services/audit";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const db = await getDb();
    await (db as any).studentIncident.delete({ where: { id } });
    await audit("behaviour.delete_incident", "StudentIncident", id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
