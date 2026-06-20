import { NextRequest, NextResponse } from "next/server";
import { registry } from "@/lib/registry";
import { deprovisionSchool } from "@/lib/provisioning";
import { requireNovalssAdmin } from "@/lib/auth/novalss";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireNovalssAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  try {
    const { name, plan, status, adminEmail, adminName, phone, address, country, trialEndsAt, notes, customDomain, addons } = await req.json();
    const data: any = {};
    if (addons       !== undefined) data.addons       = Array.isArray(addons) ? addons.join(",") : (addons || "");
    if (name         !== undefined) data.name         = name         || null;
    if (plan         !== undefined) data.plan         = plan         || null;
    if (status       !== undefined) data.status       = status       || null;
    if (adminEmail   !== undefined) data.adminEmail   = adminEmail   || null;
    if (adminName    !== undefined) data.adminName    = adminName    || null;
    if (phone        !== undefined) data.phone        = phone        || null;
    if (address      !== undefined) data.address      = address      || null;
    if (country      !== undefined) data.country      = country      || "Ghana";
    if (notes        !== undefined) data.notes        = notes        || null;
    if (customDomain !== undefined) data.customDomain = customDomain || null;
    if (trialEndsAt  !== undefined && trialEndsAt) data.trialEndsAt = new Date(trialEndsAt);
    const school = await (registry as any).schoolTenant.update({ where: { id }, data });
    return NextResponse.json(school);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireNovalssAdmin(req);
  if (denied) return denied;
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
