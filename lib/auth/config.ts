import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/auth/password";
import { neon } from "@neondatabase/serverless";

const APP_DOMAINS = (process.env.NEXT_PUBLIC_APP_DOMAIN ?? "getskula.com")
  .split(",").map(d => d.trim()).filter(Boolean);

async function schemaForHost(rawHost: string): Promise<string | null> {
  const host = rawHost.split(":")[0];
  let subdomain: string | null = null;
  for (const domain of APP_DOMAINS) {
    if (host.endsWith(`.${domain}`)) {
      const sub = host.slice(0, -(domain.length + 1));
      if (sub && sub !== "www") { subdomain = sub; break; }
    }
  }
  if (!subdomain) return null;
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT "schemaName" FROM "SchoolTenant"
      WHERE subdomain = ${subdomain} AND status != 'suspended'
      LIMIT 1
    `;
    if (rows.length) return rows[0].schemaName as string;
  } catch {}
  return null;
}

async function resolveSchema(
  tenant: string | undefined,
  request: Request | undefined
): Promise<string> {
  // 1. tenant field passed from server component (most reliable)
  if (tenant) {
    const schema = await schemaForHost(tenant);
    if (schema) return schema;
  }
  // 2. headers on the request object
  const novalssHost = request?.headers?.get("x-novalss-host");
  const forwardedHost = request?.headers?.get("x-forwarded-host");
  const host = request?.headers?.get("host");
  for (const h of [novalssHost, forwardedHost, host]) {
    if (h) {
      const schema = await schemaForHost(h);
      if (schema) return schema;
    }
  }
  return process.env.DATABASE_SCHEMA ?? "public";
}

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenant: { label: "Tenant", type: "text" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Prefer x-tenant-schema set by middleware (proxy.ts) — most reliable
          // because it doesn't depend on APP_DOMAIN matching the actual host used.
          const schemaFromHeader = (request as Request | undefined)?.headers?.get("x-tenant-schema");
          const schema = schemaFromHeader
            ?? await resolveSchema(
                credentials.tenant as string | undefined,
                request as Request | undefined
              );

          const sql = neon(process.env.DATABASE_URL!);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await (sql as any).query(
            `SELECT u.id, u.email, u.password, u.role, u."isActive" AS "userActive",
                    s."isActive" AS "studentActive"
             FROM "${schema}"."User" u
             LEFT JOIN "${schema}"."Student" s ON s."userId" = u.id
             WHERE u.email = $1 LIMIT 1`,
            [credentials.email as string]
          );
          const rows: Record<string, unknown>[] = result.rows ?? result;

          if (!rows.length) return null;
          const user = rows[0];

          const valid = await verifyPassword(
            credentials.password as string,
            user.password as string
          );
          if (!valid) return null;

          // Disabled accounts cannot sign in — mirrors Smart School, which
          // gates login on both users.is_active and students.is_active.
          if (user.userActive === false) return null;
          if (user.role === "STUDENT" && user.studentActive === false) return null;

          return { id: user.id as string, email: user.email as string, role: user.role as string };
        } catch (e) {
          console.error("[authorize] error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id   = token.sub;
      }
      return session;
    },
  },
};
