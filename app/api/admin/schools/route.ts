import { NextRequest, NextResponse } from "next/server";
import { registry } from "@/lib/registry";
import { provisionSchool, makeSchemaName } from "@/lib/provisioning";
import { requireNovalssAdmin } from "@/lib/auth/novalss";

// GET — list all schools (platform admin only)
export async function GET(req: NextRequest) {
  const denied = requireNovalssAdmin(req);
  if (denied) return denied;
  try {
    const schools = await (registry as any).schoolTenant.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(schools);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// POST — provision a new school
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, subdomain, adminEmail, adminPassword, adminName, plan, phone, address, country } = body;

    if (!name || !subdomain || !adminEmail || !adminPassword)
      return NextResponse.json({ error: "name, subdomain, adminEmail, adminPassword required" }, { status: 422 });

    // Validate subdomain format
    if (!/^[a-z0-9-]+$/.test(subdomain))
      return NextResponse.json({ error: "Subdomain must be lowercase letters, numbers and hyphens only" }, { status: 422 });

    // Check subdomain not taken
    const existing = await (registry as any).schoolTenant.findUnique({ where: { subdomain } });
    if (existing)
      return NextResponse.json({ error: "Subdomain already taken" }, { status: 409 });

    const schemaName = makeSchemaName(subdomain);

    // Create registry entry first
    const school = await (registry as any).schoolTenant.create({
      data: {
        name,
        subdomain,
        schemaName,
        plan: plan ?? "trial",
        status: "trial",
        adminEmail,
        adminName: adminName ?? "",
        phone: phone ?? null,
        address: address ?? null,
        country: country ?? "Ghana",
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Provision the Postgres schema + tables + admin user
    await provisionSchool({
      schemaName,
      schoolName: name,
      adminEmail,
      adminPassword,
      adminName: adminName ?? adminEmail.split("@")[0],
      phone: phone ?? null,
      address: address ?? null,
      country: country ?? "Ghana",
    });

    return NextResponse.json(school, { status: 201 });
  } catch (e: any) {
    console.error(e);
    // Clean up registry entry if provisioning failed
    return NextResponse.json({ error: e.message ?? "Provisioning failed" }, { status: 500 });
  }
}
