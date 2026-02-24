import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!valid) {
          return null;
        }

        let photoUrl = null;
        let fullName = null;
        if (user.role === "PATIENT") {
          const patient = await prisma.patient.findUnique({
            where: { userId: user.id },
            select: { photoUrl: true, fullName: true },
          });
          photoUrl = patient?.photoUrl;
          fullName = patient?.fullName;
        } else if (user.role === "DOCTOR") {
          const doctor = await prisma.doctor.findUnique({
            where: { userId: user.id },
            select: { photoUrl: true, fullName: true },
          });
          photoUrl = doctor?.photoUrl;
          fullName = doctor?.fullName;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          image: photoUrl,
          name: fullName,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60,
    updateAge: 5 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if ("role" in user) {
          token.role = (user as { role?: string }).role;
        }
        if ("image" in user) {
          token.picture = (user as { image?: string }).image;
        }
        if ("name" in user) {
          token.name = (user as { name?: string }).name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const user = session.user as Record<string, unknown>;
        if (token.sub) {
          user.id = token.sub;
        }
        if (token.role) {
          user.role = token.role;
        }
        if (token.picture) {
          user.image = token.picture;
        }
        if (token.name) {
          user.name = token.name;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
