import { NextRequest, NextResponse } from "next/server";
import { registry } from "@/lib/registry";
import { deprovisionSchool } from "@/lib/provisioning";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const school = await (registry as any).schoolTenant.update({ where: { id }, data: body });
    return NextResponse.json(school);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const school = await (registry as any).schoolTenant.findUnique({ where: { id } });
    if (!school) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Drop the Postgres schema
    if (school.schemaName !== "public") {
      await deprovisionSchool(school.schemaName);
    }
    await (registry as any).schoolTenant.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
