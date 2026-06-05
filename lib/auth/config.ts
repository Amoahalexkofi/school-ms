import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getDbForSchema } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { neon } from "@neondatabase/serverless";

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "novalss.com";

async function resolveSchema(request: Request | undefined): Promise<string> {
  try {
    const novalssHost = request?.headers?.get("x-novalss-host");
    const forwardedHost = request?.headers?.get("x-forwarded-host");
    const host = request?.headers?.get("host");
    const rawHost = (novalssHost ?? forwardedHost ?? host ?? "").split(":")[0];

    if (rawHost.endsWith(`.${APP_DOMAIN}`)) {
      const subdomain = rawHost.slice(0, -(APP_DOMAIN.length + 1));
      if (subdomain && subdomain !== "www") {
        const sql = neon(process.env.DATABASE_URL!);
        const rows = await sql`
          SELECT "schemaName" FROM "SchoolTenant"
          WHERE subdomain = ${subdomain} AND status != 'suspended'
          LIMIT 1
        `;
        if (rows.length) return rows[0].schemaName as string;
      }
    }
  } catch { /* fall through to default */ }

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
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const schema = await resolveSchema(request as Request | undefined);
        const db = getDbForSchema(schema);
        const user = await (db as any).user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user) return null;

        const valid = await verifyPassword(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },
};
