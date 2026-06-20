import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isPublicRoute, canAccessRoute, canAccessApiRoute, type UserRole } from "@/lib/auth/middleware-utils";
import { neon } from "@neondatabase/serverless";

// ── Tenant detection ──────────────────────────────────────────────────────────

// Comma-separated list of base domains — subdomains of any are treated as school tenants
const APP_DOMAINS = (process.env.NEXT_PUBLIC_APP_DOMAIN ?? "getskula.com")
  .split(",").map(d => d.trim()).filter(Boolean);

// Cache subdomain → {schema, addons} lookups for 60 s to avoid a DB hit per request
type Tenant = { schema: string; addons: string };
const tenantCache = new Map<string, { tenant: Tenant; expiresAt: number }>();

async function getTenantForSubdomain(subdomain: string): Promise<Tenant | null> {
  const now = Date.now();
  const cached = tenantCache.get(subdomain);
  if (cached && cached.expiresAt > now) return cached.tenant;

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT "schemaName", "addons" FROM "SchoolTenant"
      WHERE subdomain = ${subdomain} AND status != 'suspended'
      LIMIT 1
    `;
    if (!rows.length) return null;
    const tenant: Tenant = { schema: rows[0].schemaName as string, addons: (rows[0].addons as string) ?? "" };
    tenantCache.set(subdomain, { tenant, expiresAt: now + 60_000 });
    return tenant;
  } catch {
    return null;
  }
}

function extractSubdomain(host: string): string | null {
  const withoutPort = host.split(":")[0];
  for (const domain of APP_DOMAINS) {
    if (withoutPort.endsWith(`.${domain}`)) {
      const sub = withoutPort.slice(0, -(domain.length + 1));
      if (sub && sub !== "www") return sub;
    }
  }
  return null;
}

// ── Main proxy ────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // x-novalss-host is set by the Cloudflare Worker (Vercel overwrites x-forwarded-host)
  const host = request.headers.get("x-novalss-host")
    ?? request.headers.get("x-forwarded-host")
    ?? request.headers.get("host")
    ?? "";
  const subdomain = extractSubdomain(host);

  // Build forwarded request headers
  const requestHeaders = new Headers(request.headers);
  // Expose pathname for server components (used by dashboard layout for onboarding check)
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  // Strip any client-supplied tenant headers (set authoritatively below).
  // Without this, a crafted request could spoof x-tenant-schema and read
  // another school's data, or x-tenant-addons to unlock paid add-ons.
  requestHeaders.delete("x-tenant-schema");
  requestHeaders.delete("x-tenant-addons");
  // Apex/non-tenant context (e.g. getskula.com demo) → all add-ons available
  requestHeaders.set("x-tenant-addons", "*");

  // Resolve tenant schema + enabled add-ons from subdomain
  if (subdomain) {
    const tenant = await getTenantForSubdomain(subdomain);
    if (!tenant) {
      return new NextResponse(
        `<html><body style="font-family:sans-serif;text-align:center;padding:80px;color:#374151">
          <h2 style="font-size:1.5rem;font-weight:700">School not found</h2>
          <p>No school is registered at <strong>${host}</strong>.</p>
          <p style="margin-top:1rem"><a href="https://${APP_DOMAINS[0]}/register" style="color:#2563eb">Register your school →</a></p>
        </body></html>`,
        { status: 404, headers: { "content-type": "text/html" } }
      );
    }
    requestHeaders.set("x-tenant-schema", tenant.schema);
    requestHeaders.set("x-tenant-addons", tenant.addons);
  }

  // Public routes bypass auth (schema header still forwarded)
  if (isPublicRoute(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Auth check
  const isSecure = request.url.startsWith("https://");
  const cookieName = isSecure
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    cookieName,
  });

  if (!token) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signIn);
  }

  const role = token.role as UserRole | undefined;

  // API routes: enforce role-based access (resource permission), 403 if denied.
  if (pathname.startsWith("/api/")) {
    if (!role || !canAccessApiRoute(pathname, role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!role || !canAccessRoute(pathname, role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
