import { NextRequest, NextResponse } from "next/server";
import { registry } from "@/lib/registry";
import { requireNovalssAdmin } from "@/lib/auth/novalss";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireNovalssAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const events = await (registry as any).tenantBillingEvent.findMany({
    where: { tenantId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(events);
}

// "monthly" | "yearly" | "5yr" | "7yr"
function addCycle(base: Date, cycle: string): Date {
  const d = new Date(base);
  if (cycle === "yearly") d.setFullYear(d.getFullYear() + 1);
  else if (cycle === "5yr") d.setFullYear(d.getFullYear() + 5);
  else if (cycle === "7yr") d.setFullYear(d.getFullYear() + 7);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

// Logs a billing event. When type is "renewed" with a billingCycle, this also
// extends the tenant's subscriptionEndsAt in the same call — one click in the
// admin panel both records the payment and pushes the renewal date forward,
// instead of the admin doing that date math by hand every time.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireNovalssAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  try {
    const { type, billingCycle, amount, currency, note } = await req.json();
    if (!type) return NextResponse.json({ error: "type is required" }, { status: 422 });

    const tenant = await (registry as any).schoolTenant.findUnique({ where: { id } });
    if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const eventData: any = {
      tenantId: id,
      type,
      billingCycle: billingCycle || null,
      amount: amount || amount === 0 ? amount : null,
      currency: currency || "GHS",
      note: note || null,
    };

    const tenantUpdate: any = {};
    if (type === "renewed" && billingCycle) {
      const now = new Date();
      const base = tenant.subscriptionEndsAt && new Date(tenant.subscriptionEndsAt) > now
        ? new Date(tenant.subscriptionEndsAt)
        : now;
      tenantUpdate.subscriptionEndsAt = addCycle(base, billingCycle);
      tenantUpdate.billingCycle = billingCycle;
      if (!tenant.subscriptionStartsAt) tenantUpdate.subscriptionStartsAt = now;
    }

    const hasTenantUpdate = Object.keys(tenantUpdate).length > 0;
    const results = await (registry as any).$transaction([
      (registry as any).tenantBillingEvent.create({ data: eventData }),
      ...(hasTenantUpdate ? [(registry as any).schoolTenant.update({ where: { id }, data: tenantUpdate })] : []),
    ]);
    const [event, updatedTenant] = results;

    return NextResponse.json({ event, tenant: updatedTenant ?? null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
