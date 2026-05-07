import { compare, hash } from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Sifre", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user || !user.isActive) return null;

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.includes("/api/auth/error")) {
        return `${baseUrl}/login?error=Configuration`;
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user.role as UserRole | undefined) ?? UserRole.customer;
      }
      return session;
    },
  },
};

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Oturum gerekli.");
  }
  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireSession();
  if (!session.user.role || !roles.includes(session.user.role)) {
    throw new Error("Yetkisiz erisim.");
  }
  return session;
}

export function hashPassword(password: string) {
  return hash(password, 12);
}
