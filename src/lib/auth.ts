import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDatabase, getSchema, ensureDatabase } from "./db";
import { verifyPassword, hashPassword, isLegacyHash } from "./password";
import { checkRateLimit, resetRateLimit } from "./rate-limit";
import { eq } from "drizzle-orm";

if (!process.env.NEXTAUTH_SECRET) {
  console.warn(
    "[SECURITY] NEXTAUTH_SECRET is not set. Using insecure default. Please set a strong secret in production."
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Enter username" },
        password: { label: "Password", type: "password", placeholder: "Enter password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const rateLimitResult = checkRateLimit(credentials.username);
        if (!rateLimitResult.allowed) {
          return null;
        }

        try {
          await ensureDatabase();
          const db = getDatabase();
          const s = getSchema();
          const result = await db
            .select()
            .from(s.users)
            .where(eq(s.users.username, credentials.username))
            .limit(1);

          const user = result[0];

          if (!user) {
            return null;
          }

          if (!verifyPassword(credentials.password, user.passwordHash)) {
            return null;
          }

          resetRateLimit(credentials.username);

          if (isLegacyHash(user.passwordHash)) {
            const newHash = hashPassword(credentials.password);
            await db
              .update(s.users)
              .set({ passwordHash: newHash, updatedAt: new Date() })
              .where(eq(s.users.id, user.id));
          }

          return {
            id: user.id,
            name: user.username,
            email: user.email || undefined,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
