import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getDbForSchema } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";

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

        // Read tenant schema from the request header directly — more reliable
        // than headers() from next/headers in the NextAuth callback context
        const schema =
          (request as any)?.headers?.get?.("x-tenant-schema") ??
          process.env.DATABASE_SCHEMA ??
          "public";

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
