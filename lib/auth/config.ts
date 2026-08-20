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

        // A nonexistent email returns almost instantly while a real one
        // falls through to the deliberately-slow bcrypt compare below —
        // that gap is itself a timing side-channel for email enumeration.
        // Floor every path (including the success path) to the same
        // minimum duration so response time alone can't distinguish them.
        const startedAt = Date.now();
        const MIN_RESPONSE_MS = 350;
        const finish = async <T>(result: T): Promise<T> => {
          const elapsed = Date.now() - startedAt;
          if (elapsed < MIN_RESPONSE_MS) await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed));
          return result;
        };

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
            `SELECT u.id, u.email, u.password, u.role, u.username, u."isActive" AS "userActive",
                    u."failedLoginAttempts", u."lockedUntil",
                    s."isActive" AS "studentActive",
                    s."firstName" AS "studentFirstName", s."lastName" AS "studentLastName",
                    st."firstName" AS "staffFirstName", st."lastName" AS "staffLastName"
             FROM "${schema}"."User" u
             LEFT JOIN "${schema}"."Student" s ON s."userId" = u.id
             LEFT JOIN "${schema}"."Staff" st ON st."userId" = u.id
             WHERE u.email = $1 LIMIT 1`,
            [credentials.email as string]
          );
          const rows: Record<string, unknown>[] = result.rows ?? result;

          if (!rows.length) return finish(null);
          const user = rows[0];

          // Brute-force lockout: 5 failed attempts locks the account for 15
          // minutes. Checked before the (deliberately slow) bcrypt compare so
          // a locked-out attacker isn't still paying — or benefiting from —
          // that cost, and rejected with the same generic failure as a wrong
          // password so a lockout can't be used to enumerate valid emails.
          const MAX_ATTEMPTS = 5;
          const LOCKOUT_MS = 15 * 60 * 1000;
          const lockedUntil = user.lockedUntil ? new Date(user.lockedUntil as string) : null;
          if (lockedUntil && lockedUntil.getTime() > Date.now()) return finish(null);

          const valid = await verifyPassword(
            credentials.password as string,
            user.password as string
          );
          if (!valid) {
            const attempts = Number(user.failedLoginAttempts ?? 0) + 1;
            const lockNow = attempts >= MAX_ATTEMPTS;
            await (sql as any).query(
              `UPDATE "${schema}"."User" SET "failedLoginAttempts" = $1, "lockedUntil" = $2 WHERE id = $3`,
              [lockNow ? 0 : attempts, lockNow ? new Date(Date.now() + LOCKOUT_MS) : null, user.id]
            );
            return finish(null);
          }

          // Disabled accounts cannot sign in — mirrors Smart School, which
          // gates login on both users.is_active and students.is_active.
          if (user.userActive === false) return finish(null);
          if (user.role === "STUDENT" && user.studentActive === false) return finish(null);

          if (Number(user.failedLoginAttempts ?? 0) > 0 || lockedUntil) {
            await (sql as any).query(
              `UPDATE "${schema}"."User" SET "failedLoginAttempts" = 0, "lockedUntil" = NULL WHERE id = $1`,
              [user.id]
            );
          }

          const staffName   = user.staffFirstName   ? `${user.staffFirstName} ${user.staffLastName ?? ""}`.trim()   : null;
          const studentName = user.studentFirstName ? `${user.studentFirstName} ${user.studentLastName ?? ""}`.trim() : null;
          const name = staffName || studentName || (user.username as string) || undefined;

          // schema travels into the JWT below (jwt callback) so every later
          // request can confirm this session actually belongs to whichever
          // tenant its subdomain resolves to — see proxy.ts. mustChangePassword
          // deliberately does NOT travel into the token — it's mutable within
          // a session's lifetime (cleared the moment the user changes their
          // password), so baking a snapshot into the JWT would leave someone
          // locked out of their own account after doing exactly what was
          // asked. proxy.ts checks it fresh (short-TTL cached) instead.
          return finish({ id: user.id as string, email: user.email as string, role: user.role as string, name, schema });
        } catch (e) {
          console.error("[authorize] error:", e);
          return finish(null);
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        // Binds this session to the tenant it was issued for — proxy.ts
        // rejects the token outright if a later request's resolved schema
        // (from its own subdomain/custom domain) doesn't match this.
        token.schema = (user as any).schema;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id   = token.sub;
      }
      return session;
    },
    // Auth.js's default redirect() only trusts URLs matching the single
    // configured NEXTAUTH_URL origin — everything else (including a school's
    // own subdomain, e.g. jonnyrichards.getskula.com) silently collapses to
    // baseUrl. That sent every sign-out back to the root marketing domain
    // instead of the tenant the user was actually on. Trust any absolute URL
    // whose host is the apex app domain or a subdomain of it.
    redirect({ url, baseUrl }) {
      try {
        const target = new URL(url, baseUrl);
        const isKnownDomain = APP_DOMAINS.some(
          (d) => target.hostname === d || target.hostname.endsWith(`.${d}`)
        );
        if (isKnownDomain) return target.toString();
      } catch {}
      return baseUrl;
    },
  },
};
