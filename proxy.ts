import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isPublicRoute, canAccessRoute, canAccessApiRoute, type UserRole } from "@/lib/auth/middleware-utils";
import {
  ROLE_DEFAULTS, mergePerms, moduleForApiPath, actionForMethod,
  type PermissionMap,
} from "@/lib/permission-defaults";
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

// ── Permission-matrix enforcement (granular RBAC) ─────────────────────────────
// The Settings → Roles matrix (AppRole/RolePermission) drives the UI via
// PermissionsProvider; this enforces the SAME merged map server-side so hiding
// a button also blocks the API call. Only roles with ROLE_DEFAULTS entries are
// restricted (TEACHER/ACCOUNTANT/LIBRARIAN) — admins and unlisted roles pass.

type CustomPerm = { superAdmin: boolean; map: PermissionMap | null };
const permCache = new Map<string, { value: CustomPerm; expiresAt: number }>();

// Custom AppRole permissions for a user, aggregated to permission-GROUP codes
// (same aggregation as lib/services/permissions.ts getUserPermissions).
// Cached 60 s like tenant lookups; "error" on a DB blip.
async function getCustomPermMap(schema: string, userId: string): Promise<CustomPerm | "error"> {
  const key = `${schema}:${userId}`;
  const now = Date.now();
  const cached = permCache.get(key);
  if (cached && cached.expiresAt > now) return cached.value;

  try {
    const sql = neon(process.env.DATABASE_URL!);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (sql as any).query(
      `SELECT ar."isSuperAdmin", rp."canView", rp."canAdd", rp."canEdit", rp."canDelete",
              pg."shortCode" AS grp
       FROM "${schema}"."StaffAppRole" sar
       JOIN "${schema}"."Staff" st ON st.id = sar."staffId"
       JOIN "${schema}"."AppRole" ar ON ar.id = sar."roleId"
       LEFT JOIN "${schema}"."RolePermission" rp ON rp."roleId" = ar.id
       LEFT JOIN "${schema}"."PermissionCategory" pc ON pc.id = rp."permCatId"
       LEFT JOIN "${schema}"."PermissionGroup" pg ON pg.id = pc."permGroupId"
       WHERE st."userId" = $1`,
      [userId]
    );
    const rows: Record<string, unknown>[] = result.rows ?? result;

    let value: CustomPerm;
    if (!rows.length) {
      value = { superAdmin: false, map: null }; // no custom AppRole
    } else if (rows.some((r) => r.isSuperAdmin === true)) {
      value = { superAdmin: true, map: null };  // custom super-admin role → unrestricted
    } else {
      const map: PermissionMap = {};
      for (const r of rows) {
        const grp = r.grp as string | null;
        if (!grp) continue;
        const e = (map[grp] ??= { canView: false, canAdd: false, canEdit: false, canDelete: false });
        e.canView   = e.canView   || r.canView   === true;
        e.canAdd    = e.canAdd    || r.canAdd    === true;
        e.canEdit   = e.canEdit   || r.canEdit   === true;
        e.canDelete = e.canDelete || r.canDelete === true;
      }
      value = { superAdmin: false, map };
    }
    permCache.set(key, { value, expiresAt: now + 60_000 });
    return value;
  } catch {
    return "error";
  }
}

async function isApiCallPermitted(
  pathname: string, method: string, role: string, schema: string, userId: string
): Promise<boolean> {
  const defaults = ROLE_DEFAULTS[role];
  if (defaults === null || defaults === undefined) return true; // unrestricted role
  const module = moduleForApiPath(pathname);
  if (!module) return true; // unmapped route → coarse gate only

  const custom = await getCustomPermMap(schema, userId);
  if (custom !== "error" && custom.superAdmin) return true;
  // DB blip: fall back to role defaults so a transient error can't lock staff
  // out of modules their role always had (custom roles only ever ADD access).
  const merged = custom === "error" || !custom.map
    ? defaults
    : mergePerms(defaults, custom.map);

  return merged[module]?.[actionForMethod(method)] === true;
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
    // Granular permission matrix: same map that drives the UI (role defaults
    // merged with any custom AppRole) checked per module + HTTP method, so a
    // teacher whose UI hides "Delete" can't call DELETE /api/students either.
    const schema = requestHeaders.get("x-tenant-schema")
      ?? process.env.DATABASE_SCHEMA ?? "public";
    const userId = token.sub as string | undefined;
    if (userId && !(await isApiCallPermitted(pathname, request.method, role, schema, userId))) {
      return NextResponse.json({ error: "Forbidden — your role lacks this permission" }, { status: 403 });
    }
    // Online exams: students/parents may read exams and start/submit their OWN
    // attempt, but must never create, edit, publish or delete an exam. The
    // resource rule above lets STUDENT reach /api/online-exams (needed to take
    // exams), so gate mutations here by method. (/api/questions already excludes
    // students entirely.)
    if (
      pathname.startsWith("/api/online-exams") &&
      (role === "STUDENT" || role === "PARENT")
    ) {
      const method = request.method.toUpperCase();
      const isRead = method === "GET" || method === "HEAD" || method === "OPTIONS";
      const isOwnAttempt = pathname.includes("/attempt"); // start/submit own answers
      if (!isRead && !isOwnAttempt) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
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
